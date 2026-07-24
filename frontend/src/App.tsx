import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Packages from './pages/Packages';
import Schedule from './pages/Schedule';
import ConfirmAppointment from './pages/ConfirmAppointment';
import MyAppointments from './pages/MyAppointments';
import Success from './pages/Success';

// Admin imports
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminWashers from './pages/admin/AdminWashers';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';
import { Users, DollarSign, Package, Settings } from 'lucide-react';

export default function App() {
  return (
    <div className="app">
      <Routes>
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="citas" element={<AdminAppointments />} />
          <Route path="lavadores" element={<AdminWashers />} />
          <Route path="clientes" element={<AdminPlaceholder title="Clientes" icon={<Users size={64} />} />} />
          <Route path="finanzas" element={<AdminPlaceholder title="Finanzas" icon={<DollarSign size={64} />} />} />
          <Route path="inventario" element={<AdminPlaceholder title="Inventario" icon={<Package size={64} />} />} />
          <Route path="configuraciones" element={<AdminPlaceholder title="Configuraciones" icon={<Settings size={64} />} />} />
        </Route>

        {/* Public client routes */}
        <Route path="/*" element={
          <>
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/paquetes" element={<Packages />} />
                <Route path="/horarios" element={<Schedule />} />
                <Route path="/confirmar-cita" element={<ConfirmAppointment />} />
                <Route path="/mis-citas" element={<MyAppointments />} />
                <Route path="/exito" element={<Success />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}
