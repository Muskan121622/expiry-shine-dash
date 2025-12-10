# Smart Expiry Guardian

A Modern AI-powered Product Expiry Tracking System

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web-blue)](#)
[![Tech Stack](https://img.shields.io/badge/tech--stack-React%20%7C%20TypeScript%20%7C%20Node.js%20%7C%20MongoDB-brightgreen)](#)

## 📌 Project Overview

Smart Expiry Guardian is an intelligent, AI-assisted expiry date tracking system designed to help users manage food, medicine, and cosmetic products efficiently. It prevents wastage, improves safety, and provides timely alerts for soon-to-expire products — along with donation/exchange recommendations.

The system uses:

- OCR (Tesseract.js / Vision API) for extracting expiry dates from uploaded images
- React + TypeScript for the frontend
- Node.js + Express for backend API
- MongoDB for data persistence
- GSAP, Framer Motion for stunning animations and UI
- Cloudinary for image uploads
- Health risk alert logic for sensitive groups (diabetic, cardiac, TB, allergy, etc.)

## 🎯 Aim of the Project

The goal of Smart Expiry Guardian is to make expiry date tracking automatic and user-friendly by:

- Reducing food & medicine wastage
- Preventing health risks caused by consuming expired or harmful products
- Helping communities donate or exchange nearly expired items
- Creating an AI-powered smart kitchen & medical cabinet assistant

## ✨ Key Features

### 🌐 Frontend (React + TypeScript + Tailwind + GSAP + Framer Motion)

- ✔ Futuristic 3D landing page using modern UI principles
- ✔ GSAP scroll animations
- ✔ Beautiful glassmorphic UI
- ✔ Product Dashboard displaying:
  - Active products
  - Soon-expiring items
  - Expired items
- ✔ Upload photo → Extract expiry using OCR
- ✔ Barcode scanning UI
- ✔ Manual entry form
- ✔ Donation & exchange suggestion page
- ✔ Animated dark/light mode
- ✔ Responsive, fast & PWA-ready
- ✔ Zustand store for local state
- ✔ React Query for API fetching

### 🖥️ Backend (Node.js + Express)

- ✔ REST APIs for products
- ✔ OCR text parsing endpoint
- ✔ Expiry date analysis logic
- ✔ Health risk alert generation
- ✔ Product categorization
- ✔ Donation suggestions endpoint
- ✔ Authentication-ready structure

### 🔥 AI & Logic Features

#### 🧠 OCR (AI Text Extraction)

- Extracts expiry date from product image
- Cleans text using regex
- Parses date formats:
  - EXP 12/10/2025
  - Best Before SEP 2025
  - Use by 15-09-2025

#### 🚨 Smart Alerts

- Soon expiring (≤ 7 days left)
- Expired items
- High-risk items for patients, e.g.,
  - Diabetic → warnings about high sugar items
  - Cardiac → high sodium alerts
  - TB → lactose & certain preservatives alerts
  - Allergy → ingredients detected in OCR

#### 🙌 Donation / Exchange Suggestions

- If a product expires in 1–5 days → show donation suggestions.

## 🧱 Tech Stack

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS
- GSAP + Framer Motion
- shadcn/ui
- Zustand
- React Query
- Cloudinary upload widget
- Zxing-js (Barcode scanner)
- Tesseract.js (OCR)

### Backend

- Node.js
- Express
- MongoDB
- Cloudinary
- OCR (Tesseract.js)
- JWT Authentication
- Cron Jobs

## 📁 Project Structure

```
smart-expiry-guardian/
│
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # Route-based pages
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── services/           # API service layer
│   ├── store/              # Zustand store
│   ├── assets/             # Static assets
│   ├── App.tsx             # Root App component
│   └── main.tsx            # Entry point
│
├── backend/                # Backend source code
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── server.js       # Express server
│   ├── package.json
│   └── .env                # Environment variables
│
├── public/                 # Public static assets
├── README.md
└── package.json            # Root package.json with concurrently script
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account
- API keys for external services

### Setup Instructions

#### 📌 1. Clone Repository
```bash
git clone https://github.com/your-username/smart-expiry-guardian.git
cd smart-expiry-guardian
```

#### 🚀 Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

Frontend runs on: http://localhost:8080/

#### 🛠️ Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the backend directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=3001
```

4. Start backend server:
```bash
npm run dev
```

Backend runs on: http://localhost:3001/

#### 🔗 Start Both Services

To run both frontend and backend concurrently:
```bash
npm run start:all
```

## 🔌 API Endpoints (Backend)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products for user
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Upload & Scanning
- `POST /api/upload/combined` - Combined barcode/photo upload with auto-fill
- `POST /api/upload/image` - Image upload with OCR
- `POST /api/upload/barcode` - Manual barcode lookup

### Chat & Feedback
- `POST /api/chat/message` - Send chat message
- `POST /api/feedback` - Submit user feedback

## 🎨 UI Screens (Frontend)

### ✅ Landing Page
- Modern glassmorphic design with animated elements
- Feature showcase with interactive cards
- Statistics dashboard showing platform impact
- Call-to-action buttons for registration/dashboard access

### 📊 Dashboard
- Product listing with status indicators
- Filtering by category and expiry status
- Quick-add buttons for new products
- Analytics charts for expiry trends

### ➕ Add Product
- Three input methods: Barcode scan, Photo upload, Manual entry
- Automatic OCR processing for expiry dates
- Product detail view with nutritional information
- Edit/delete functionality

### ❤️ Donation Portal
- Map-based NGO locator
- Donation request submission
- Tracking of donation history
- Community impact statistics

### ⚙️ Settings
- User profile management
- Health preference settings
- Notification preferences
- Dark/light mode toggle

## 🚀 Future Enhancements

- ✔ NGO donation mapping for near-expiry items
- ✔ Auto compensation claims for retailers (Gov/Brand API)
- ✔ AI spoilage prediction model
- ✔ Integration with retail POS systems
- ✔ Lab testing collaboration module
- ✔ Voice-based expiry search (for visually impaired users)
- ✔ Multi-language OCR support
- ✔ Family/shared inventory management
- ✔ Offline-first PWA mode

## 📌 Why This Project is Important

- Helps people avoid food poisoning, skin allergies, and medicine failures
- Reduces wastage for families and retailers
- Encourages sustainability through donations
- Supports digital transformation of retail stores
- Useful for government health safety regulations

## 🎉 Conclusion

Smart Expiry Guardian is a complete, modern, AI-powered expiry tracking system with:

- beautiful UI with animations
- intelligent expiry analysis
- health-aware alerts
- donation suggestions
- full frontend + backend setup

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenFoodFacts API for product data
- Cloudinary for image storage solutions
- OCR.space for OCR processing capabilities
- All the open-source libraries and tools that made this project possible

## 📞 Support

For support, email [your-email@example.com] or open an issue in the repository.

---

**Smart Expiry Guardian** - Making the world a safer, greener place, one product at a time.