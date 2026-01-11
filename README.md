# Restaurant Table Reservation API

A production-ready REST API for managing restaurants, tables, and reservations, built with **NestJS**, **Prisma v7.2**, and **PostgreSQL**.

This project demonstrates clean architecture, strong business rules, proper validation, testing, and containerized deployment.

---

## Features

### Restaurant Management

- Create a restaurant with opening and closing hours
- Fetch restaurant details with associated tables

### Table Management

- Add tables to a restaurant
- Enforce **unique table numbers per restaurant**
- Enforce table capacity constraints

### Reservation System

- Create reservations
- Prevent double booking (overlapping time slots)
- Validate restaurant operating hours
- Modify existing reservations
- Cancel reservations
- Get reservations by restaurant and date
- Fetch available tables for a given time and party size (seating optimization)

---

## Tech Stack

- Node.js
- NestJS
- TypeScript
- Prisma ORM v7.2
- PostgreSQL
- Docker & Docker Compose
- Swagger (OpenAPI)
- Jest (Unit Testing)

## API Documentation (Swagger)

Swagger UI is available at:

```
http://localhost:5000/api-docs
```

---

## Environment Variables

Create a `.env` file in the project root:

```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restaurant
```

> When running with Docker, the database host must be `db` instead of `localhost`.

---

## Running the Project (Without Docker)

### 1. Install dependencies

```
npm install
```

### 2. Start PostgreSQL

Ensure PostgreSQL is running and a database named `restaurant` exists.

### 3. Run Prisma migrations

```
npx prisma migrate deploy
npx prisma generate
```

### 4. Start the application

```
npm run start:dev
```

The API will be available at:

```
http://localhost:5000
```

---

## Running the Project (With Docker)

### 1. Build and start services

```
docker compose up --build
```

This will:

- Start PostgreSQL
- Run Prisma migrations automatically
- Start the NestJS API

### 2. Access the API

```
http://localhost:5000
http://localhost:5000/api-docs
```

### 3. Stop containers

```
docker compose down
```

---

## Testing

Unit tests are provided for services and controllers.

### Run tests

```
npm run test
```

### Testing Strategy

- Controllers are tested with mocked services
- Services are tested with mocked PrismaService
- No real database is used
- Business rules and edge cases are covered

---

## Design Decisions & Assumptions

- Prisma v7 adapter-based client is used
- Reservations cannot overlap on the same table
- Reservations must fall within restaurant operating hours
- Table numbers are unique per restaurant
- Controllers remain thin; business logic lives in services

---

## Known Limitations

- No authentication or authorization
- No pagination
- No notification system (email/SMS)
- Single timezone assumption

---

## Future Improvements

- Authentication & role-based access
- End-to-end (E2E) testing
- Background jobs for notifications
- Advanced availability search
- Horizontal scaling support

---

## Scalability Considerations

- Introduce Redis caching
- Use database read replicas
- Add background workers
- Container orchestration with Kubernetes
- Load-balanced API instances
