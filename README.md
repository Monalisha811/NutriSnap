# 🍎 NutriSnap

### AI-Powered Food Recognition & Nutrition Estimation

NutriSnap is an AI-powered web application that identifies food from images and provides an estimated nutritional breakdown.

The application uses **Google Gemini** for food recognition and matches the detected food with NutriSnap's nutrition database. Users can also provide details such as portion size, food source, cooking method, and cooking oil to make the nutrition estimate more relevant.

---

## ✨ Features

- 📷 AI-based food recognition using Google Gemini
- 🎯 Food detection with confidence score
- 🍽️ Portion-size selection
- 🏠 Homemade, restaurant, and street-food options
- 🔥 Cooking method selection
- 🫒 Cooking oil selection
- 🧮 Calories and macronutrient estimation
- 💾 Save meals
- 📊 Daily nutrition dashboard
- 📜 Meal history
- 🔐 Secure environment-variable based API configuration
- 🌐 Railway deployment

---

## 🤖 AI Food Recognition

NutriSnap uses **Google Gemini** to analyze uploaded food images.

The image is sent from the Flask backend to Gemini along with the food names supported by NutriSnap's nutrition database.

Gemini identifies the most likely food item and returns a confidence score. The detected food is then matched with the nutrition database before the final nutrition information is returned.

### AI Pipeline

```text
Food Image
     ↓
Google Gemini
     ↓
Detected Food + Confidence
     ↓
NutriSnap Nutrition Database
     ↓
Nutrition Information
     ↓
Portion / Preparation Adjustment
     ↓
Final Nutrition Estimate
```

---

## 🔄 How NutriSnap Works

```text
Upload Food Image
        ↓
Gemini AI Food Recognition
        ↓
Confirm / Edit Food
        ↓
Enter Portion & Preparation Details
        ↓
Adjusted Nutrition Estimate
        ↓
Save Meal
        ↓
Dashboard + Meal History
```

---

## 🛠️ Tech Stack

### Frontend

- React
- JavaScript
- HTML
- CSS

### Backend

- Python
- Flask
- Flask-JWT-Extended
- Flask-SQLAlchemy

### AI

- Google Gemini
- Google Gen AI Python SDK

### Database

- SQLite

### Tools

- Visual Studio Code
- Git
- GitHub

### Deployment

- Railway

---

## 🔌 API Endpoints

### Health Check

```http
GET /api/health
```

Checks whether the NutriSnap backend is running.

### Analyze Food

```http
POST /api/meals/analyze
```

Accepts a food image and returns food detection and nutrition information.

Example:

```bash
curl -X POST \
  -F "image=@pizza.png" \
  https://nutrisnap-production-aefb.up.railway.app/api/meals/analyze
```

---

## 🧮 Nutrition Estimation

After identifying the food, NutriSnap uses its nutrition database to retrieve nutritional information.

The system can consider:

- Food type
- Portion size
- Food source
- Cooking method
- Cooking oil
- Spice level

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend` directory:

```env
GEMINI_API_KEY=your-gemini-api-key
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///nutrisnap.db
```

> ⚠️ Never commit your `.env` file or expose your API keys publicly.

---

## 🚀 Deployment

The NutriSnap backend is deployed using **Railway**.

### Production API

https://nutrisnap-production-aefb.up.railway.app

### Health Check

https://nutrisnap-production-aefb.up.railway.app/api/health

---

## 🧪 Production Test

The production food-analysis endpoint has been successfully tested with a food image.

Example:

```text
Input:
Margherita Pizza image

Detected Food:
Margherita Pizza

Confidence:
0.98
```

The API successfully returned nutrition information including calories, protein, carbohydrates, fat, fiber, sodium, calcium, iron, potassium, sugar, and vitamin C.

---

## 🔒 Security

- API keys are stored using environment variables.
- `.env` is excluded from GitHub.
- Gemini credentials are kept on the backend.
- The Gemini API key is not exposed to the frontend.

---

## 👩‍💻 Author

**Monalisha Biswas**

B.Tech Computer Science & Engineering (AI)

GitHub: https://github.com/Monalisha811

---

## ⭐ Project

NutriSnap combines **AI-powered image recognition, nutrition data, and a web application** to make food analysis easier and more accessible.

```text
Snap → Identify → Analyze → Understand → Eat Better 🍎
```