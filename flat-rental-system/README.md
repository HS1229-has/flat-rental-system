# Flat Rental System — Backend (Day 1)

A microservices-based Flat Rental System built with Java, Spring Boot, Spring
Data JPA/Hibernate, MySQL, Spring Security + JWT, and Maven.

> **Status: Day 1 — architecture & foundation only.**
> Core CRUD is implemented per service, but cross-service business rules
> (e.g. "block a booking if the property is unavailable", real payment
> processing, gateway-level auth) are intentionally **not** wired up yet.

## Services

| Service          | Port | Responsibility                              | Database              |
|-------------------|------|----------------------------------------------|------------------------|
| api-gateway       | 8080 | Single entry point, routes to all services   | none                    |
| auth-service      | 8081 | Registration, login, JWT issuing              | flat_rental_auth        |
| property-service  | 8082 | Property listings (CRUD)                      | flat_rental_property     |
| booking-service   | 8083 | Booking requests (CRUD)                       | flat_rental_booking       |
| payment-service   | 8084 | Payment records (CRUD, no real gateway yet)    | flat_rental_payment       |

Each service is a **fully independent Spring Boot application** with its own
Maven `pom.xml`, its own database, and its own `Controller → Service →
Repository → Entity → DTO → Exception → Config` package layout. There is no
shared library and no service-discovery layer (Eureka/Consul) yet — the
gateway and the inter-service HTTP clients use fixed URLs from configuration,
which is simplest for a project this size.

All requests are expected to go through the **API Gateway** at `:8080` in a
real deployment, but every service can also be called directly on its own
port (useful while developing/testing one service at a time).

## Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8+ running locally (or reachable via env vars — see below)

You do **not** need to manually create the databases — each service uses
`createDatabaseIfNotExist=true` in its JDBC URL and `ddl-auto: update`, so
schemas and tables are created automatically the first time each service
starts.

## Configuration (environment variables)

Every service reads its DB credentials, JWT secret, and (where relevant)
sibling-service URLs from environment variables, with sensible local
defaults baked in so nothing needs to be set to run it locally:

| Variable              | Default                 | Used by                        |
|------------------------|--------------------------|----------------------------------|
| `DB_HOST`              | `localhost`              | all 4 backend services            |
| `DB_PORT`              | `3306`                   | all 4 backend services            |
| `DB_USERNAME`          | `root`                   | all 4 backend services            |
| `DB_PASSWORD`          | `root`                   | all 4 backend services            |
| `JWT_SECRET`           | (dev placeholder in yml) | all 4 backend services — **must be identical across services** |
| `JWT_EXPIRATION_MS`    | `86400000` (24h)         | auth-service                      |
| `AUTH_SERVICE_URL`     | `http://localhost:8081`  | api-gateway                       |
| `PROPERTY_SERVICE_URL` | `http://localhost:8082`  | api-gateway, booking-service       |
| `BOOKING_SERVICE_URL`  | `http://localhost:8083`  | api-gateway, payment-service        |
| `PAYMENT_SERVICE_URL`  | `http://localhost:8084`  | api-gateway                       |

**Before deploying anywhere real**, override `DB_PASSWORD` and `JWT_SECRET`
— the values in `application.yml` are development placeholders only.

## Running locally

Build everything from the repo root:

```bash
mvn clean install
```

Then start each service in its own terminal (order matters a little — start
auth-service first since other services validate its tokens, though nothing
will actually crash if you start them out of order):

```bash
cd auth-service      && mvn spring-boot:run
cd property-service   && mvn spring-boot:run
cd booking-service    && mvn spring-boot:run
cd payment-service    && mvn spring-boot:run
cd api-gateway        && mvn spring-boot:run
```

Or run the packaged jars directly after `mvn clean install`:

```bash
java -jar auth-service/target/auth-service.jar
java -jar property-service/target/property-service.jar
java -jar booking-service/target/booking-service.jar
java -jar payment-service/target/payment-service.jar
java -jar api-gateway/target/api-gateway.jar
```

## Trying it out

Register a user (through the gateway):

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"harsh","email":"harsh@example.com","password":"secret123","role":"TENANT"}'
```

Log in to get a JWT:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"harsh","password":"secret123"}'
```

Use the returned token to call a protected endpoint, e.g. create a property
(the `X-User-Id` header stands in for "who is making this request" until a
gateway-level auth filter is added in a later phase):

```bash
curl -X POST http://localhost:8080/api/properties \
  -H "Authorization: Bearer <token>" \
  -H "X-User-Id: 1" \
  -H "Content-Type: application/json" \
  -d '{"title":"2BHK near campus","address":"MG Road","city":"Pune","rentAmount":15000,"propertyType":"TWO_BHK","bedrooms":2,"bathrooms":2}'
```

## What's intentionally NOT in Day 1

- No cross-service validation logic (e.g. booking-service doesn't yet check
  with property-service whether a flat is actually available) — the HTTP
  client foundation (`PropertyClient`, `BookingClient`) is in place, just not
  called yet.
- No real payment gateway integration (payment-service just records a
  `PENDING` payment attempt with a locally generated reference id).
- No gateway-level JWT filter — each downstream service validates the token
  itself for now.
- No React frontend yet.
- No Docker Compose yet (all services are plain Spring Boot apps — add a
  Dockerfile per service and a `docker-compose.yml` once the services are
  functionally complete, so container config doesn't have to be redone).

## Project layout

```
flat-rental-system/
├── pom.xml                  # aggregator (packaging=pom), lists all modules
├── .gitignore
├── README.md
├── api-gateway/
├── auth-service/
├── property-service/
├── booking-service/
└── payment-service/
```

Each service folder looks like:

```
<service>/
├── pom.xml
└── src/main/
    ├── java/com/flatrental/<service>/
    │   ├── <Service>Application.java
    │   ├── config/          # SecurityConfig, WebClientConfig
    │   ├── controller/
    │   ├── service/
    │   ├── repository/
    │   ├── entity/
    │   ├── dto/
    │   ├── exception/
    │   └── security/        # JwtUtil, JwtAuthenticationFilter
    └── resources/
        └── application.yml
```
