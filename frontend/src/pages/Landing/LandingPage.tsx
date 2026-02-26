import { Link } from 'react-router-dom';
import './LandingPage.css';

// ── Icons ──────────────────────────────────────────────────────────────────

function IconPackage() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconZap() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────

const features = [
  {
    Icon: IconPackage,
    title: 'Produtos configuráveis',
    desc: 'Crie planos com preços, ciclos e descrições personalizados. Mensal, trimestral, semestral ou anual — do seu jeito.',
  },
  {
    Icon: IconZap,
    title: 'Checkout em segundos',
    desc: 'Formulário otimizado com validação de CPF e dados de cartão. Menos fricção entre o cliente e a conversão.',
  },
  {
    Icon: IconActivity,
    title: 'Gestão em tempo real',
    desc: 'Acompanhe cada assinatura, veja o histórico completo de transações e cancele com um clique quando precisar.',
  },
  {
    Icon: IconShield,
    title: 'Controle total',
    desc: 'Dados de cobrança organizados por CPF. Consulte, filtre e gerencie sua base de assinantes sem complicação.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Crie um produto',
    desc: 'Configure nome, descrição, preço e ciclo de cobrança. Em menos de dois minutos, seu plano está pronto.',
  },
  {
    n: '02',
    title: 'Compartilhe o checkout',
    desc: 'Envie o link de checkout para seus clientes. Eles preenchem os dados e assinam em segundos.',
  },
  {
    n: '03',
    title: 'Gerencie tudo aqui',
    desc: 'Acompanhe assinaturas ativas, histórico de transações e status de pagamento — tudo em um painel único.',
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="landing">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero__glow" />
        <div className="lp-hero__grid" />

        <div className="lp-hero__content">
          <div className="lp-hero__badge">
            <span className="lp-hero__badge-dot" />
            Plataforma de Cobranças Recorrentes
          </div>

          <h1 className="lp-hero__title">
            Transforme clientes em
            <br />
            <span className="lp-hero__title-accent">assinantes recorrentes</span>
          </h1>

          <p className="lp-hero__sub">
            Crie produtos, configure planos de cobrança e gerencie toda a sua base
            de assinantes — do checkout ao histórico de transações — em uma única
            plataforma integrada.
          </p>

          <div className="lp-hero__ctas">
            <Link to="/products" className="lp-cta lp-cta--primary">
              Explorar produtos
              <span className="lp-cta__arrow">→</span>
            </Link>
            <Link to="/subscriptions" className="lp-cta lp-cta--secondary">
              Minhas assinaturas
            </Link>
          </div>
        </div>

        <div className="lp-hero__scroll-hint" aria-hidden="true">
          <span className="lp-hero__scroll-line" />
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="lp-stats">
        <div className="lp-container">
          <div className="lp-stats__row">
            <div className="lp-stat">
              <span className="lp-stat__value">
                R$&nbsp;0<span className="lp-stat__accent">,00</span>
              </span>
              <span className="lp-stat__label">Taxa de setup</span>
            </div>
            <div className="lp-stat-sep" />
            <div className="lp-stat">
              <span className="lp-stat__value">
                4<span className="lp-stat__accent">×</span>
              </span>
              <span className="lp-stat__label">Ciclos de cobrança</span>
            </div>
            <div className="lp-stat-sep" />
            <div className="lp-stat">
              <span className="lp-stat__value">
                100<span className="lp-stat__accent">%</span>
              </span>
              <span className="lp-stat__label">Controle das assinaturas</span>
            </div>
            <div className="lp-stat-sep" />
            <div className="lp-stat">
              <span className="lp-stat__value">
                ∞
              </span>
              <span className="lp-stat__label">Assinantes por plano</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="lp-features">
        <div className="lp-container">
          <p className="lp-eyebrow">Funcionalidades</p>
          <h2 className="lp-section-title">
            Tudo que você precisa para
            <br />
            cobrar de forma recorrente
          </h2>

          <div className="lp-features__grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="lp-feature-card"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="lp-feature-card__icon">
                  <f.Icon />
                </div>
                <h3 className="lp-feature-card__title">{f.title}</h3>
                <p className="lp-feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="lp-how">
        <div className="lp-container">
          <div className="lp-how__inner">
            <div className="lp-how__left">
              <p className="lp-eyebrow">Como funciona</p>
              <h2 className="lp-section-title" style={{ marginBottom: 0 }}>
                Em três passos,
                <br />
                você começa a cobrar
              </h2>
            </div>

            <div className="lp-how__steps">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className="lp-step"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="lp-step__n">{s.n}</span>
                  <div className="lp-step__body">
                    <h3 className="lp-step__title">{s.title}</h3>
                    <p className="lp-step__desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="lp-cta-section">
        <div className="lp-container">
          <div className="lp-cta-box">
            <div className="lp-cta-box__glow" />
            <div className="lp-cta-box__content">
              <p className="lp-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
                Comece agora
              </p>
              <h2 className="lp-cta-box__title">Pronto para crescer com recorrência?</h2>
              <p className="lp-cta-box__sub">
                Explore os produtos disponíveis e ative sua primeira assinatura em minutos.
              </p>
              <div className="lp-hero__ctas" style={{ justifyContent: 'center' }}>
                <Link to="/products" className="lp-cta lp-cta--primary">
                  Ver produtos
                  <span className="lp-cta__arrow">→</span>
                </Link>
                <Link to="/subscriptions" className="lp-cta lp-cta--secondary">
                  Minhas assinaturas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer__inner">
            <span className="lp-footer__brand">
              <span className="lp-footer__brand-v">V</span>eepag
            </span>
            <span className="lp-footer__copy">
              © 2025 Veepag · Plataforma de cobranças recorrentes
            </span>
            <div className="lp-footer__links">
              <Link to="/products" className="lp-footer__link">Produtos</Link>
              <Link to="/subscriptions" className="lp-footer__link">Assinaturas</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
