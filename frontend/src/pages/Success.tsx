import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/mis-citas');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="success-page">
      <div className="success-circle">
        <span className="success-check">✓</span>
      </div>
      <h1 className="success-title">Cita agendada</h1>
      <p className="success-sub">Tu cita ha sido registrada exitosamente.</p>
      <p className="success-redirect">Serás redirigido a Mis Citas en {countdown} segundos...</p>
    </div>
  );
}
