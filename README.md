# RTX Notion — Self-Hosted Collaborative Workspace

A production-ready, real-time collaborative workspace built with Next.js 14, TipTap, Yjs CRDTs, and PostgreSQL.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm 10+

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd rtxnotion
npm install --legacy-peer-deps
```

### 2. Environment Variables
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Database Setup
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to DB
npm run db:seed        # Seed initial data (optional)
```

### 4. Run Development Servers
```bash
npm run dev:all        # Starts Next.js (port 3000) + WebSocket server (port 3001)
```

Or separately:
```bash
npm run dev            # Next.js on :3000
npm run ws:dev         # WebSocket server on :3001
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Browser (Next.js 14)          │
│  ┌─────────────────────────────────┐   │
│  │  TipTap Editor + Yjs Y.Doc      │   │
│  │  ↕ Binary CRDT updates (WS)     │   │
│  └─────────────────────────────────┘   │
└───────────────┬────────────────────────┘
                │ WebSocket (port 3001)
┌───────────────▼────────────────────────┐
│       Socket.io WebSocket Server        │
│  • In-memory Y.Doc registry            │
│  • Yjs update relay + awareness        │
│  • Presence tracking per page          │
│  • Debounced PostgreSQL persistence    │
└───────────────┬────────────────────────┘
                │ Prisma ORM
┌───────────────▼────────────────────────┐
│            PostgreSQL                   │
│  • 19 models (pages, workspaces, ...)  │
│  • JSONB content columns               │
│  • Full page version history           │
└────────────────────────────────────────┘
```

## 📁 Project Structure

```
rtxnotion/
├── app/
│   ├── (auth)/login, register       # Auth pages
│   ├── (main)/[workspaceSlug]/      # Main workspace UI
│   │   ├── [pageId]/page.tsx        # Individual page
│   │   ├── settings/members/        # Member management
│   │   └── layout.tsx               # Workspace shell
│   ├── api/                         # REST API routes (12 endpoints)
│   ├── dashboard/                   # Post-login redirect
│   ├── invite/[token]/              # Invite landing
│   └── onboarding/                  # Workspace creation
├── components/
│   ├── editor/                      # TipTap editor system
│   │   ├── Editor.tsx               # Main editor component
│   │   ├── BubbleToolbar.tsx        # Selection formatting toolbar
│   │   ├── SlashCommandMenu.tsx     # "/" block picker (12 block types)
│   │   ├── CollabCursors.tsx        # Real-time cursor rendering
│   │   ├── useYjsProvider.ts        # Yjs + Socket.io sync hook
│   │   └── extensions/              # Custom TipTap extensions
│   ├── sidebar/                     # Navigation sidebar (5 components)
│   ├── page/                        # Page header + view shell
│   ├── presence/                    # Live user avatar stack
│   ├── modals/                      # Command palette (⌘K)
│   ├── workspace/                   # Workspace shell + home
│   ├── settings/                    # Members management
│   └── ui/                          # shadcn/ui primitives
├── server/
│   └── ws-server.ts                 # Standalone WebSocket server
├── store/                           # Zustand state stores
│   ├── workspaceStore.ts
│   ├── pageStore.ts
│   ├── presenceStore.ts
│   └── uiStore.ts
├── hooks/                           # Custom React hooks
│   ├── useSocket.ts                 # Singleton Socket.io hook
│   ├── usePresence.ts               # Page presence management
│   ├── usePageTree.ts               # Workspace page tree fetcher
│   ├── useUpload.ts                 # File upload with progress
│   └── useDebounce.ts               # Generic debounce
├── lib/                             # Utilities & config
├── prisma/                          # Database schema (19 models)
├── types/                           # Shared TypeScript interfaces
└── middleware.ts                    # Auth route protection
```

## ✨ Features

### Real-time Collaboration
- **Yjs CRDT** — Conflict-free document merging across all connected clients
- **Collaboration cursors** — See other users' cursors with colored name labels
- **Live presence** — Stacked avatar stack showing who's on each page
- **Awareness protocol** — Typing indicators via Yjs awareness

### Block Editor (TipTap)
- **12 block types** via `/` slash command menu
- **Bubble toolbar** for text formatting (bold, italic, underline, strike, links, highlight)
- **Syntax highlighting** in code blocks via lowlight
- **Tables** with column resizing
- **Task lists** with nested checkboxes
- **Image upload** — drag-drop or file picker
- **Auto-save** — debounced 2s saves + Ctrl+S manual save

### Workspace Management
- Multiple workspaces per user
- Role-based access (Admin, Editor, Viewer)
- Invite links with expiration and use limits
- Page hierarchy (recursive nesting)
- Page version history

### UI & UX
- **⌘K command palette** — instant search + create
- **Resizable sidebar** with workspace switcher
- Dark / light / system theme
- Cover images + emoji icons on pages
- Keyboard-first navigation

---

## 🔌 Environment Variables

See `.env.example` for all required variables.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random 32-char string
- `NEXTAUTH_URL` — Your app's public URL
- `NEXT_PUBLIC_WS_URL` — WebSocket server URL (default: http://localhost:3001)

---

## 🚢 Deployment

### Docker Compose (recommended)
```yaml
# docker-compose.yml coming soon
```

### Manual
1. Build: `npm run build`
2. Start Next.js: `npm start`
3. Start WS: `node server/ws-server.ts`

---

## 📄 License

MIT — Self-host freely.
