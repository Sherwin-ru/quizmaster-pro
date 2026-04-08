# QuizMaster Pro 🚀

QuizMaster Pro is a polished, real-time online quiz platform built with a modern **Neo-Brutalist** aesthetic. It allows admins to create and manage quizzes while providing students with a seamless, timed quiz-taking experience with instant results.

![Neo-Brutalist Design](https://picsum.photos/seed/quiz/1200/600)

## ✨ Features

### 👨‍🏫 Admin Portal
- **Dashboard**: Monitor total quizzes, live student sessions, and recent results.
- **Quiz Creator**: Build custom quizzes with up to 10 multiple-choice questions.
- **Real-time Monitoring**: See which students are currently taking quizzes.
- **Management**: Easily delete or update existing quizzes.

### 🎓 Student Portal
- **Dashboard**: View available quizzes and personal performance stats.
- **Timed Quizzes**: Take quizzes with a real-time countdown timer.
- **Instant Results**: Get your score and accuracy percentage immediately after submission.
- **Attempt History**: Track past quiz attempts and scores.

### 🛠 Technical Highlights
- **Real-time Sync**: Powered by Firebase Firestore `onSnapshot` for live updates.
- **Role-Based Access**: Automatic role assignment (Admin/Student) based on email.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS.
- **Neo-Brutalist UI**: High-contrast, bold aesthetic using custom shadows and pastel palettes.

## 🚀 Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Express.js](https://expressjs.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) (Google Provider)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/quizmaster-pro.git
cd quizmaster-pro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration
Create a `firebase-applet-config.json` in the root directory with your Firebase project credentials:
```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "YOUR_DATABASE_ID"
}
```

### 4. Environment Variables
Create a `.env` file based on `.env.example`:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### 5. Run the Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 🔒 Security Rules

Ensure you deploy the provided `firestore.rules` to your Firebase project to protect user data and quiz content.

## 📄 License

This project is licensed under the Apache-2.0 License.

---

Built with ❤️ using Google AI Studio.
