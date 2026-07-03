import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import ChatPage from './features/chat/pages/ChatPage'
import CvReviewPage from './features/cv-review/pages/CvReviewPage'
import InterviewPage from './features/interview/pages/InterviewPage'
import LinkedinReviewPage from './features/linkedin/pages/LinkedinReviewPage'
import CareerRoadmapPage from './features/roadmap/pages/CareerRoadmapPage'
import HistoryPage from './features/history/pages/HistoryPage'
import ProfilePage from './features/profile/pages/ProfilePage'
import SettingsPage from './features/settings/pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected dashboard routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/cv-review" element={<CvReviewPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/linkedin" element={<LinkedinReviewPage />} />
              <Route path="/roadmap" element={<CareerRoadmapPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
