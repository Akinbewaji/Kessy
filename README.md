# DigitalKessy 🦇✨

DigitalKessy is a premium, AI-powered dark romance ghostwriting platform. It enables authors to generate high-quality outlines, book covers, and full-length manuscripts in minutes through an intuitive, multi-step pipeline.

## 🌟 Key Features

* **AI Ghostwriting Pipeline**: Step-by-step workflow (Genre -> Characters -> Plot -> Outline -> Cover -> Manuscript) powered by Groq API (Llama-3.3-70b-versatile).
* **Credit-Based Economy**: Users purchase credits (via Paystack) to generate content. Each full manuscript costs 10 credits, while outlines/covers cost 1 credit.
* **Premium UI/UX**: Built with React, featuring a sleek, responsive "glassmorphism" design system tailored for dark romance aesthetics.
* **Personal Library**: Users can save their generated manuscripts, edit them using the built-in rich text editor (Quill), and export them directly to `.docx`.
* **RBAC Admin Dashboard**: A secure, hidden dashboard for platform owners to monitor users, manually adjust credit balances, and create custom administrative roles.

## 🛠️ Tech Stack

* **Frontend**: React (Vite), React Router, React-Quill
* **Backend (Serverless)**: Node.js / Express (for secure Groq API and DOCX generation calls)
* **Database & Auth**: Firebase Authentication & Cloud Firestore
* **Payment Gateway**: Paystack integration for seamless Naira (NGN) credit top-ups
* **AI Providers**: Groq (LLM Text Generation), Stability AI (Image Generation)

## 🚀 Getting Started

### Prerequisites
* Node.js (v16+ recommended)
* A Firebase Project (with Firestore and Authentication enabled)
* A Groq API Key
* A Paystack Public Key
* A Stability AI API Key
* SMTP credentials (for the contact form)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Akinbewaji/Kessy.git
   cd Kessy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_FIREBASE_API_KEY="your_firebase_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
   VITE_FIREBASE_APP_ID="your_firebase_app_id"
   VITE_PAYSTACK_PUBLIC_KEY="your_paystack_public_key"
   GROQ_API_KEY="your_groq_api_key"
   STABILITY_API_KEY="your_stability_api_key"
   SMTP_USER="your_smtp_email_address"
   SMTP_PASS="your_smtp_app_password"
   ADMIN_EMAIL="optional_comma_separated_admin_emails"
   ```

4. Start the development server (runs both Vite frontend and Express backend concurrently):
   ```bash
   npm run dev
   ```

## 🔒 Firebase Security Rules

For the Admin Dashboard and Library to function correctly, ensure your Cloud Firestore Security Rules are set up as follows:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /users/{userId} {
      allow get: if request.auth != null && request.auth.uid == userId;
      allow read, write: if request.auth != null && request.auth.token.email in ['digitalkessy350@gmail.com', 'akintomiwabewaji@gmail.com'];
    }
    match /roles/{roleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email in ['digitalkessy350@gmail.com', 'akintomiwabewaji@gmail.com'];
    }
    match /books/{bookId} {
      allow read, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📜 License
Copyright © 2026 DigitalKessy. All rights reserved.
