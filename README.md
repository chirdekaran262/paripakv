# 🌾 Paripakv – Smart Agricultural Marketplace & Logistics

**Empowering Indian farmers with technology to manage crops, payments, and deliveries efficiently.**

Paripakv bridges the gap between **farmers, buyers, and transporters**, providing:
- 🧑‍🌾 **Farmer Profiles & Crop Listings** – Sell products directly to buyers
- 💳 **Secure Online Payments** – Integrated with Razorpay
- 🚚 **Verified Delivery Management** – Image proof & OTP confirmation
- 📬 **Automated Notifications** – Order, pickup, and delivery alerts
- 🌐 **Responsive Web App** – Built with React, Tailwind CSS, and W3.CSS

**Tech Stack:** React | Vite | Tailwind | W3.CSS | Spring Boot | PostgreSQL | Razorpay | Google OAuth

**Live :** [Paripakv](https://paripakv-krishivision.onrender.com)

> Transforming India’s agricultural supply chain with a secure, transparent, and efficient platform.

---

## 🔧 Tech Stack

### 🖥️ Frontend
- **React.js** with **Vite** for fast SPA development
- **Tailwind CSS** + **W3.CSS** for responsive UI
- **React Router** for client-side routing

### 🛠 Backend
- **Spring Boot** for REST APIs
- **Spring Security** for authentication & role-based access
- **Spring Data JPA** for database operations
- **OAuth2** login via Google
- **Razorpay** integration for secure online payments

### 🗃️ Database
- **PostgreSQL**, hosted on **Render**
- Secure connection configured in `application.properties`

### ☁️ Deployment
- Both frontend and backend hosted on **Render**
- SPA routing handled with `/* /index.html 200`

---

## 🚀 Core Features

- 🌐 **Google OAuth & secure email/password login**
- 🧑‍🌾 **Farmer profiles** with crop/product listings
- 📦 **Product listing & marketplace module**
- 🛒 **Buyer module** – place orders and make payments via Razorpay
- 🚚 **Transporter module** – manage pickups, deliveries, and track order status
- 🧾 **Email notifications** for order confirmation, pickup, and delivery
- 🔒 **Delivery verification** with image proof & OTP from buyer
- 📱 Fully responsive UI for desktop and mobile
- 🔄 Forgot password & reset flows
- 🖥️ Real-time chat between farmers and buyers

---

## 💼 How Paripakv Solves Real-World Problems

1. **Market Access & Fair Pricing** – connects farmers directly with buyers, reducing dependency on intermediaries.
2. **End-to-End Supply Chain Management** – from crop listing → payment → pickup → delivery verification.
3. **Reliable Logistics** – transporters confirm delivery via images & OTPs, ensuring accountability.
4. **Secure Online Payments** – Razorpay integration for instant, transparent transactions.
5. **Automated Notifications** – email alerts keep users updated at every step.
6. **Data-Driven Decision Making** – track orders, payments, and delivery efficiency.

---

## 🛠️ Setup Instructions

### Backend Setup
```bash
cd paripakv-backend
./mvnw spring-boot:run
```
Or via Maven:
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

## 🔐 Authentication & Role Management

1. Users can sign in via **Google OAuth** or **email/password**
2. Default role on Google login = **FARMER**
3. After first login, users complete their profile
4. Role-based access ensures secure navigation for:
   - `FARMER` – manage crops & orders
   - `BUYER` – place orders & verify delivery
   - `TRANSPORTER` – manage pickups and deliveries
   - `ADMIN` – oversee platform operations

---

## 🧪 Testing

- Unit tests for backend services
- Manual frontend form validation
- End-to-end testing: login → profile → product listing → order → payment → delivery confirmation

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

## ⚙️ Local Development Notes

- Update `application.properties` for local DB credentials
- Replace production OAuth URLs with localhost URLs
- Update API base URLs in frontend to `http://localhost:8089`
- Set environment variables (`.env`) for sensitive credentials

---

## 💡 Future Enhancements

- Admin dashboard for managing users, listings, payments, and delivery analytics
- Multilingual support (Marathi, Hindi, English)
- SMS/WhatsApp notifications for order and delivery updates
- AI-powered crop suggestions and price trends

---

## 👤 Author

**Karan Chirde** – B.Tech CSE Graduate  
GitHub: [chirdekaran262](https://github.com/chirdekaran262)  
Email: chirdekaran262@gmail.com

---

> “Transforming India’s Agricultural Supply Chain with Technology” 🇮🇳

