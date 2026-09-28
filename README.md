# blp-node-express-ts-clean-ddd

REST API template: **Express 5 + TypeScript + Prisma 7 (PostgreSQL)**, structured with **Clean Architecture + DDD**.
The `example` module implements every layer end to end — copy it to start a new module.

## Tech stack

| Area        | Uses                                                        |
| ----------- | ----------------------------------------------------------- |
| Runtime     | Node.js `^20.19 \|\| ^22.12 \|\| >=24` (ESM)                |
| HTTP        | Express 5                                                   |
| ORM         | Prisma 7 + `@prisma/adapter-pg`                             |
| Validation  | zod (presentation layer and config only)                    |
| Test        | vitest + `@vitest/coverage-v8`                              |
| Lint/Format | oxlint + prettier                                           |
| Git hooks   | husky: commitlint (commit-msg) + coverage gate (pre-commit) |

## Getting started

```bash
npm install
cp .env.example .env          # point DATABASE_URL at your Postgres
npm run db:deploy             # create tables from prisma/migrations
npm run dev                   # http://localhost:3000
```

Check it is up: `curl localhost:3000/health`

### Environment variables

| Variable       | Required | Default       | Purpose                                     |
| -------------- | -------- | ------------- | ------------------------------------------- |
| `DATABASE_URL` | ✅       | –             | PostgreSQL connection string                |
| `PORT`         |          | `3000`        | Server port                                 |
| `NODE_ENV`     |          | `development` | `development` / `test` / `production`       |
| `PER_PAGE`     |          | `30`          | Page size when the request has no `perPage` |

Values are validated with zod at startup ([src/config/env.schema.ts](src/config/env.schema.ts)); the app exits on invalid config.
The `JWT_*` variables in `.env.example` are not used yet (reserved for auth).

## Scripts

| Command                           | What it does                                                      |
| --------------------------------- | ----------------------------------------------------------------- |
| `npm run dev`                     | Generate the Prisma client, then run in watch mode (tsx)          |
| `npm run build`                   | Generate + compile to `dist/` (excludes specs and `testing/`)     |
| `npm start`                       | Run `dist/main.js`                                                |
| `npm run typecheck`               | `tsc --noEmit` over `src` and the config files                    |
| `npm test`                        | Run all unit tests                                                |
| `npm run test:watch`              | Tests in watch mode                                               |
| `npm run test:coverage`           | Whole-project coverage (HTML report in `coverage/`)               |
| `npm run coverage:staged`         | Coverage gate for staged files only (what pre-commit runs)        |
| `npm run lint` / `lint:fix`       | oxlint                                                            |
| `npm run format` / `format:check` | prettier                                                          |
| `npm run db:generate`             | Generate the Prisma client                                        |
| `npm run db:migrate`              | Create/apply migrations during development (`prisma migrate dev`) |
| `npm run db:deploy`               | Apply existing migrations (CI / production)                       |
| `npm run db:studio`               | Open Prisma Studio                                                |

## Project structure

```
src/
├── main.ts                 # composition root: builds the Prisma client, wires modules, starts the server
├── app.ts                  # Express app: mounts modules at /api/v1/<module>, /health, error handler
├── config/                 # env.schema.ts (zod) + env.ts (loads .env)
├── architecture.spec.ts    # test enforcing the dependency rule between layers
├── error-codes.registry.ts # reserved error-code block per module
├── error-codes.spec.ts     # test enforcing unique codes inside reserved blocks
├── shared/                 # shared kernel — must not import from modules
│   ├── domain/             # Entity, AggregateRoot, ValueObject, DomainEvent, IdGenerator,
│   │                       # pagination (PageRequest/Page), exceptions (DomainException, generic ErrorCodes)
│   ├── application/        # UseCase, BaseDto
│   ├── infrastructure/     # Prisma client, BaseRepository (soft delete + paginate), UuidGenerator
│   └── presentation/       # exceptionFilter, validate (zod), ApiResource, toPaginated, paginateQuerySchema
└── modules/example/
    ├── domain/             # Example (aggregate), ExampleRepository (interface), ExampleException, events
    ├── application/        # one file per use case + ExampleDto
    ├── infrastructure/     # PrismaExampleRepository, ExampleMapper
    ├── presentation/http/  # controller, routes, zod schemas
    ├── testing/            # test factories/mocks (not built)
    └── index.ts            # wires the module — the only place that knows concrete classes
```

### Dependency rule

```
presentation → application → domain ← infrastructure
```

| Layer          | May import                    | Must not import                                         |
| -------------- | ----------------------------- | ------------------------------------------------------- |
| domain         | domain only                   | other layers, third-party packages (express/zod/prisma) |
| application    | domain, application           | infrastructure, presentation, third-party packages      |
| infrastructure | domain, application, packages | presentation                                            |
| presentation   | application, domain, packages | infrastructure                                          |

Also: `shared` must not import from `modules`, and a module must not import another module.
All of this is enforced by [src/architecture.spec.ts](src/architecture.spec.ts) — an import in the wrong direction fails the test.

### Naming

- Files: kebab-case with a role suffix — `*.entity.ts`, `*.repository.ts`, `*.use-case.ts`, `*.mapper.ts`, `*.controller.ts`, `*.routes.ts`, `*.schemas.ts`, `*.exception.ts`, `*.dto.ts`
- Tests: `*.spec.ts` next to the file under test
- Internal imports use relative paths ending in `.js` (ESM + `nodenext`) — no path aliases

## API

Every module is served under `/api/v1/<module>`. The `example` module:

| Method   | Path                   | Body / Query         |
| -------- | ---------------------- | -------------------- |
| `POST`   | `/api/v1/examples`     | `{ "name": "Ann" }`  |
| `GET`    | `/api/v1/examples`     | `?page=1&perPage=10` |
| `GET`    | `/api/v1/examples/:id` | –                    |
| `PATCH`  | `/api/v1/examples/:id` | `{ "name": "Anna" }` |
| `DELETE` | `/api/v1/examples/:id` | – (soft delete)      |
| `GET`    | `/health`              | –                    |

### Responses

Success:

```json
{ "data": { "id": "…", "name": "Ann" }, "status": { "code": 200, "message": "OK" } }
```

List (with `meta` and `links`):

```json
{
  "data": [ … ],
  "meta": { "itemCount": 10, "totalItems": 42, "itemsPerPage": 10, "totalPages": 5, "currentPage": 1 },
  "links": { "first": "/api/v1/examples?page=1&perPage=10", "previous": "", "next": "…page=2…", "last": "…page=5…" },
  "status": { "code": 200, "message": "OK" }
}
```

Error:

```json
{
	"status": { "code": 404, "message": "Not Found" },
	"error": { "code": 100101, "message": "EXAMPLE_NOT_FOUND", "errors": [] }
}
```

### Error handling

The domain throws a `DomainException` with a `kind` and knows nothing about HTTP. The presentation layer maps kinds to status codes in one place: `httpStatusByKind` in [exception.filter.ts](src/shared/presentation/filters/exception.filter.ts).

| Kind / cause                 | HTTP | Error code                 |
| ---------------------------- | ---- | -------------------------- |
| `VALIDATION` (incl. zod)     | 422  | 900422 or the module's own |
| `NOT_FOUND`                  | 404  | module's own               |
| `CONFLICT`                   | 409  | module's own               |
| `BUSINESS_RULE`              | 422  | module's own               |
| Malformed JSON / Express 4xx | 4xx  | 900423 (401/403 → 900403)  |
| Unknown route                | 404  | 0                          |
| Anything unexpected          | 500  | 0                          |

**Error codes:** generic codes live in [error-codes.constant.ts](src/shared/domain/exceptions/error-codes.constant.ts) (0, 900xxx).
Module codes live in the module itself, in `modules/<name>/domain/<name>.exception.ts` (exported as `<Name>ErrorCode`).
Each module owns **one block of 100 codes**, reserved in [src/error-codes.registry.ts](src/error-codes.registry.ts) — the single list of who owns which block:

```ts
export const ErrorCodeRegistry = {
	example: 1001, // codes 100100–100199
};
```

Reserve a block there first; a block can be reserved before its module exists.
[src/error-codes.spec.ts](src/error-codes.spec.ts) fails when a code is reused, a module has codes but no reservation, a code falls outside its module's block, two modules reserve the same block, or a reservation takes a shared block (0, 900xxx).

## Database

- Schema: [prisma/schema.prisma](prisma/schema.prisma) — the client is generated into `src/shared/infrastructure/persistence/prisma/generated` (gitignored)
- Every table must have the base columns from [base.entity.ts](src/shared/infrastructure/persistence/entities/base.entity.ts):
  `id`, `createdDate`, `createdBy`, `updatedDate`, `updatedBy`, `isActive`, `deletedDate`, `deletedBy`
- Deletes are **soft deletes** (`deletedDate`) — `BaseRepository` filters on `deletedDate: null` in every query
- After changing the schema, run `npm run db:migrate -- --name <name>` and commit the files in `prisma/migrations`

## Adding a module

Using an `order` module as the example:

1. **Error codes** — reserve a free block in [src/error-codes.registry.ts](src/error-codes.registry.ts), e.g. `order: 1002`
2. **Prisma** — add `model Order` (with the base columns and `@@map("orders")`) → `npm run db:migrate -- --name add_order`
3. **domain** — `order.entity.ts` (aggregate: `create`/`reconstitute` + business rules), `order.repository.ts` (interface),
   `order.exception.ts` (`OrderErrorCode` + `OrderException`, codes inside the reserved block)
4. **application** — `order.dto.ts` (`extends BaseDto`) and one `*.use-case.ts` per use case (takes the repository interface via the constructor)
5. **infrastructure** — `order.mapper.ts`, `prisma-order.repository.ts` (`extends BaseRepository`, `implements OrderRepository`)
6. **presentation/http** — `order.schemas.ts` (zod), `order.controller.ts` (`validate` → use case → `ApiResource.send`), `order.routes.ts`
7. **index.ts** — `createOrderModule(deps)` wires everything and returns a `Router`
8. **main.ts** — `createApp({ examples: …, orders: createOrderModule({ prisma, ids }) })` → served at `/api/v1/orders`
9. **tests** — `testing/order.factory.ts` plus a `*.spec.ts` next to each file (use `modules/example` as the reference)

## Testing & quality gates

- Unit tests use vitest (globals) — repositories are mocked with `vi.fn()`, fixtures are factories in `testing/`
- HTTP tests run the real app with `listen(0)` + `fetch` and mocked use cases — no database needed
- **commit-msg**: commitlint ([commitlint.config.ts](commitlint.config.ts)) — Conventional Commits, e.g. `feat(example): add soft delete`
- **pre-commit**: [scripts/check-staged-coverage.mjs](scripts/check-staged-coverage.mjs) — runs the full suite and requires **≥ 70% line coverage** for every staged file in `src` (override with `MIN_COVERAGE=80 git commit …`)

> Hooks are installed by `npm install` (the `prepare` script) and only work inside a git repository.
