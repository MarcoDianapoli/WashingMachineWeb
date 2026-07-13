import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Paquetes from './pages/Paquetes';
import Horarios from './pages/Horarios';
import ConfirmarCita from './pages/ConfirmarCita';
import MisCitas from './pages/MisCitas';
import Exito from './pages/Exito';

// Admin imports
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';
import { Wrench, Users, DollarSign, Package, Settings } from 'lucide-react';

export default function App() {
  return (
    <div className="app">
      <Routes>
        {/* Rutas de Administrador */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="lavadores" element={<AdminPlaceholder title="Lavadores" icon={<Wrench size={64} />} />} />
          <Route path="clientes" element={<AdminPlaceholder title="Clientes" icon={<Users size={64} />} />} />
          <Route path="finanzas" element={<AdminPlaceholder title="Finanzas" icon={<DollarSign size={64} />} />} />
          <Route path="inventario" element={<AdminPlaceholder title="Inventario" icon={<Package size={64} />} />} />
          <Route path="configuraciones" element={<AdminPlaceholder title="Configuraciones" icon={<Settings size={64} />} />} />
        </Route>

        {/* Rutas de Cliente */}
        <Route path="/*" element={
          <>
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/paquetes" element={<Paquetes />} />
                <Route path="/horarios" element={<Horarios />} />
                <Route path="/confirmar-cita" element={<ConfirmarCita />} />
                <Route path="/mis-citas" element={<MisCitas />} />
                <Route path="/exito" element={<Exito />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}
