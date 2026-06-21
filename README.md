# SmartRide Booking System

SmartRide Booking System is a full-stack web application that facilitates seamless ride-hailing services. The application consists of a backend powered by Spring Boot (REST APIs, Security, and JPA) and a modern frontend interface built with React, Vite, and Axios.

---

## 🚀 Technologies Used

### Backend
- **Java 21**
- **Spring Boot 3.3.0**
  - **Spring Web**: Creating RESTful API endpoints.
  - **Spring Data JPA**: Database abstraction and ORM framework.
  - **Spring Security & JWT (JSON Web Tokens)**: Securing user and driver authentication and authorization.
- **MySQL**: Relational database for storing user, driver, and ride details.
- **Maven**: Dependency management and build tool.

### Frontend
- **React (v18)**: Component-based UI development.
- **Vite (v8)**: Fast build tool and development server.
- **Axios**: HTTP client for communicating with the backend.
- **CSS3 (Vanilla CSS)**: Responsive design and UI styling.

---

## ✨ Features

- **User Authentication & Authorization**: 
  - Secure registration and login for both **Passengers** and **Drivers**.
  - Role-based authorization using Spring Security and JWT.
- **Ride Booking**:
  - Passengers can request a ride by entering pickup and destination details.
  - Live ride status updates.
- **Driver Dashboard**:
  - Drivers can view pending ride requests, accept rides, and update ride status.
- **Ride Tracking & Status Screen**:
  - Live details of the current ride, displaying rider and driver info, pickup/destination, and status (e.g., Requested, Accepted, Completed).
- **Ride History**:
  - Detailed list of past rides for both riders and drivers.

---

## 📁 Project Structure

```
SmartRideSystem/
├── backend/                  # Spring Boot Backend Project
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/ridebooking/backend/
│   │   │   │   ├── config/        # Security, JWT filters & token provider
│   │   │   │   ├── controllers/   # Auth and Ride REST endpoints
│   │   │   │   ├── dto/           # Request/Response data transfer objects
│   │   │   │   ├── entities/      # JPA Hibernate entities (User, Driver, Ride)
│   │   │   │   ├── repositories/  # Database access interfaces
│   │   │   │   └── services/      # Business logic implementation
│   │   │   └── resources/
│   │   │       ├── application.properties   # App configurations
│   │   │       └── schema.sql              # Database schema initialization
│   │   └── test/              # Integration and unit tests
│   ├── pom.xml                # Maven build descriptor
│   └── mvnw                   # Maven wrapper executable
│
├── frontend/                 # Vite + React Frontend Project
│   ├── src/
│   │   ├── pages/             # App pages (Dashboard, Login, Booking, History, Status)
│   │   ├── services/          # Axios API wrappers (api.js)
│   │   ├── App.jsx            # Main app router/component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Core CSS styling
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies and scripts
│   ├── package-lock.json      # Locked versions of dependencies
│   └── vite.config.js         # Vite configuration
│
└── .gitignore                 # Workspace-wide Git ignore rules
```

---

## 🛠️ Setup and Installation

### Prerequisites
- **Java JDK 21** or higher installed.
- **Node.js** (v18+) and **npm** installed.
- **MySQL Server** running.

### 1. Database Setup
1. Create a MySQL database (e.g., `smartride_db`).
2. Update the credentials in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/smartride_db
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

### 2. Run Backend
Navigate to the `backend` directory and run using the Maven wrapper:
```bash
cd backend
./mvnw spring-boot:run
```

### 3. Run Frontend
Navigate to the `frontend` directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
