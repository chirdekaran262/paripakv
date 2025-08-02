# 🌾 Paripakv - Empowering Farmers with Technology

Paripakv is a full-stack web application designed to support Indian farmers by connecting them with modern tools, services, and marketplaces. The project includes user roles like Farmers and Buyer, Transpoter, secure authentication (including Google OAuth), and interfaces for managing crops, selling product, order farm product by buyer and transpoter can manage delivery.

---

## 🔧 Tech Stack

### 🖥️ Frontend
- **React.js** with **Vite**
- **Tailwind CSS** and **W3.CSS**
- Routing and SPA setup using `react-router-dom`

### 🛠 Backend
- **Spring Boot**
- **Spring Security** for authentication & authorization
- **Spring Data JPA**
- **OAuth2** login via Google
- **PostgreSQL** as database

### 🗃️ Database
- Hosted on **Render PostgreSQL**
- Connection config through `application.properties`

### ☁️ Deployment
- Frontend and Backend hosted on **Render**
- SPA routing handled using the rule: `/*    /index.html   200`

---

## 🚀 Features

- 🌐 Google OAuth login & custom authentication
- 🧑‍🌾 Farmers complete profile after first login
- 📦 Listings for crops/products
- 🛒 Purchase/sell modules
- 🧾 Forgot password & reset flow
- 📱 Fully responsive UI using W3.CSS + Tailwind

---

## 🛠️ Setup Instructions

### Backend Setup
```bash
cd paripakv-backend
./mvnw spring-boot:run
```

Or using Maven:
```bash
mvn spring-boot:run
```

Backend runs at: `http://localhost:8089`

#### PostgreSQL Configuration (`application.properties`)
```properties
spring.application.name=paripakv
server.port=8089

spring.datasource.url=jdbc:postgresql://<host>:5432/paripakv_db
spring.datasource.username=paripakv_user
spring.datasource.password=<your-password>

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

---

### Frontend Setup
```bash
cd paripakv-frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

---

## 📬 Contact

If you encounter any issues while running the application, feel free to reach out:

📧 **Email**: chirdekaran262@gmail.com
## 🔐 Authentication Flow

1. User signs in via Google or email/password.
2. If using Google, default role = FARMER.
3. After first login, user must complete their profile.
4. Role-based access to routes: `FARMER`, `ADMIN`

---

## 🧪 Testing

- Unit tests for backend services
- Manual form validation on the frontend
- End-to-end flow testing (login → profile → product listing)

---

## 🌐 Live Demo

**Frontend**: [https://paripakv-f.onrender.com](https://paripakv-f.onrender.com)  
**Backend**: Hosted on Render

Note: Use SPA redirect rule `/* /index.html 200` in `render.yaml`

---

## 👤 Author

**Karan Chirde**  
Final Year B.Tech CSE Student  
GitHub: [chirdekaran262](https://github.com/chirdekaran262)
Email: chirdekaran262@gmail.com
---

## 📁 Folder Structure

```
paripakv/
├── paripakv-frontend/
│   ├── src/
│   └── index.html
├── paripakv-backend/
│   ├── src/main/java/com/FarmTech/paripakv/
│   └── application.properties
```

---

## 📌 Notes

- Ensure OAuth client credentials are added in Render dashboard
- Secure your PostgreSQL credentials
- React build optimized with Vite
- PostgreSQL hosted on Oregon region via Render
---

---

## ⚠️ Local Development Note

This project was configured and deployed using **Render**. To run it locally, you may need to make the following changes:

### 🔄 Backend Adjustments
- Update `application.properties`:
  - Replace the production PostgreSQL URL with your local database URL
  - Set local `spring.datasource.username` and `password`
- Disable OAuth redirection URLs set for production and replace with localhost versions

### 🌐 Frontend Adjustments
- Change API base URLs to `http://localhost:8089` in your React frontend config
- Make sure to install all dependencies via `npm install`

### 🧪 Environment Variables
Set any required environment variables (OAuth credentials, DB config) locally using `.env` files or environment configuration tools.

---

## 📬 Contact

If you encounter any issues while running the application, feel free to reach out:

📧 **Email**: chirdekaran262@gmail.com


## 💡 Future Enhancements

- Admin dashboard for monitoring users/listings
- Multilingual support (Marathi, Hindi) 
- Chat between farmers and buyers
- SMS/WhatsApp integration for alerts

---

> “Empowering Bharat's Farmers through Software” 🇮🇳
