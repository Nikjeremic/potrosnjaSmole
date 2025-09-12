import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Consumption from './components/Consumption';
import Materials from './components/Materials';
import Resins from './components/Resins';
import Users from './components/Users';
import ProtectedRoute from './components/ProtectedRoute';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './index.css';

function App() {
  return (
    <PrimeReactProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="consumption" element={<Consumption />} />
              <Route path="materials" element={<Materials />} />
              <Route path="resins" element={<Resins />} />
              <Route path="users" element={<Users />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </PrimeReactProvider>
  );
}

export default App;
