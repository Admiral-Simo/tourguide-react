# 🌍 Atlas Frontend: Narrative Mapping Interface

## 🚀 Overview

Atlas Frontend is the user-facing application that brings territorial storytelling to life, providing an intuitive interface for creating, managing, and exploring location-based narratives.

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| Language | ![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue) |
| Framework | ![React](https://img.shields.io/badge/React-18-cyan) |
| Styling | ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-blueviolet) |
| Build Tool | ![Vite](https://img.shields.io/badge/Vite-Latest-yellow) |
| State Management | ![Context API](https://img.shields.io/badge/Context%20API-React-lightgreen) |

## 🌈 Key Features

| Feature | Description | User Impact |
|---------|-------------|-------------|
| 🔐 Secure Authentication | JWT-based login system | Trusted User Experience |
| 📝 Post Management | Create, edit, draft posts | Flexible Content Creation |
| 🏷️ Categorization | Tag and categorize content | Enhanced Discoverability |
| 🌐 Responsive Design | Mobile and desktop-friendly | Seamless Access |

## 📸 Screenshots

##### 1. Login Page
![Login Page](screenshots/login-page.png)

##### 2. Home/Posts Overview
![Home Page](screenshots/home-overview.png)

##### 3. Post Creation Interface
![Create Post](screenshots/post-creation.png)

##### 4. User Dashboard
![User Dashboard](screenshots/user-dashboard.png)

##### 5. Mobile Responsive View
![Mobile View](screenshots/mobile-view.png)

## 🏗️ Project Structure

```
src/
│
├── components/
│   ├── NavBar.tsx
│   ├── PostList.tsx
│   ├── PostForm.tsx
│   └── AuthContext.tsx
│
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── PostPage.tsx
│   ├── EditPostPage.tsx
│   └── DraftsPage.tsx
│
└── services/
    └── apiService.ts
```

## 🌐 Architecture Diagram

```mermaid
graph TD
    UI[User Interface] --> Auth[Authentication]
    Auth --> Posts[Post Management]
    Posts --> Categories[Categorization]
    Categories --> Tags[Tagging System]
    Tags --> API[Backend API]
```

## 🚀 Key Technical Highlights

### Authentication Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend

    User->>Frontend: Enter Credentials
    Frontend->>Backend: Send Login Request
    Backend-->>Frontend: Return JWT Token
    Frontend->>Frontend: Store Token
    Frontend->>User: Grant Access
```

### API Service Features
- 🔒 Singleton Axios Instance
- 🛡️ Request/Response Interceptors
- 🧩 Comprehensive Endpoint Coverage
- 🚦 Error Handling Mechanisms

## 🚀 Quick Start

### Prerequisites
- 🟢 Node.js 16+
- 📦 npm/yarn

### Installation Steps
1. Clone repository
2. Run `npm install`
3. Configure `.env` file
4. Run `npm run dev`

### Environment Variables
```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## 🤝 Contributing

Help us map stories, one interface at a time:
1. 🍴 Fork the repository
2. 🌿 Create feature branch
3. 💾 Commit changes
4. 📤 Push to branch
5. 🔀 Create Pull Request

## 🧪 Testing

| Type | Tools |
|------|-------|
| Unit Testing | Jest |
| Component Testing | React Testing Library |
| E2E Testing | Cypress |

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run test suite |
| `npm run lint` | Run code linter |
