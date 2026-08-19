# CLAUDE.md

This file is the project guide that Claude Code reads automatically at the start of every session.
It has two parts: (1) how-to-work principles (Karpathy style), (2) project context.

---

## 1. How to work

### Think before coding
- Don't assume. If unsure, ask first.
- If there are multiple interpretations, present all of them.
- If there's a simpler way, say so.
- If something is unclear, stop and point out what's confusing.

### Simplicity first
- Write only the minimal code that solves the problem. No speculative code.
- Don't add features that weren't requested.
- Don't add abstractions to one-off code.
- Don't add "flexibility" that wasn't asked for.
- Don't add exception handling for situations that can't happen.
- If 200 lines can become 50, rewrite it.

### Minimal change (like surgery)
- Touch only what's strictly necessary.
- Don't arbitrarily "improve" surrounding code or formatting.
- Don't refactor what isn't broken.
- Follow the existing style even if you'd write it differently.
- If you find dead code, don't delete it — just mention it.

### Goal-driven execution
- Define success criteria and iterate until they're verified.
- "Add validation" → "write the test first, then make it pass"
- "Fix a bug" → "reproduce it with a test, then fix it"
- "Refactor" → "confirm tests pass before and after the refactor"

---

## 2. Project context

### Tech stack
- **Language**: Java 25 (LTS)
- **Framework**: Spring Boot 3.x (Spring Framework 6.x)
- **Build tool**: Gradle (Kotlin DSL, `build.gradle.kts`)
- **ORM / data access**: Spring Data JPA (Hibernate)
- **Frontend**: React + TypeScript + Vite (`frontend/`, separate from the backend). In development it connects via the Vite proxy (`/api` → `localhost:8080`), so no CORS configuration is needed.
- **Database**: Altibase
  - JDBC driver class: `Altibase.jdbc.driver.AltibaseDriver`
  - Hibernate dialect: `org.hibernate.community.dialect.AltibaseDialect`
    (requires the `hibernate-community-dialects` module from Hibernate 6.4+)
  - Default port: `20300`
  - **Note**: The Altibase JDBC driver (`Altibase.jar`) is not on Maven Central. Put it in `libs/` and add it as a
    local dependency (`runtimeOnly(fileTree("libs"))` in `build.gradle.kts`). The current driver is **8.1** — see
    "Running Altibase locally (Docker)" below for why and how to obtain it.
  - To swap the DB, only this section, the `build.gradle.kts` driver, and each `application-*.yml` need changing.

### Build / run / test commands
```bash
# Build (Gradle)
./gradlew build

# Test
./gradlew test

# Run locally (local profile)
./gradlew bootRun --args='--spring.profiles.active=local'

# Run dev
./gradlew bootRun --args='--spring.profiles.active=dev'

# Frontend dev server (:5173)
cd frontend && npm run dev
```

### Environment separation (Profiles)
There are only two environments: `local` and `dev`.

- `src/main/resources/application.yml` — common settings + default `spring.profiles.active`
- `src/main/resources/application-local.yml` — local development (personal machine / local DB)
- `src/main/resources/application-dev.yml` — dev server environment

Rules:
- Keep common settings only in `application.yml`; put values that differ per environment (DB connection info, log levels, etc.) only in the per-profile files.
- Don't hardcode passwords/secrets in yml; inject them via environment variables (`${DB_PASSWORD}`, etc.).
- Select the active profile at runtime with `--spring.profiles.active=local|dev`.

Example (`application-local.yml`):
```yaml
spring:
  datasource:
    url: jdbc:Altibase://localhost:20300/mydb
    username: ${DB_USERNAME:sys}
    password: ${DB_PASSWORD:manager}
    driver-class-name: Altibase.jdbc.driver.AltibaseDriver
  jpa:
    hibernate:
      ddl-auto: update   # local only. Prefer validate for dev/production.
    properties:
      hibernate:
        dialect: org.hibernate.community.dialect.AltibaseDialect
    show-sql: true
```

### Running Altibase locally (Docker)

The local dev DB runs as a Docker container (`docker-compose.yml`). Altibase is hard to install natively on
macOS (Apple Silicon), so an amd64 image is run under emulation.

```bash
docker compose up -d          # Start Altibase (localhost:20300)
docker compose logs -f altibase
docker compose down           # Stop (keeps data) / down -v (also removes volumes)
```

**Non-obvious setup knowledge (must keep):**
- **Image**: `altibase/a_plus_edition:latest` = Altibase **7.3 A+ Edition** (free for dev/test, no License Key required).
  The boot log shows "Server is Altibase A+ Edition" and it starts without a license.
  (Note: the `altibase/altibase` `:7.1`/`:7.3`/`:8.1` tags on Docker Hub require a valid license and fail to start.)
- **ALTIBASE_HOME**: For this image it is `/root/altibase_home`. Volume mount paths must follow this for data to
  persist (not `/home/altibase/...` — if wrong, the server still starts but data isn't retained in the volume).
- **JDBC driver**: `libs/Altibase.jar` uses the **8.1** driver (extracted from the 8.1 image). Older (7.1/7.3)
  drivers don't implement JDBC4 methods like `Connection.isValid()`/`createClob()`, which conflicts with
  HikariCP / Hibernate 6.x (`AbstractMethodError`). The 8.1 driver → 7.3 A+ server connection is confirmed working.
- **HikariCP**: Set `spring.datasource.hikari.connection-test-query: SELECT 1 FROM DUAL` in
  `application-local.yml`/`-dev.yml` (Altibase validation query · fallback for older drivers).
- Account/DB: `sys` / `manager`, DB name `mydb`, port `20300`.

### Folder structure
```
docker-compose.yml      # Local Altibase (Docker, A+ Edition)
frontend/               # React + TypeScript + Vite (separate from backend)
  src/App.tsx
  vite.config.ts        # /api → localhost:8080 proxy
libs/
  Altibase.jar          # Altibase JDBC driver (8.1, extracted from the Docker image)
src/
  main/
    java/com/anj/apple/
      AppleApplication.java
      config/          # configuration classes
      controller/      # REST controllers
      service/         # business logic
      repository/      # Spring Data JPA repositories
      domain/          # entities / domain models
      dto/             # request/response DTOs
    resources/
      application.yml
      application-local.yml
      application-dev.yml
  test/
    java/com/anj/apple/   # tests (JUnit 5)
```

### Code conventions
- Use Java 25 features actively (record, sealed, pattern matching, virtual threads, etc.) — as long as readability isn't hurt.
- Keep controllers thin; put business logic in services.
- Don't expose entities directly in controller responses; convert to DTOs.
- Write tests alongside new features (goal-driven execution principle).
