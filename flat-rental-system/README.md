# 🏠 LuxeFlats — Flat Rental Management System

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![JUnit 5](https://img.shields.io/badge/Tests-46%2F46%20Passing-success.svg?style=flat-square&logo=junit5)](https://junit.org/junit5/)
[![Code Coverage](https://img.shields.io/badge/JaCoCo-Verified-green.svg?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)]()

An enterprise-grade, full-stack Flat Rental and Property Booking Marketplace built on a distributed **Spring Boot Microservices Architecture** and a modern, responsive **React (Vite)** frontend.

---

## 📌 System Architecture

The application adopts an independent microservices design pattern where each domain owns its specific schema, business logic, and security filter chain. An API Gateway serves as the single unified ingress entry point.

`mermaid
graph TD
    Client[React Web Application :5173] -->|HTTP / REST| Gateway[Spring Cloud API Gateway :8080]

    Gateway -->|/api/auth/**| AuthService[Auth Service :8081]
    Gateway -->|/api/properties/**| PropService[Property Service :8082]
    Gateway -->|/api/bookings/**| BookService[Booking Service :8083]
    Gateway -->|/api/payments/**| PayService[Payment Service :8084]

    BookService -.->|Inter-Service HTTP Client| PropService
    PayService -.->|Inter-Service HTTP Client| BookService

    AuthService --> DB1[(MySQL: flat_rental_auth)]
    PropService --> DB2[(MySQL: flat_rental_property)]
    BookService --> DB3[(MySQL: flat_rental_booking)]
    PayService --> DB4[(MySQL: flat_rental_payment)]
`

---

## 🌟 Key Features

### 🔐 Authentication & Security (uth-service)
- **Stateless JWT Security**: Secure JSON Web Tokens with claim extraction, expiration checking, and signature verification (HS256).
- **Role-Based Access Control (RBAC)**: Support for distinct user personas:
  - TENANT: Search flats, request bookings, submit token payments, attend physical meetups, pay monthly rent.
  - OWNER: List and manage flats, approve/reject tenant bookings, schedule physical meetups.
  - ADMIN: System-wide oversight and monitoring.
- **BCrypt Password Encryption**: Strong salt-hashed credential persistence.

### 🏢 Property Management (property-service)
- Full CRUD property lifecycle (creation, updates, availability toggling, deletion).
- Rich attribute support: Property type (1BHK, 2BHK, 3BHK, Studio, Villa), Furnishing status, Security deposit, Rent, Bed/Bath count.
- Multi-criteria search and dynamic filtering by city, type, budget, and availability.

### 📅 Advanced Booking & Meetup Workflow (ooking-service)
State machine tracking the entire real-world rental journey:
`	ext
[PENDING] 
   │
   ▼ (Tenant pays Token Amount)
[TOKEN_PAID] 
   │
   ▼ (Owner approves & provides Meetup Address, Contact & Slot)
[OWNER_APPROVED] 
   │
   ▼ (Physical verification completed)
[MEETUP_COMPLETED] 
   │
   ▼ (Final Confirmation)
[CONFIRMED] ──► (First Month Rent Payment Unlocked) ──► [RENT_PAID / ACTIVE]
`

### 💳 Payment & Refund Engine (payment-service)
- **Dual Transaction Segregation**: Independent handling for **Token Payments** (reservation deposit) and **First Month Rent Payments** without collision or state overrides.
- **Mock Payment Gateway**: Transaction reference generation, card/UPI simulation, and instant status verification.
- **Automated Refund Flow**: Allows cancellation and refund initiation with state transitions to REFUNDED.

### 💻 Modern Responsive Frontend (rontend)
- Built with **React 18**, **Vite**, and **Lucide Icons**.
- Sleek glassmorphism dark mode with CSS variables.
- Dedicated dashboards for both **Tenants** and **Property Owners**.
- Interactive Booking Status Timelines and Payment Modals.

---

## 🧩 Microservices Breakdown

| Service | Port | Database | Primary Responsibility |
| :--- | :---: | :---: | :--- |
| **pi-gateway** | 8080 | None | Unified routing, reverse proxy, CORS policy handler |
| **uth-service** | 8081 | lat_rental_auth | User registration, login, JWT issuance, profile management |
| **property-service** | 8082 | lat_rental_property | Flat listings, metadata, images, search & query filters |
| **ooking-service** | 8083 | lat_rental_booking | Booking state machine, approval, meetup coordination |
| **payment-service** | 8084 | lat_rental_payment | Token & rent payments, mock gateway, transaction records, refunds |
| **rontend** | 5173 | None | Vite + React single-page UI application |

---

## 🛠️ Tech Stack

- **Backend**: Java 21 / OpenJDK 26, Spring Boot 3.2.3, Spring Data JPA, Hibernate, Spring Security.
- **Frontend**: React 18, React Router v6, Axios, Lucide React, Vite.
- **Database**: MySQL 8.x (auto-creates databases via JDBC createDatabaseIfNotExist=true).
- **Testing**: JUnit 5 (Jupiter), Mockito 5, AssertJ, JaCoCo Maven Plugin.
- **Build Tools**: Apache Maven 3.9+, Node.js & npm.

---

## 🚀 Getting Started

### 1. Prerequisites
- **JDK 17 or 21+** (java -version)
- **Maven 3.8+** (mvn -v)
- **Node.js 18+ & npm** (
ode -v)
- **MySQL 8.0+** running on localhost:3306 with default credentials (
oot / 
oot or configure env vars).

### 2. Environment Variables (Optional)
Sensible local defaults are preconfigured:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| DB_HOST | localhost | MySQL Host |
| DB_PORT | 3306 | MySQL Port |
| DB_USERNAME | 
oot | MySQL Username |
| DB_PASSWORD | 
oot | MySQL Password |
| JWT_SECRET | 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970 | Shared JWT Signing Key |

---

### 3. Build & Run Backend Microservices

From the repository root:

`ash
# Clean and compile all services
mvn clean install -DskipTests
`

Run each service in separate terminal sessions (or via your IDE):

`ash
# Terminal 1: Auth Service
cd auth-service && mvn spring-boot:run

# Terminal 2: Property Service
cd property-service && mvn spring-boot:run

# Terminal 3: Booking Service
cd booking-service && mvn spring-boot:run

# Terminal 4: Payment Service
cd payment-service && mvn spring-boot:run

# Terminal 5: API Gateway
cd api-gateway && mvn spring-boot:run
`

---

### 4. Run Frontend Application

`ash
cd frontend
npm install
npm run dev
`

Visit **http://localhost:5173** in your browser.

---

## 🧪 Unit Testing & Quality Assurance

All services are backed by a comprehensive unit testing suite using **JUnit 5** and **Mockito**, executing isolated business logic validation with zero external database dependencies.

`ash
# Run all tests across the entire multi-module project
mvn test
`

### Test Results Summary

| Microservice | Test Class | Cases | Passed | Failed | Success Rate |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **auth-service** | AuthServiceTest, JwtUtilTest | 15 | 15 | 0 | **100%** |
| **property-service** | PropertyServiceTest | 10 | 10 | 0 | **100%** |
| **booking-service** | BookingServiceTest | 11 | 11 | 0 | **100%** |
| **payment-service** | MockPaymentServiceTest | 10 | 10 | 0 | **100%** |
| **TOTAL** | **4 Microservices** | **46** | **46** | **0** | **100%** |

### JaCoCo Code Coverage
HTML code coverage reports are generated automatically on test execution:
- Located at: <service-name>/target/site/jacoco/index.html

A formal printable PDF testing audit is available in the root directory: [UNIT_TESTING_IMPLEMENTATION_REPORT.pdf](UNIT_TESTING_IMPLEMENTATION_REPORT.pdf).

---

## 📡 REST API Sample Endpoints

### Auth Service (:8081 via Gateway :8080)
- POST /api/auth/register — Register a new tenant or owner.
- POST /api/auth/login — Authenticate and receive a JWT Bearer token.
- GET  /api/auth/me — Retrieve current authenticated user profile.

### Property Service (:8082 via Gateway :8080)
- GET    /api/properties — List/filter available properties.
- GET    /api/properties/{id} — Get single property details.
- POST   /api/properties — Create a flat listing (OWNER only).
- DELETE /api/properties/{id} — Remove a listing (OWNER only).

### Booking Service (:8083 via Gateway :8080)
- POST /api/bookings — Create a booking request.
- GET  /api/bookings/tenant/{tenantId} — Fetch bookings by tenant.
- GET  /api/bookings/owner/{ownerId} — Fetch bookings for owner's properties.
- PUT  /api/bookings/{id}/approve-with-contact — Owner approval with meetup coordinates.
- PUT  /api/bookings/{id}/complete-meetup — Mark physical verification complete.

### Payment Service (:8084 via Gateway :8080)
- POST /api/payments/process — Process token or rent payment.
- GET  /api/payments/booking/{bookingId} — Get all payment transactions for a booking.
- POST /api/payments/{id}/refund — Initiate refund for cancelled booking.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
