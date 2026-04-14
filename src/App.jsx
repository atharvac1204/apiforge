import { useState, useEffect } from 'react'
import RequestPanel  from './components/RequestPanel'
import ResponsePanel from './components/ResponsePanel'
import HistoryPanel  from './components/HistoryPanel'

const SAMPLES = [
  { label: '🐶 Dog',      method: 'GET', url: 'https://dog.ceo/api/breeds/image/random' },
  { label: '🐱 Cat Fact', method: 'GET', url: 'https://catfact.ninja/fact' },
  { label: '👤 GitHub',   method: 'GET', url: 'https://api.github.com/users/torvalds' },
  { label: '📝 Post',     method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1' },
]

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export default function App() {
  const [theme,    setTheme]    = useState(() => localStorage.getItem('apiforge_theme') || 'dark')
  const [response, setResponse] = useState(null)
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [history,  setHistory]  = useState([])
  const [sideTab,  setSideTab]  = useState('history')
  const [reqKey,   setReqKey]   = useState(0)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('apiforge_theme', theme)
  }, [theme])

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem('apiforge_history') || '[]')) } catch {}
  }, [])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const pushHistory = (entry) => {
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, 20)
      localStorage.setItem('apiforge_history', JSON.stringify(next))
      return next
    })
  }

  const handleSend = async ({ method, url, headers, body }) => {
    setLoading(true); setError(null); setResponse(null)
    const start = Date.now()
    try {
      const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } }
      if (body && !['GET', 'DELETE'].includes(method)) opts.body = body
      const res  = await fetch(url, opts)
      const time = Date.now() - start
      const text = await res.text()
      const size = formatSize(new Blob([text]).size)
      let data; try { data = JSON.parse(text) } catch { data = text }
      pushHistory({ method, url, status: res.status, time, timestamp: new Date().toLocaleTimeString() })
      setResponse({ data, status: res.status, time, size })
    } catch (err) {
      const time = Date.now() - start
      const msg  = err.message === 'Failed to fetch'
        ? 'Failed to fetch — possible CORS issue or invalid URL.'
        : err.message
      setError(msg)
      pushHistory({ method, url, status: 0, time, timestamp: new Date().toLocaleTimeString() })
    } finally { setLoading(false) }
  }

  const isDark = theme === 'dark'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 60,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 16, color: '#fff',
            boxShadow: '0 2px 10px rgba(249,115,22,0.4)',
          }}>A</div>
          <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            API<span style={{ color: 'var(--accent)' }}>Forge</span>
          </span>
          <span className="mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
            v1.0
          </span>
        </div>

        {/* Sample buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginRight: 2 }}>Try:</span>
          {SAMPLES.map(s => (
            <button
              key={s.label}
              onClick={() => handleSend({ method: s.method, url: s.url, headers: {}, body: '' })}
              style={{
                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                background: 'var(--surface2)', color: 'var(--text2)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text2)' }}
            >{s.label}</button>
          ))}
        </div>

        {/* Theme toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>{isDark ? '🌙' : '☀️'}</span>
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`} />
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
            {isDark ? 'Dark' : 'Light'}
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 60px)' }}>

        {/* Sidebar */}
        <aside style={{
          width: 280, flexShrink: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {['history', 'tips'].map(t => (
              <button key={t} onClick={() => setSideTab(t)} style={{
                flex: 1, padding: '12px 0', fontSize: 13, fontWeight: 600,
                fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                border: 'none', background: 'transparent', textTransform: 'capitalize',
                color: sideTab === t ? 'var(--accent)' : 'var(--muted)',
                borderBottom: sideTab === t ? '2px solid var(--accent)' : '2px solid transparent',
              }}>{t}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {sideTab === 'history'
              ? <HistoryPanel
                  history={history}
                  onSelect={item => { setReqKey(k => k + 1); alert(`Re-use:\n${item.method} ${item.url}`) }}
                  onClear={() => { setHistory([]); localStorage.removeItem('apiforge_history') }}
                />
              : <TipsPanel />
            }
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section className="fade-up">
            <SectionLabel>Request</SectionLabel>
            <RequestPanel key={reqKey} onSend={handleSend} loading={loading} />
          </section>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Response</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <section>
            <ResponsePanel response={response} error={error} />
          </section>
        </main>
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
      {children}
    </p>
  )
}

function TipsPanel() {
  const tips = [
    { icon: '⚡', title: 'Quick Send',  desc: 'Ctrl+Enter from URL bar sends instantly.' },
    { icon: '🐶', title: 'Test APIs',   desc: 'Use dog.ceo or jsonplaceholder for safe testing.' },
    { icon: '🔐', title: 'Auth Header', desc: 'Add Authorization: Bearer <token> in Headers.' },
    { icon: '📦', title: 'POST Body',   desc: 'Switch to Body tab and paste raw JSON.' },
    { icon: '⚠️', title: 'CORS Errors', desc: 'Some APIs block browser requests — use public APIs.' },
    { icon: '📋', title: 'History',     desc: 'Last 20 requests auto-saved across sessions.' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} className="stagger">
      {tips.map((tip, i) => (
        <div key={i} className="slide-right" style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{tip.icon} {tip.title}</p>
          <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>{tip.desc}</p>
        </div>
      ))}
    </div>
  )
}