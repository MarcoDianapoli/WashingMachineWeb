import { CarFront, Clock, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Autos Lavados', value: 120, icon: <CarFront size={28} />, color: 'var(--success)' },
    { label: 'Pendientes', value: 15, icon: <Clock size={28} />, color: 'var(--warning)' },
    { label: 'Futuros', value: 34, icon: <Calendar size={28} />, color: 'var(--red)' },
  ];

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Dashboard</h1>
        <p>Resumen de actividad</p>
      </header>

      <div className="dashboard-stats">
        {stats.map((stat, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* You can add more dashboard content like charts here later */}
    </div>
  );
}
