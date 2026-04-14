import { useState } from 'react'

const STATUS_TEXTS = {
  200:'OK', 201:'Created', 204:'No Content', 301:'Moved', 302:'Found',
  304:'Not Modified', 400:'Bad Request', 401:'Unauthorized', 403:'Forbidden',
  404:'Not Found', 405:'Method Not Allowed', 422:'Unprocessable',
  429:'Too Many Requests', 500:'Server Error', 502:'Bad Gateway', 503:'Unavailable',
}

function getStatusClass(s) {
  if (!s || s === 0) return ''
  if (s < 300) return 'status-2xx'
  if (s < 400) return 'status-3xx'
  if (s < 500) return 'status-4xx'
  return 'status-5xx'
}

function getTimeColor(ms) {
  if (ms < 200) return 'var(--green)'
  if (ms < 600) return 'var(--yellow)'
  return 'var(--red)'
}

function JsonNode({ data, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2)
  if (data === null)             return <span style={{ color: 'var(--red)' }}>null</span>
  if (typeof data === 'boolean') return <span style={{ color: 'var(--yellow)' }}>{String(data)}</span>
  if (typeof data === 'number')  return <span style={{ color: 'var(--green)' }}>{data}</span>
  if (typeof data === 'string')  return <span style={{ color: 'var(--purple)' }}>"{data}"</span>
  const isArr = Array.isArray(data)
  const keys  = Object.keys(data)
  const O = isArr ? '[' : '{', C = isArr ? ']' : '}'
  if (!keys.length) return <span style={{ color: 'var(--muted)' }}>{O}{C}</span>
  return (
    <span>
      <button onClick={() => setOpen(v => !v)}
        style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 'inherit', padding: 0 }}
      >{open ? `▼ ${O}` : `▶ ${O}…${C}`}</button>
      {open && (
        <span>
          {keys.map((k, i) => (
            <div key={k} style={{ paddingLeft: '1.4em' }}>
              {!isArr && <span style={{ color: 'var(--blue)' }}>"{k}": </span>}
              <JsonNode data={data[k]} depth={depth + 1} />
              {i < keys.length - 1 && <span style={{ color: 'var(--muted)' }}>,</span>}
            </div>
          ))}
          <div style={{ color: 'var(--text2)' }}>{C}</div>
        </span>
      )}
    </span>
  )
}

export default function ResponsePanel({ response, error }) {
  const [copied, setCopied] = useState(false)
  const [tab,    setTab]    = useState('pretty')

  const copy = () => {
    navigator.clipboard.writeText(response?.data ? JSON.stringify(response.data, null, 2) : error || '')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (!response && !error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12, color: 'var(--muted)' }}>
      <div style={{ fontSize: 48, opacity: 0.2 }}>⚡</div>
      <p style={{ fontWeight: 700, fontSize: 15 }}>Forge your first request</p>
      <p style={{ fontSize: 13, opacity: 0.7 }}>Enter a URL above and hit Send</p>
    </div>
  )

  if (error) return (
    <div className="fade-up" style={{ padding: 16, borderRadius: 14, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
      <p style={{ color: 'var(--red)', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>⚠ Request Failed</p>
      <p className="mono" style={{ color: 'var(--text2)', fontSize: 12 }}>{error}</p>
      {(error.includes('fetch') || error.includes('CORS')) && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p style={{ fontSize: 12, color: 'var(--yellow)' }}>
            💡 CORS issue? Test with: <span className="mono">jsonplaceholder.typicode.com</span> or <span className="mono">api.github.com</span>
          </p>
        </div>
      )}
    </div>
  )

  const { data, status, time, size } = response

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Meta bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className={`mono ${getStatusClass(status)}`} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
          {status} {STATUS_TEXTS[status] || ''}
        </span>
        <span className="mono" style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: 'var(--surface2)', color: getTimeColor(time), border: '1px solid var(--border)' }}>
          ⏱ {time}ms
        </span>
        {size && (
          <span className="mono" style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
            📦 {size}
          </span>
        )}
        <button onClick={copy} style={{
          marginLeft: 'auto', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
          fontFamily: 'Syne, sans-serif', cursor: 'pointer',
          background: copied ? 'rgba(34,197,94,0.1)' : 'var(--surface2)',
          color: copied ? 'var(--green)' : 'var(--text2)',
          border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
        }}>{copied ? '✓ Copied!' : '⎘ Copy'}</button>
      </div>

      {/* Body */}
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {['pretty', 'raw'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', fontSize: 13, fontWeight: 600, fontFamily: 'Syne, sans-serif',
              cursor: 'pointer', border: 'none', background: 'transparent', textTransform: 'capitalize',
              color: tab === t ? 'var(--accent)' : 'var(--muted)',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ padding: 16, overflowY: 'auto', maxHeight: 380 }}>
          {tab === 'pretty'
            ? <div className="mono" style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text)' }}><JsonNode data={data} /></div>
            : <pre className="mono" style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</pre>
          }
        </div>
      </div>
    </div>
  )
}