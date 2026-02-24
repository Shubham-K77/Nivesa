# Nivēśa - Personal Finance Management Platform

<div align="center">
  
  **Your Personal Finance Companion with AI-Powered Insights**

[![License](https://img.shields.io/badge/license-UNLICENSED-blue.svg)](LICENSE)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)](https://www.python.org/)

</div>

---

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [ML Forecasting](#ml-forecasting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

**Nivēśa** (Sanskrit: निवेश - meaning "investment") is a comprehensive personal finance management platform that helps users track expenses, manage budgets, and make informed financial decisions using AI-powered predictions.

### Key Highlights

- 📊 **Smart Dashboard**: Real-time overview of finances with interactive charts
- 🤖 **AI Predictions**: ML-powered spending forecasts using SARIMA models
- 👨‍👩‍👧‍👦 **Family Accounts**: Shared account management with budget allocation
- 📱 **WhatsApp Integration**: Transaction updates via WhatsApp
- 📸 **Receipt Scanning**: OCR-powered receipt data extraction
- 🔄 **Recurring Transactions**: Automated handling of recurring expenses
- 🎨 **Modern UI**: Beautiful, responsive interface with dark mode

---

## ✨ Features

### Core Functionality

- **Account Management**
  - Multiple account types (Current, Savings, Family)
  - Real-time balance tracking
  - Account analytics and insights

- **Transaction Tracking**
  - Manual transaction entry
  - Receipt scanning with AI extraction
  - Categorized expenses (Food, Transport, Housing, etc.)
  - Income and expense tracking
  - Recurring transaction automation

- **Budget Management**
  - Account-level budgets
  - Family member budget allocation
  - Real-time spending alerts
  - Budget vs. actual analysis

- **AI-Powered Forecasting**
  - 7-day spending predictions
  - SARIMA model with seasonal patterns
  - Confidence intervals
  - Historical trend analysis

- **Family Features**
  - Family account creation
  - Member invitation system
  - Individual budget limits
  - Transaction visibility controls

- **Security**
  - JWT-based authentication
  - Password hashing (bcrypt)
  - Rate limiting (Arcjet)
  - CORS protection

- **Notifications**
  - Email notifications (Nodemailer)
  - WhatsApp alerts
  - Budget threshold alerts

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.1 (React 19.2)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Shadcn/ui
- **Charts**: Recharts
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Animations**: Motion (Framer Motion)

### Backend

- **Framework**: NestJS 11.0
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL (Prisma ORM 6.19)
- **Authentication**: JWT (@nestjs/jwt)
- **Security**: Arcjet
- **Background Jobs**: Inngest
- **File Upload**: Cloudinary
- **Email**: Nodemailer
- **WhatsApp**: whatsapp-web.js
- **AI**: Groq SDK

### ML Service

- **Framework**: FastAPI
- **Language**: Python 3.10
- **ML Libraries**:
  - statsforecast (SARIMA)
  - pandas, numpy
  - scikit-learn
- **Server**: Uvicorn

### Infrastructure

- **Caching**: Redis (Upstash)
- **Database**: PostgreSQL (Neon/Supabase)
- **Storage**: Cloudinary

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js       │
│   Frontend      │
│   (Port 3000)   │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐      ┌──────────────┐
│   NestJS        │◄────►│   Redis      │
│   Backend       │      │   Cache      │
│   (Port 3001)   │      └──────────────┘
└────────┬────────┘
         │
         │
    ┌────┼────┬─────────────┐
    │         │             │
┌───▼───┐ ┌──▼──────┐ ┌────▼─────┐
│Prisma │ │ Inngest │ │WhatsApp  │
│  +    │ │ Jobs    │ │Service   │
│ Neon  │ └─────────┘ └──────────┘
└───┬───┘
    │
┌───▼────────────┐     ┌──────────────┐
│  FastAPI       │     │  Cloudinary  │
│  ML Service    │     │  Storage     │
│  (Port 8000)   │     └──────────────┘
└────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.x or higher
- **Python**: v3.10 or higher
- **PostgreSQL**: v14 or higher
- **Redis**: Running instance (optional for caching)
- **pnpm/npm/yarn**: Package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://gitlab.com/Shubham.K707/nivesa.git
   cd nivesa
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Install Python Dependencies**

   ```bash
   cd ../python
   python -m venv virtual
   source virtual/bin/activate  # On Windows: virtual\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Database Setup**
   ```bash
   cd ../backend
   npx prisma generate
   npx prisma migrate dev
   ```

### Environment Variables

#### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nivesa"
DIRECT_URL="postgresql://user:password@localhost:5432/nivesa"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Redis (Upstash)
UPSTASH_REDIS_URL="your-upstash-redis-url"
UPSTASH_REDIS_TOKEN="your-upstash-redis-token"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Email (Nodemailer)
SENDER_EMAIL="your-email@gmail.com"
SENDER_PASSWORD="your-app-specific-password"

# Groq AI
GROQ_API_KEY="your-groq-api-key"

# Arcjet Security
ARCJET_KEY="your-arcjet-key"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Inngest
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"
```

#### Frontend (.env.local)

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_ML_API_URL="http://localhost:8000"
```

#### Python (.env)

Create a `.env` file in the `python` directory (if needed):

```env
PORT=8000
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### Running the Application

#### Development Mode

1. **Start Backend**

   ```bash
   cd backend
   npm run start:dev
   ```

   Backend runs on: http://localhost:3001

2. **Start Frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   Frontend runs on: http://localhost:3000

3. **Start ML Service**

   ```bash
   cd python
   source virtual/bin/activate  # On Windows: virtual\Scripts\activate
   uvicorn dynamic_forecast_api:app --reload --port 8000
   ```

   ML API runs on: http://localhost:8000

4. **Start Inngest Dev Server** (Optional - for background jobs)
   ```bash
   cd backend
   npm run inngest:dev
   ```

#### Production Mode

1. **Build Backend**

   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```

2. **Build Frontend**

   ```bash
   cd frontend
   npm run build
   npm run start
   ```

3. **Run ML Service**
   ```bash
   cd python
   uvicorn dynamic_forecast_api:app --host 0.0.0.0 --port 8000
   ```

---

## 📁 Project Structure

```
nivesa/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── account/        # Account module
│   │   ├── auth/           # Authentication
│   │   ├── budget/         # Budget management
│   │   ├── transaction/    # Transaction handling
│   │   ├── user/           # User management
│   │   ├── family-member/  # Family features
│   │   ├── whatsapp/       # WhatsApp integration
│   │   ├── groq/           # AI service
│   │   ├── mailer/         # Email service
│   │   ├── inngest/        # Background jobs
│   │   ├── prisma/         # Database service
│   │   └── ...
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── package.json
│
├── frontend/               # Next.js frontend
│   ├── app/
│   │   ├── (auth)/        # Auth routes
│   │   ├── (dashboard)/   # Dashboard routes
│   │   └── (root)/        # Landing page
│   ├── components/
│   │   ├── custom/        # Custom components
│   │   ├── ui/            # Shadcn UI components
│   │   └── skeletons/     # Loading skeletons
│   ├── actions/           # Server actions
│   ├── queries/           # TanStack Query hooks
│   ├── types/             # TypeScript types
│   └── package.json
│
├── python/                # ML service
│   ├── dynamic_forecast_api.py  # FastAPI app
│   ├── baseline.ipynb          # ML model notebook
│   ├── requirements.txt
│   └── dataset/
│
└── README.md
```

---

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/v1/auth/register       # User registration
POST   /api/v1/auth/login          # User login
GET    /api/v1/auth/profile        # Get current user
```

### Account Endpoints

```
GET    /api/v1/account             # Get all accounts
POST   /api/v1/account             # Create account
GET    /api/v1/account/:id         # Get specific account
PATCH  /api/v1/account/:id         # Update account
DELETE /api/v1/account/:id         # Delete account
```

### Transaction Endpoints

```
GET    /api/v1/transaction         # Get all transactions
POST   /api/v1/transaction         # Create transaction
GET    /api/v1/transaction/:id     # Get specific transaction
PATCH  /api/v1/transaction/:id     # Update transaction
DELETE /api/v1/transaction/:id     # Delete transaction
POST   /api/v1/transaction/scan    # Scan receipt
```

### Budget Endpoints

```
GET    /api/v1/budget/:accountId   # Get budget
POST   /api/v1/budget              # Create/update budget
DELETE /api/v1/budget/:id          # Delete budget
```

### ML Endpoints

```
POST   http://localhost:8000/predict  # Generate predictions
```

---

## 🤖 ML Forecasting

The ML service uses **SARIMA** (Seasonal AutoRegressive Integrated Moving Average) to forecast spending:

### How It Works

1. **Data Preprocessing**
   - Filters expense transactions
   - Applies target/mean encoding for categories
   - Aggregates daily spending
   - Removes outliers (Winsorization at 99th percentile)

2. **Model Training**
   - Uses AutoARIMA for parameter selection
   - Captures 7-day seasonality
   - Trains on historical data (minimum 14 days)

3. **Prediction**
   - Generates 7-day forecast
   - Provides confidence intervals (80%)
   - Returns daily predictions with bounds

### Example Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {
        "id": "1",
        "amount": 50.0,
        "category": "FOOD",
        "type": "EXPENSE",
        "date": "2026-02-01",
        "status": "COMPLETED"
      }
    ],
    "accountId": "account-123"
  }'
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📝 License

This project is **UNLICENSED** - Private/Proprietary software.

---

## 👥 Authors

**Shubham Kumar**  
GitLab: [@Shubham.K707](https://gitlab.com/Shubham.K707)

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [FastAPI](https://fastapi.tiangolo.com/) - ML API framework
- [statsforecast](https://github.com/Nixtla/statsforecast) - Time series forecasting

---

## 📧 Support

For support, email support@nivesa.com or open an issue on GitLab.

---

<div align="center">
  
  Made with ❤️ by the Nivēśa Team
  
  ⭐ Star this repo if you find it helpful!
  
</div>
