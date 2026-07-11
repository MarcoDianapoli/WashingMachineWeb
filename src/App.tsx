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

export default function App() {
  return (
    <div className="app">
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
    </div>
  );
}
