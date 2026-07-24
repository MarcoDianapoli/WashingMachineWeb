import React from 'react';

interface AdminPlaceholderProps {
  title: string;
  icon: React.ReactNode;
}

export default function AdminPlaceholder({ title, icon }: AdminPlaceholderProps) {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>{title}</h1>
        <p>Gestión de {title.toLowerCase()}</p>
      </header>

      <div className="placeholder-content">
        <div className="placeholder-icon">{icon}</div>
        <h2>Sección en construcción</h2>
        <p>Próximamente podrás administrar los datos de {title.toLowerCase()} aquí.</p>
      </div>
    </div>
  );
}
