import { Link } from 'react-router-dom';

const testimonios = [
  { texto: 'Excelente servicio, mi auto quedó impecable. La atención fue rápida y profesional. Muy recomendado.', autor: 'María García', rol: 'Cliente frecuente' },
  { texto: 'La mejor experiencia de lavado que he tenido. Agendar fue muy fácil y cumplieron con el horario puntualmente.', autor: 'Carlos López', rol: 'Cliente' },
  { texto: 'Desde que uso Monkey Auto Spa, mi coche siempre luce como nuevo. El personal es muy capacitado y amable.', autor: 'Ana Martínez', rol: 'Cliente frecuente' },
  { texto: 'Precios justos y excelente calidad. La página es muy fácil de usar y puedes agendar en minutos.', autor: 'Roberto Sánchez', rol: 'Cliente' },
];

export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <h1 className="hero-title">
              El mejor cuidado para <span>tu vehículo</span>
            </h1>
            <p className="hero-sub">
              Agenda tu lavado de forma rápida y sencilla. Profesionalismo, calidad y puntualidad en cada servicio.
            </p>
            <div className="hero-cta">
              <Link to="/login" className="hero-btn hero-btn-primary">Agendar ahora</Link>
              <Link to="/paquetes" className="hero-btn hero-btn-secondary">Ver paquetes</Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img src="/assets/images/image.png" alt="Autolavado" className="hero-image" />
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Nuestra <span>Filosofía</span></h2>
        <div className="mvv-grid">
          <div className="mvv-card">
            <div className="mvv-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <h3 className="mvv-title">Misión</h3>
            <p className="mvv-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          <div className="mvv-card">
            <div className="mvv-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12h1"/>
                <path d="M9 4v1"/>
                <path d="M9 19v1"/>
                <path d="M4.5 6.5l.7.7"/>
                <path d="M17.5 17.5l.7.7"/>
                <circle cx="9" cy="12" r="5"/>
                <path d="M12.5 10.5L19 17l-2 2-6.5-6.5"/>
              </svg>
            </div>
            <h3 className="mvv-title">Visión</h3>
            <p className="mvv-text">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
          <div className="mvv-card">
            <div className="mvv-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12l4 6-10 12L2 9l4-6"/>
                <path d="M2 9h20"/>
                <path d="M12 3v18"/>
              </svg>
            </div>
            <h3 className="mvv-title">Valores</h3>
            <p className="mvv-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>
        </div>
      </section>

      <section className="banner-section">
        <img src="/assets/images/image1.png" alt="Lavado de autos" className="banner-image" />
      </section>

      <section className="section" style={{ background: 'var(--white)' }}>
        <h2 className="section-title">Lo que dicen <span>nuestros clientes</span></h2>
        <div className="testimonials-with-image">
          <div className="testimonials-grid">
            {testimonios.map((t, i) => (
              <div className="testimonial-card" key={i}>
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">"{t.texto}"</p>
                <div className="testimonial-author">{t.autor}</div>
                <div className="testimonial-role">{t.rol}</div>
              </div>
            ))}
          </div>
          <div className="testimonials-image-wrapper">
            <img src="/assets/images/image2.png" alt="Auto limpio" className="testimonials-image" />
          </div>
        </div>
      </section>
    </>
  );
}
