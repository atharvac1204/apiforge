import { useState } from 'react'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

export default function RequestPanel({ onSend, loading }) {
  const [method,  setMethod]  = useState('GET')
  const [url,     setUrl]     = useState('')
  const [tab,     setTab]     = useState('headers')
  const [headers, setHeaders] = useState([{ key: '', value: '' }])
  const [body,    setBody]    = useState('')

  const addHeader    = () => setHeaders([...headers, { key: '', value: '' }])
  const removeHeader = (i) => setHeaders(headers.filter((_, idx) => idx !== i))
  const updateHeader = (i, field, val) => {
    const h = [...headers]; h[i][field] = val; setHeaders(h)
  }

  const handleSend = () => {
    if (!url.trim()) return
    const parsedHeaders = {}
    headers.forEach(h => { if (h.key.trim()) parsedHeaders[h.key.trim()] = h.value.trim() })
    onSend({ method, url: url.trim(), headers: parsedHeaders, body })
  }

  const filledHeaders = headers.filter(h => h.key.trim()).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* URL Row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className={`mono method-${method}`}
          style={{ padding: '10px 12px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', outline: 'none', flexShrink: 0 }}
        >
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <input
          type="text"
          placeholder="https://api.example.com/endpoint"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) && handleSend()}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13, outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accentbg)' }}
          onBlur={e =>  { e.target.style.borderColor = 'var(--border)';  e.target.style.boxShadow = 'none' }}
        />

        <button
          onClick={handleSend}
          disabled={loading || !url.trim()}
          style={{
            padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: 13,
            fontFamily: 'Syne, sans-serif',
            background: loading ? 'var(--surface3)' : 'var(--accent)',
            color: loading ? 'var(--muted)' : '#fff',
            border: 'none', cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
            opacity: !url.trim() ? 0.45 : 1,
            display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
            boxShadow: !loading && url.trim() ? '0 2px 12px rgba(249,115,22,0.35)' : 'none',
          }}
          onMouseEnter={e => { if (!loading && url.trim()) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.45)' }}}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = !loading && url.trim() ? '0 2px 12px rgba(249,115,22,0.35)' : 'none' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        >
          {loading
            ? <><span className="spinning" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Sending</>
            : <><span>⚡</span> Send</>
          }
        </button>
      </div>

      {/* Tabs */}
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {['headers', 'body'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '11px 20px', fontSize: 13, fontWeight: 600, fontFamily: 'Syne, sans-serif',
              cursor: 'pointer', border: 'none', background: 'transparent',
              color: tab === t ? 'var(--accent)' : 'var(--muted)',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6, textTransform: 'capitalize',
            }}>
              {t}
              {t === 'headers' && filledHeaders > 0 && (
                <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '1px 7px' }}>
                  {filledHeaders}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding: 16 }}>
          {tab === 'headers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} className="stagger">
              {headers.map((h, i) => (
                <div key={i} className="slide-right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input placeholder="Key" value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)} className="mono"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                  />
                  <input placeholder="Value" value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)} className="mono"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button onClick={() => removeHeader(i)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--red)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)';      e.currentTarget.style.color = 'var(--muted)' }}
                  >×</button>
                </div>
              ))}
              <button onClick={addHeader}
                style={{ marginTop: 4, padding: '7px 14px', borderRadius: 8, border: '1px dashed var(--border2)', background: 'transparent', color: 'var(--accent)', fontSize: 12, fontWeight: 700, fontFamily: 'Syne, sans-serif', cursor: 'pointer', width: 'fit-content' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accentbg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >+ Add Header</button>
            </div>
          )}

          {tab === 'body' && (
            <textarea placeholder={'{\n  "key": "value"\n}'} value={body} onChange={e => setBody(e.target.value)} rows={8} className="mono"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, outline: 'none', resize: 'vertical', lineHeight: 1.7 }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accentbg)' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border)';  e.target.style.boxShadow = 'none' }}
            />
          )}
        </div>
      </div>

      <p className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
        Press <kbd style={{ padding: '1px 6px', borderRadius: 5, background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 11 }}>Ctrl+Enter</kbd> to send
      </p>
    </div>
  )
}