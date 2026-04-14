const METHOD_COLORS = {
  GET:'#22c55e', POST:'#60a5fa', PUT:'#f59e0b', PATCH:'#a78bfa', DELETE:'#ef4444',
}

export default function HistoryPanel({ history, onSelect, onClear }) {
  if (!history.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', gap: 8, color: 'var(--muted)' }}>
      <div style={{ fontSize: 28, opacity: 0.25 }}>📋</div>
      <p style={{ fontSize: 12, fontWeight: 600 }}>No requests yet</p>
      <p style={{ fontSize: 11, opacity: 0.7 }}>Your history will appear here</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {history.length} Request{history.length !== 1 ? 's' : ''}
        </span>
        <button onClick={onClear}
          style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: 'var(--red)', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
        >Clear</button>
      </div>

      {history.map((item, i) => (
        <button key={i} onClick={() => onSelect(item)} className="slide-right"
          style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, animationDelay: `${i * 30}ms` }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: METHOD_COLORS[item.method] || 'var(--accent)' }}>{item.method}</span>
            <span className="mono" style={{
              fontSize: 10, padding: '1px 7px', borderRadius: 99,
              color:       item.status >= 400 ? 'var(--red)' : item.status >= 300 ? 'var(--yellow)' : 'var(--green)',
              background:  item.status >= 400 ? 'rgba(239,68,68,0.1)' : item.status >= 300 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
            }}>{item.status || 'ERR'}</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>{item.time}ms</span>
          </div>
          <p className="mono" style={{ fontSize: 11, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</p>
          <p style={{ fontSize: 10, color: 'var(--muted)' }}>{item.timestamp}</p>
        </button>
      ))}
    </div>
  )
}