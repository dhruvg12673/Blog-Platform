# Secure Blog Platform

A production-ready, full-stack blog platform with user authentication, private dashboard, public feed, likes, and comments.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon, Supabase, Railway, or local)

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

Backend runs at `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install

# Copy and configure environment
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL=http://localhost:3001

# Start development server
npm run dev
```

Frontend runs at `http://localhost:3000`

### Environment Variables

**Backend `.env`:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/blogplatform"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## Architecture

### Backend (NestJS)

```
src/
├── main.ts                    # Entry point, CORS, validation pipe
├── app.module.ts              # Root module
├── prisma/
│   ├── prisma.service.ts      # PrismaClient singleton
│   └── prisma.module.ts       # Global Prisma module
├── auth/
│   ├── auth.module.ts         # JWT + Passport setup
│   ├── auth.controller.ts     # POST /auth/register, /login, GET /auth/me
│   ├── auth.service.ts        # bcrypt hashing, JWT signing
│   ├── auth.dto.ts            # RegisterDto, LoginDto (class-validator)
│   └── jwt.strategy.ts        # Passport JWT strategy
├── blog/
│   ├── blog.module.ts
│   ├── blog.controller.ts     # Protected CRUD + like/comment endpoints
│   ├── blog.service.ts        # Business logic, slug generation
│   └── blog.dto.ts            # CreateBlogDto, UpdateBlogDto, CreateCommentDto
├── public/
│   ├── public.module.ts
│   ├── public.controller.ts   # GET /public/feed, /public/blogs/:slug
│   └── public.service.ts      # Optimized queries with N+1 prevention
└── common/
    ├── guards/
    │   └── jwt-auth.guard.ts  # Extends AuthGuard('jwt')
    └── decorators/
        └── current-user.decorator.ts  # Extract JWT payload from request
```

**Key Design Decisions:**
- `PrismaModule` is `@Global()` — injected everywhere without re-importing
- All queries use `select` to avoid over-fetching
- Feed endpoint uses `Promise.all` for parallel count + data queries
- `_count` relations used for like/comment counts — zero N+1 issues
- Slug generation is idempotent: append timestamp on collision
- `class-validator` DTOs with strict `ValidationPipe(whitelist: true)`

### Frontend (Next.js 15 App Router)

```
src/
├── app/
│   ├── layout.tsx             # Root layout with AuthProvider + Navbar
│   ├── globals.css            # Design system (CSS variables, components)
│   ├── page.tsx               # Landing page
│   ├── login/page.tsx         # Login form
│   ├── register/page.tsx      # Registration form
│   ├── feed/page.tsx          # Public feed with pagination
│   ├── blog/[slug]/page.tsx   # Public blog detail
│   └── dashboard/
│       ├── page.tsx           # Blog management table
│       ├── new/page.tsx       # Create blog form
│       └── edit/[id]/page.tsx # Edit blog form
├── components/
│   ├── Navbar.tsx             # Responsive nav, auth-aware
│   ├── BlogCard.tsx           # Feed card with metadata
│   ├── LikeButton.tsx         # Optimistic like toggle
│   ├── CommentList.tsx        # Real-time comment submission
│   └── ProtectedRoute.tsx     # Client-side auth guard
├── lib/
│   ├── api.ts                 # API abstraction layer (all fetch calls)
│   └── auth-context.tsx       # React context for auth state
└── types/
    └── index.ts               # Shared TypeScript interfaces
```

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login, returns JWT |
| GET | /auth/me | Yes | Get current user |

### Blogs (Private)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /blogs | Yes | List my blogs |
| GET | /blogs/:id | Yes | Get my blog by ID |
| POST | /blogs | Yes | Create blog |
| PATCH | /blogs/:id | Yes | Update blog (owner only) |
| DELETE | /blogs/:id | Yes | Delete blog (owner only) |
| POST | /blogs/:id/like | Yes | Toggle like |
| GET | /blogs/:id/like | Yes | Get like status |
| POST | /blogs/:id/comments | Yes | Add comment |
| GET | /blogs/:id/comments | Yes | Get comments |

### Public
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /public/feed | No | Paginated feed |
| GET | /public/blogs/:slug | No | Blog by slug (published only) |

---

## Database Schema

```prisma
User       { id, email (unique), passwordHash, name, createdAt }
Blog       { id, userId, title, slug (unique), content, summary, isPublished, createdAt, updatedAt }
Like       { id, userId, blogId, createdAt } — unique(userId, blogId)
Comment    { id, blogId, userId, content, createdAt } — indexed(blogId, createdAt)
```

---

## Tradeoffs Made

**JWT stored in localStorage** — Simple to implement, works universally. Production alternative: httpOnly cookies with a refresh token endpoint.

**No Redis/BullMQ** — Async job processing was optional. The architecture is ready for it: Blog service's `createBlog` can easily enqueue a summarization job.

**Plain text content** — No markdown/rich-text editor. Adding a rich-text editor (Tiptap, Quill) is straightforward — just store the serialized HTML/JSON in `content`.

**No email verification** — Skipped for speed. In production, add a `verifiedAt` field and send verification emails via SendGrid/Resend.

**Client-side auth guard** — `ProtectedRoute` uses `useEffect` + `router.replace`. For production, Next.js middleware (`middleware.ts`) provides server-side protection.

---

## Scaling to 1 Million Users

### Database
- **Read replicas**: Separate read (feed queries) from write (auth, post creation) connections
- **Connection pooling**: PgBouncer or Prisma Accelerate
- **Indexing**: Already have `(isPublished, createdAt)` composite index for feed; add full-text search index on title/content
- **Caching layer**: Redis for feed results (5-min TTL), like counts, comment counts

### Backend
- **Horizontal scaling**: NestJS is stateless — scale to N instances behind a load balancer
- **Rate limiting**: `@nestjs/throttler` with Redis store for distributed rate limiting
- **CDN**: Serve static assets and cache public API responses at the edge
- **Async jobs**: BullMQ + Redis for background tasks (summary generation, emails, notifications)
- **Search**: Elasticsearch or Typesense for full-text blog search at scale

### Frontend
- **Edge rendering**: Deploy Next.js on Vercel with Edge Functions for auth middleware
- **ISR / SSG**: Statically generate popular blog posts, revalidate on publish
- **Image CDN**: Cloudflare Images or Vercel Blob for author avatars

### Observability
- Structured logging (Pino) with correlation IDs
- Metrics: Prometheus + Grafana
- Tracing: OpenTelemetry → Datadog / Honeycomb
- Error tracking: Sentry

---

## Deployment

**Frontend**: Vercel (zero-config Next.js deployment)

**Backend**: Railway, Render, or Fly.io
```bash
# Build
npm run build

# Set env vars in dashboard, then:
npm run start:prod
```

**Database**: Neon (serverless Postgres) or Supabase
```bash
# Run migrations in production
npx prisma migrate deploy
```
