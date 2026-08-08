import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const MODES = {
  focus: { label: 'Focus', minutes: 25, color: 'var(--espresso)' },
  short: { label: 'Short Break', minutes: 5, color: 'var(--brass)' },
  long: { label: 'Long Break', minutes: 15, color: 'var(--ok)' },
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function App() {
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])
  const intervalRef = useRef(null)

  const totalSeconds = MODES[mode].minutes * 60
  const progress = 1 - secondsLeft / totalSeconds

  const switchMode = useCallback((nextMode, logCompleted) => {
    setRunning(false)
    if (logCompleted) {
      setLog((prev) => [
        { mode, minutes: MODES[mode].minutes, at: new Date() },
        ...prev,
      ].slice(0, 8))
    }
    setMode(nextMode)
    setSecondsLeft(MODES[nextMode].minutes * 60)
  }, [mode])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          const next = mode === 'focus' ? 'short' : 'focus'
          switchMode(next, true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, mode, switchMode])

  const toggle = () => setRunning((r) => !r)
  const reset = () => {
    setRunning(false)
    setSecondsLeft(MODES[mode].minutes * 60)
  }

  const circumference = 2 * Math.PI * 90

  return (
    <div className="page">
      <header className="header">
        <span className="eyebrow">Study Session</span>
        <h1>FocusFlow</h1>
        <p className="subtitle">A quiet timer for deep work, kept like a ledger.</p>
      </header>

      <div className="mode-row">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            className={`mode-pill ${mode === key ? 'active' : ''}`}
            onClick={() => switchMode(key, false)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="dial-wrap">
        <svg width="220" height="220" viewBox="0 0 220 220" className="dial">
          <circle cx="110" cy="110" r="90" className="dial-track" />
          <circle
            cx="110" cy="110" r="90"
            className="dial-progress"
            style={{
              stroke: MODES[mode].color,
              strokeDasharray: circumference,
              strokeDashoffset: circumference * (1 - progress),
            }}
          />
        </svg>
        <div className="dial-center">
          <span className="time">{formatTime(secondsLeft)}</span>
          <span className="mode-label">{MODES[mode].label}</span>
        </div>
      </div>

      <div className="controls">
        <button className="btn primary" onClick={toggle}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <section className="ledger">
        <h2>Session Ledger</h2>
        {log.length === 0 ? (
          <p className="ledger-empty">Completed sessions will be recorded here.</p>
        ) : (
          <ul className="ledger-list">
            {log.map((entry, i) => (
              <li key={i} className="ledger-row">
                <span className="ledger-dot" style={{ background: MODES[entry.mode].color }} />
                <span className="ledger-type">{MODES[entry.mode].label}</span>
                <span className="ledger-minutes">{entry.minutes} min</span>
                <span className="ledger-time">
                  {entry.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="footer">Built with React · by Haseeba</footer>
    </div>
  )
}