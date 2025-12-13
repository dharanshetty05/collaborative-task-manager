# My Project Decisions 

- Database: PostgreSQL
- ORM: Prisma
- Backend: Node.js + Express + TypeScript
- Authentication: JWT stored in HttpOnly cookies
- Validation: Zod
- Frontend State Management: React Query
- Real-time Communication: Socket.io
  - Socket events emitted only from REST API side-effects
  - No direct DB writes via sockets

Fixed decisions until any critical blocker appears.