import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Lightbulb, HelpCircle, Disc, CheckSquare, ToggleRight, Clock,
  Sparkles, Check, FileText, Link2, Keyboard, ChevronDown, CheckCircle,
  GripVertical, Zap, ChevronRight, Users, ArrowRight,
} from 'lucide-react'
import './Landing.css'

const DEMO_OPTS = [
  { label: 'A. Atlantycki',  correct: false },
  { label: 'B. Spokojny',    correct: true  },
  { label: 'C. Indyjski',    correct: false },
  { label: 'D. Arktyczny',  correct: false },
]

const QTYPES = [
  { Icon: Disc,         bg: '#EEEDFE', color: '#3C3489', title: 'Jednokrotny wybór',   desc: 'Klasyczne pytanie z jedną poprawną odpowiedzią. Szybkie i czytelne.' },
  { Icon: CheckSquare,  bg: '#FFF8CC', color: '#7a6000', title: 'Wielokrotny wybór',   desc: 'Kilka poprawnych odpowiedzi naraz. Sprawdza głębszą wiedzę.' },
  { Icon: ToggleRight,  bg: '#FAECE7', color: '#993C1D', title: 'Prawda / Fałsz',      desc: 'Proste stwierdzenie do oceny. Idealne na rozgrzewkę lub szybkie sprawdziany.' },
  { Icon: Clock,        bg: '#F1EFE8', color: '#888780', title: 'Wkrótce...',           desc: 'Pracujemy nad kolejnymi formatami: dopasowywanie, sortowanie i więcej.', soon: true },
]

const FAQS = [
  { q: 'Jak dołączyć do quizu?', a: 'Poproś prowadzącego o 6-znakowy kod quizu. Wejdź na stronę KreatorQuiz, kliknij "Dołącz do quizu" i wpisz kod. Nie musisz zakładać konta. Wystarczy podać swoje imię i gotowe. Całość zajmuje mniej niż 30 sekund.' },
  { q: 'Jak podejrzeć wyniki uczestników?', a: 'Po zakończeniu quizu przejdź do zakładki "Wyniki" przy sesji. Zobaczysz listę uczestników z ich wynikami, czas rozwiązywania oraz podział na poszczególne pytania.' },
  { q: 'Jak działa asystent AI?', a: 'Wklej tekst lub prześlij do 5 plików PDF. AI wygeneruje pytania ABCD z losowo rozmieszczonymi poprawnymi odpowiedziami. Możesz wybrać które pytania dodać do istniejącego quizu lub zapisać jako nowy.' },
  { q: 'Czy KreatorQuiz jest darmowy?', a: 'Tak! Platforma jest w pełni darmowa. Twórz quizy, uruchamiaj sesje i korzystaj z asystenta AI bez żadnych opłat.' },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E8E6DF', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '18px 20px', fontWeight: 600, fontSize: 15, color: open ? '#7F77DD' : '#1a1a18', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontFamily: "'Nunito Sans', sans-serif", textAlign: 'left' }}
      >
        {q}
        <ChevronDown size={18} className={`lp-faq-icon${open ? ' open' : ''}`} style={{ color: '#5F5E5A', flexShrink: 0 }} />
      </button>
      <div className={`lp-faq-a${open ? ' open' : ''}`}>{a}</div>
    </div>
  )
}

export default function Landing() {
  const [demoState, setDemoState] = useState(null) // null | 'answered'
  const [picked, setPicked] = useState(null)

  function handleAnswer(idx) {
    if (demoState) return
    setPicked(idx)
    setDemoState('answered')
  }

  return (
    <div className="lp">

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-blob" style={{ width: 380, height: 380, background: '#FFDA00', top: -100, left: -100 }} />
        <div className="lp-blob" style={{ width: 280, height: 280, background: '#7F77DD', bottom: -80, right: -80 }} />
        <div className="lp-blob" style={{ width: 200, height: 200, background: '#F0997B', top: 30, right: '8%' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 620, margin: '0 auto' }}>
          {/* Title */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 'clamp(56px,10vw,96px)', fontWeight: 800, fontStyle: 'italic', color: '#1a1a18', letterSpacing: -2 }}>
              Kreator<span style={{ color: '#7F77DD' }}>Quiz</span>
            </span>
          </div>

          <p className="lp-tagline" style={{ maxWidth: 520, margin: '0 auto 14px' }}>
            Twórz quizy, które uczą, bawią i angażują Twoją społeczność.<br />
            Bo Twoi odbiorcy zasługują na więcej niż suchy test.
          </p>

          {/* Demo card */}
          <div style={{ maxWidth: 920, margin: '0 auto 32px', perspective: 1200 }}>
            <div className="lp-demo-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#7F77DD', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <HelpCircle size={13} /> Pytanie 1 / 1
                </span>
              </div>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 700, color: '#1a1a18', marginBottom: 24, lineHeight: 1.35 }}>
                Który ocean jest największy na świecie?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {DEMO_OPTS.map((opt, i) => {
                  let cls = 'lp-opt'
                  if (demoState && picked === i) cls += opt.correct ? ' correct' : ' wrong'
                  if (demoState && opt.correct && picked !== i) cls += ' correct'
                  return (
                    <button
                      key={i}
                      className={cls}
                      onClick={() => handleAnswer(i)}
                      disabled={!!demoState}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <Link to="/register" className="lp-btn">
            Zacznij za darmo <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── AI SECTION ── */}
      <section className="lp-ai-section" style={{ background: '#FFFDF5', maxWidth: 1200, margin: '0 auto', alignItems: 'center' }}>
        <div>
          <div className="lp-label">Kreator AI</div>
          <h2 className="lp-h2" style={{ marginBottom: 14 }}>Quiz gotowy w 30 sekund. Dosłownie.</h2>
          <p className="lp-sub" style={{ marginBottom: 20 }}>
            Wklej temat, artykuł, notatki z lekcji albo opis szkolenia. Nasz AI przeczyta to, zrozumie i sam ułoży pytania z odpowiedziami. Ty tylko zatwierdzasz.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {[
              [FileText, 'Z własnych materiałów'],
              [Keyboard, 'Przy pomocy zwykłego tekstu'],
            ].map(([Icon, label]) => (
              <span key={label} style={{ background: '#EEEDFE', color: '#3C3489', fontSize: 13, fontWeight: 600, padding: '6px 13px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon size={13} /> {label}
              </span>
            ))}
          </div>
          <Link to="/ai" className="lp-btn-outline">
            Wypróbuj asystenta AI <ArrowRight size={15} />
          </Link>
        </div>

        {/* AI graphic mockup */}
        <div className="lp-ai-mockup" style={{ background: '#fff', borderRadius: 24, border: '1.5px solid #E8E6DF', padding: 40, minHeight: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            {['#FF6058','#FFBD2E','#28C941'].map(c => <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />)}
            <span style={{ fontSize: 15, color: '#5F5E5A', marginLeft: 8, fontWeight: 600 }}>Kreator AI</span>
          </div>
          <div style={{ background: '#F7F6F2', borderRadius: 14, padding: '16px 20px', fontSize: 16, color: '#5F5E5A', marginBottom: 20, border: '1px solid #E8E6DF' }}>
            <span style={{ color: '#1a1a18', fontWeight: 600 }}>Temat:</span> Fotosynteza: jak rośliny produkują energię ze światła słonecznego...
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, color: '#7F77DD', marginBottom: 22, fontWeight: 500 }}>
            <Sparkles size={20} />
            Generuję pytania
            <span className="lp-dot-anim"><span /><span /><span /></span>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E8E6DF', padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              <CheckCircle size={13} style={{ verticalAlign: -2, marginRight: 6 }} />Wygenerowane pytanie
            </div>
            <p style={{ fontSize: 17, fontWeight: 600, color: '#1a1a18', marginBottom: 12 }}>Co jest głównym produktem fotosyntezy?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 15, padding: '8px 14px', borderRadius: 10, background: '#E1F5EE', border: '1px solid #1D9E75', color: '#085041', fontWeight: 600 }}>A. ✓ Glukoza i tlen</div>
              {['B. Dwutlenek węgla i woda','C. Azot i wodór'].map(a => (
                <div key={a} style={{ fontSize: 15, padding: '8px 14px', borderRadius: 10, border: '1px solid #E8E6DF', color: '#5F5E5A' }}>{a}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── QUESTION TYPES ── */}
      <section className="lp-section" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="lp-label">Typy pytań</div>
        <h2 className="lp-h2" style={{ marginBottom: 10 }}>Każdy format, który znasz</h2>
        <p className="lp-sub" style={{ marginBottom: 40 }}>Wybierz typ pasujący do tematu lub mieszaj je swobodnie w jednym quizie.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 22 }}>
          {QTYPES.map(({ Icon, bg, color, title, desc, soon }) => (
            <div key={title} style={{ background: '#fff', borderRadius: 22, border: '1.5px solid #E8E6DF', padding: '34px 28px', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <div style={{ width: 63, height: 63, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 20 }}>
                <Icon size={30} />
              </div>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, color: '#1a1a18', marginBottom: 10, fontWeight: 700 }}>{title}</h3>
              <p style={{ fontSize: 16, color: '#5F5E5A', lineHeight: 1.6 }}>{desc}</p>
              {soon && <span style={{ display: 'inline-block', background: '#F1EFE8', color: '#888780', fontSize: 13, fontWeight: 600, padding: '5px 13px', borderRadius: 100, marginTop: 12 }}>Wkrótce</span>}
            </div>
          ))}
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── FEATURES ALTERNATING ── */}
      <section id="funkcje" className="lp-section" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="lp-label">Funkcje</div>
        <h2 className="lp-h2" style={{ marginBottom: 10 }}>Przemyślane do ostatniego szczegółu</h2>
        <p className="lp-sub" style={{ marginBottom: 0 }}>Narzędzia, które sprawiają że prowadzenie quizów jest proste i przyjemne.</p>

        {/* Row 1: Join with code */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48, alignItems: 'center', padding: '56px 0', borderBottom: '1px solid #E8E6DF' }}>
          <div>
            <div className="lp-label">Dołączanie</div>
            <h3 className="lp-h3" style={{ marginBottom: 12 }}>Wejdź kodem. Bez rejestracji.</h3>
            <p className="lp-sub">Uczestnicy wpisują krótki 6-znakowy kod i od razu zaczynają. Żadnego zakładania kont, żadnych maili. Liczy się tylko wiedza.</p>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #E8E6DF', padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#5F5E5A', marginBottom: 16 }}>Wpisz kod quizu</p>
            <div className="lp-code-boxes" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              {['4','7','2','9','1','3'].map((d, i) => (
                <div key={i} style={{ width: 44, height: 54, borderRadius: 10, border: '2px solid #EEEDFE', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", fontSize: 24, fontWeight: 800, color: '#3C3489' }}>{d}</div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#5F5E5A', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <CheckCircle size={16} style={{ color: '#1D9E75' }} /> Gotowe! Dołączasz w 5 sekund
            </div>
          </div>
        </div>

        {/* Row 2: Timer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48, alignItems: 'center', padding: '56px 0', borderBottom: '1px solid #E8E6DF' }}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #E8E6DF', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E8E6DF" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#7F77DD" strokeWidth="10"
                  strokeDasharray="314" strokeDashoffset="220" strokeLinecap="round" transform="rotate(-90 60 60)"/>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", fontSize: 30, fontWeight: 800, color: '#1a1a18' }}>
                18<span style={{ fontSize: 14, fontWeight: 600, color: '#5F5E5A' }}>s</span>
              </div>
            </div>
            <div style={{ background: '#F7F6F2', borderRadius: 12, padding: '12px 18px', width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Czas na pytanie','30s'],['Pokaż odliczanie','✓']].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#5F5E5A', fontWeight: 500 }}>{k}</span>
                  <span style={{ fontWeight: 700, color: '#1a1a18' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="lp-label">Czas</div>
            <h3 className="lp-h3" style={{ marginBottom: 12 }}>Limit czasowy, który motywuje</h3>
            <p className="lp-sub">Ustaw czas na całe pytanie lub na każde osobno. Tykający zegar podnosi skupienie i sprawia, że quiz staje się prawdziwym wyzwaniem.</p>
          </div>
        </div>

        {/* Row 3: Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48, alignItems: 'center', padding: '56px 0' }}>
          <div>
            <div className="lp-label">Zarządzanie</div>
            <h3 className="lp-h3" style={{ marginBottom: 12 }}>Panel, który mówi więcej niż tabela</h3>
            <p className="lp-sub">Wszystkie quizy, uczestnicy i wyniki w jednym miejscu. Sprawdź kto poradził sobie najlepiej i które pytania sprawiały trudność. Jednym rzutem oka.</p>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #E8E6DF', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18' }}>Quiz z biologii</span>
              <span style={{ background: '#E1F5EE', color: '#085041', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>24 uczestników</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { initials: 'AK', name: 'Anna K.',   pct: 92, bar: '#1D9E75', bg: '#E1F5EE', tc: '#085041' },
                { initials: 'MW', name: 'Marek W.',  pct: 78, bar: '#7F77DD', bg: '#EEEDFE', tc: '#3C3489' },
                { initials: 'ZP', name: 'Zofia P.',  pct: 65, bar: '#FAC725', bg: '#FFF8CC', tc: '#7a6000' },
                { initials: 'TR', name: 'Tomek R.',  pct: 51, bar: '#F0997B', bg: '#FAECE7', tc: '#993C1D' },
              ].map(({ initials, name, pct, bar, bg, tc }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, color: tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18', minWidth: 60 }}>{name}</span>
                  <div style={{ flex: 1, height: 8, background: '#E8E6DF', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: bar, borderRadius: 100 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#5F5E5A', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── FAQ ── */}
      <section className="lp-section" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="lp-label">FAQ</div>
        <h2 className="lp-h2" style={{ marginBottom: 10 }}>Częste pytania</h2>
        <p className="lp-sub" style={{ marginBottom: 36 }}>Nie możesz znaleźć odpowiedzi? Napisz do nas.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map(f => <FaqItem key={f.q} {...f} />)}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-blob" style={{ width: 320, height: 320, top: -100, left: -80 }} />
        <div className="lp-cta-blob" style={{ width: 240, height: 240, bottom: -80, right: -60 }} />
        <div className="lp-cta-blob" style={{ width: 160, height: 160, top: 20, right: '20%' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 'clamp(28px,5vw,48px)', color: '#fff', marginBottom: 14, lineHeight: 1.2, fontWeight: 800 }}>
            Gotowy, by zacząć edukować?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 17, maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.65 }}>
            Twórz quizy, uruchamiaj sesje i korzystaj z asystenta AI. Za darmo.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link to="/register" className="lp-btn-white">
              Zarejestruj się za darmo <ChevronRight size={18} />
            </Link>
            <Link to="/join" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Dołącz do quizu
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#FFFDF5', borderTop: '1px solid #E8E6DF', padding: '32px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo_48x48.png" alt="KreatorQuiz" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, fontWeight: 800, color: '#1a1a18' }}>KreatorQuiz</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {[['Moje quizy', '/dashboard'],['Kreator', '/creator'],['Asystent AI', '/ai'],['Katalog', '/catalog'],['Dołącz do quizu', '/join']].map(([label, to]) => (
              <Link key={label} to={to} style={{ fontSize: 14, color: '#5F5E5A', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#7F77DD'}
                onMouseLeave={e => e.currentTarget.style.color = '#5F5E5A'}
              >{label}</Link>
            ))}
          </div>
          <span style={{ fontSize: 12, color: '#888780' }}>Projekt AGH - Technologie Internetowe</span>
        </div>
      </footer>

    </div>
  )
}
