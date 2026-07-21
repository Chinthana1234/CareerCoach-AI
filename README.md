# 🚀 CareerCoach AI

CareerCoach AI is an intelligent career assistant platform designed to empower job seekers. It provides AI-powered resume reviews, mock interviews, dynamic career roadmaps, and a comprehensive administrative dashboard. 

Built with a robust **React + Tailwind CSS** frontend and a highly scalable **Spring Boot** backend, CareerCoach AI leverages Google Gemini's advanced LLM capabilities for intelligent, context-aware user interactions.

---

## 🌟 Key Features

* **Intelligent Chat Interface**: A dynamic, real-time conversational interface where users can ask for career advice, mock interview simulations, and resume evaluations.
* **AI Resume Parsing & Review**: Users can upload their CVs/Resumes in PDF format. The platform extracts the text and uses AI to provide actionable feedback, an ATS score, and grammatical suggestions.
* **Mock Interviews**: Interactive simulated interviews tailored to specific job roles or topics, complete with performance evaluation (confidence, grammar, communication, professionalism).
* **Career Roadmapping**: Dynamic generation of career paths based on target roles, breaking down required skills and projects month by month.
* **Admin Dashboard**: Comprehensive statistics, user activity charts (Recharts), and user management (role assignments, user deletion).
* **Premium UI/UX**: Features glassmorphism elements, micro-animations, accessible components, and a fully responsive design tailored for both desktop and mobile platforms.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **React (Vite)**: Lightning-fast development environment and optimized builds.
- **Tailwind CSS (v4 Alpha)**: Modern utility-first CSS framework for rapid UI development with glassmorphism and custom keyframe animations.
- **Recharts**: For dynamic data visualization in the Admin dashboard.
- **React Router**: For seamless client-side routing.
- **Context API**: For global state management (Authentication).

### Backend
- **Spring Boot 3.3.1 (Java 21)**: The core backend framework.
- **Spring Security & JWT**: For stateless authentication and role-based access control (User/Admin).
- **PostgreSQL**: Robust relational database for persisting users, chat sessions, and messages.
- **Spring Data JPA (Hibernate)**: For Object-Relational Mapping and database interactions.
- **Apache PDFBox**: For extracting text from uploaded user CVs.
- **SpringDoc OpenAPI (Swagger)**: For automated API documentation.

### External APIs
- **Google Gemini API**: Powers all intelligent text generation, resume evaluations, and mock interviews.

---

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js** (v18+)
- **Java** (JDK 21)
- **Maven** (v3.8+)
- **PostgreSQL** (v14+)
- **Gemini API Key**: You need an API key from Google AI Studio.

---

## 🚀 Getting Started

### 1. Database Setup
1. Create a PostgreSQL database named `careercoach_db`.
2. Ensure your local Postgres username is `postgres` and password is `root` (or update `application.properties` accordingly).

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd careercoach-backend
```

Configure your environment variables by updating `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/careercoach_db
spring.datasource.username=postgres
spring.datasource.password=root

jwt.secret=YOUR_SUPER_SECRET_JWT_KEY_AT_LEAST_32_CHARS_LONG
jwt.expiration=86400000

gemini.api.key=YOUR_GEMINI_API_KEY
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

Run the backend application:
```bash
mvn spring-boot:run
```
The backend will run on `http://localhost:8080`.
Swagger UI is available at `http://localhost:8080/swagger-ui.html`.

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd careercoach-frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`.

---

## 🧪 Default Users
For testing purposes, the following default users are available:

- **Admin User**:
  - Username: `admin`
  - Password: `adminpassword`
- **Standard User**:
  - Username: `johndoe`
  - Password: `password123`

---

## 🐳 Deployment (Docker)
This project is containerization-ready. 
A `docker-compose.yml` file and `Dockerfile`s are provided in the root and respective module directories to easily spin up the PostgreSQL database, Spring Boot Backend, and React Frontend in isolated containers.

```bash
docker-compose up --build
```

---

## 📜 License
This project is licensed under the MIT License.
