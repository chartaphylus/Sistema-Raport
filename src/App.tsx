import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SearchRaport } from './components/SearchRaport';
import { LoginForm } from './components/LoginForm';
import { TeacherDashboard } from './components/TeacherDashboard';
import { RaportListPage } from './components/RaportListPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SearchRaport />} />
          <Route path="login" element={<LoginForm />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/raport"
            element={
              <ProtectedRoute>
                <RaportListPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;