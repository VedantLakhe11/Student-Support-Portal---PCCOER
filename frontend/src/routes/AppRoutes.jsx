import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import StudentDashboard from '../pages/StudentDashboard';
import FacultyDashboard from '../pages/FacultyDashboard';
import AlumniDashboard from '../pages/AlumniDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ComplaintDetailsPage from '../pages/ComplaintDetailsPage';
import ProfilePage from '../pages/ProfilePage';
import LibraryPage from '../pages/LibraryPage';
import NotFoundPage from '../pages/NotFoundPage';

// Upgraded Premium Pages
import ChatPage from '../pages/ChatPage';
import SocialFeedPage from '../pages/SocialFeedPage';
import ProjectsHubPage from '../pages/ProjectsHubPage';
import MarketplacePage from '../pages/MarketplacePage';
import LeaderboardPage from '../pages/LeaderboardPage';
import EventsDashboard from '../pages/EventsDashboard';
import EventDetailsPage from '../pages/EventDetailsPage';
import CreateEventPage from '../pages/CreateEventPage';

// Layout & Protection
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  // Smart dashboard director based on User Role
  const DashboardSelector = () => {
    if (user?.role === 'admin') {
      return (
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      );
    }
    if (user?.role === 'faculty') {
      return (
        <DashboardLayout>
          <FacultyDashboard />
        </DashboardLayout>
      );
    }
    if (user?.role === 'alumni') {
      return (
        <DashboardLayout>
          <AlumniDashboard />
        </DashboardLayout>
      );
    }
    return (
      <DashboardLayout>
        <StudentDashboard />
      </DashboardLayout>
    );
  };

  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />
        }
      />
      <Route
        path="/reset-password"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />
        }
      />

      {/* Protected Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardSelector />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaint/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ComplaintDetailsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <LibraryPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ChatPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/social"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SocialFeedPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProjectsHubPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MarketplacePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EventsDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EventDetailsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/create"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CreateEventPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <LeaderboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
