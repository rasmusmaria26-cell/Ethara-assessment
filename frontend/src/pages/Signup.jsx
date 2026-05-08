import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/signup', { name, email, password });
      login(res.data.user);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setShake(true);
      setTimeout(() => setShake(false), 450);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        :root {
          --ink:          #0D0D0D;
          --ink-mid:      #1A1A1A;
          --ink-soft:     #2A2A2A;
          --gold:         #C8975A;
          --gold-dark:    #A67A40;
          --text-primary: #E8DDD0;
          --text-muted:   rgba(232,221,208,0.5);
          --text-faint:   rgba(232,221,208,0.18);
          --error:        #C0604A;
        }

        .ethara-root {
          display: flex;
          flex-direction: row;
          min-height: 100vh;
          width: 100%;
          background: #0D0D0D;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* --- Left Panel --- */
        .left-panel {
          width: 38%;
          min-height: 100vh;
          background: #C8975A;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 36px;
          opacity: 0;
        }

        .left-panel::before {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 63px,
            rgba(0,0,0,0.022) 63px,
            rgba(0,0,0,0.022) 64px
          );
          pointer-events: none;
          z-index: 0;
        }

        .left-panel::after {
          content: '';
          position: absolute;
          bottom: -110px; right: -110px;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: rgba(0,0,0,0.035);
          pointer-events: none;
          z-index: 0;
        }

        .left-panel > * {
          position: relative;
          z-index: 1;
        }

        .left-top {
          display: flex;
          align-items: center;
          width: fit-content;
        }

        .left-dash {
          width: 24px;
          height: 1px;
          background: rgba(0,0,0,0.35);
          display: block;
        }

        .left-wordmark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(-50%) rotate(180deg);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 18px;
          letter-spacing: 0.6em;
          color: #0D0D0D;
          opacity: 0.72;
          user-select: none;
          z-index: 1;
          white-space: nowrap;
        }

        .left-bottom {
          display: flex;
          flex-direction: column;
        }

        .left-tag {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.38);
          margin-bottom: 10px;
        }

        .left-desc {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 13px;
          color: rgba(0,0,0,0.48);
          line-height: 1.65;
          max-width: 150px;
          margin-bottom: 28px;
        }

        .left-copy {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: rgba(0,0,0,0.26);
          letter-spacing: 0.06em;
        }

        /* --- Right Panel --- */
        .right-panel {
          width: 62%;
          min-height: 100vh;
          background: #0D0D0D;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 0 48px;
        }

        .form-wrap {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
        }

        .form-header { margin-bottom: 52px; }

        .form-dash {
          width: 32px;
          height: 1px;
          background: #C8975A;
          display: block;
          margin-bottom: 26px;
          opacity: 0;
        }

        .form-heading {
          all: unset;
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 54px;
          line-height: 1.05;
          color: #E8DDD0;
          margin: 0 0 16px 0;
          opacity: 0;
        }

        .form-sub {
          all: unset;
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 15px;
          color: rgba(232,221,208,0.5);
          letter-spacing: 0.01em;
          line-height: 1.5;
          opacity: 0;
        }

        .ethera-form {
          display: flex;
          flex-direction: column;
        }

        .ethera-form.shake {
          animation: shake 0.42s ease both;
        }

        .field {
          display: flex;
          flex-direction: column;
          margin-bottom: 26px;
          opacity: 0;
        }

        .field-label {
          all: unset;
          display: block;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #C8975A;
          margin-bottom: 10px;
        }

        .field-input {
          all: unset;
          display: block;
          width: 100%;
          height: 48px;
          padding: 0 16px;
          background: #1A1A1A !important;
          border: 1px solid #2A2A2A;
          border-radius: 3px;
          color: #E8DDD0 !important;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .field-input::placeholder { color: rgba(232,221,208,0.18); }

        .field-input:focus {
          border-color: #C8975A;
          box-shadow: 0 0 0 3px rgba(200,151,90,0.09);
          outline: none;
        }

        .field-input.error {
          border-color: #C0604A;
          box-shadow: 0 0 0 3px rgba(192,96,74,0.09);
        }

        .field-input:-webkit-autofill,
        .field-input:-webkit-autofill:hover,
        .field-input:-webkit-autofill:focus,
        .field-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #1A1A1A inset !important;
          -webkit-text-fill-color: #E8DDD0 !important;
          caret-color: #E8DDD0;
          border-color: #2A2A2A;
          transition: background-color 5000s ease-in-out 0s;
        }

        .pw-wrap { position: relative; }
        .pw-wrap .field-input { padding-right: 56px; }

        .pw-toggle {
          all: unset;
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(232,221,208,0.35);
          cursor: pointer;
          transition: color 0.15s;
        }

        .pw-toggle:hover { color: #C8975A; }

        .form-error {
          all: unset;
          display: block;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #C0604A;
          letter-spacing: 0.06em;
          margin-bottom: 16px;
          margin-top: -10px;
          min-height: 18px;
        }

        .submit-btn {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          height: 52px;
          margin-top: 8px;
          background: #C8975A;
          border-radius: 3px;
          color: #0D0D0D;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          box-sizing: border-box;
          transition: background 0.2s ease, transform 0.15s ease;
          opacity: 0;
        }

        .submit-btn:hover:not(:disabled) { background: #A67A40; }
        .submit-btn:hover:not(:disabled) .btn-arrow { transform: translateX(5px); }
        .submit-btn:active:not(:disabled) { transform: scale(0.982); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-arrow { display: inline-block; transition: transform 0.2s ease; }

        .form-footer {
          all: unset;
          display: block;
          margin-top: 40px;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: rgba(232,221,208,0.45);
          opacity: 0;
        }

        .form-footer a { color: #C8975A; text-decoration: none; cursor: pointer; }
        .form-footer a:hover { text-decoration: underline; }

        .dot {
          display: inline-block;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #0D0D0D;
          animation: pulseDot 1.2s ease-in-out infinite both;
        }
        .dot:nth-child(2) { animation-delay: 180ms; }
        .dot:nth-child(3) { animation-delay: 360ms; }

        /* Animations */
        .ethara-root.mounted .left-panel { animation: fadeIn 0.8s ease both; animation-delay: 0ms; }
        .ethara-root.mounted .form-dash { animation: fadeUp 0.5s ease both; animation-delay: 130ms; }
        .ethara-root.mounted .form-heading { animation: fadeUp 0.65s ease both; animation-delay: 210ms; }
        .ethara-root.mounted .form-sub { animation: fadeUp 0.55s ease both; animation-delay: 300ms; }
        .ethara-root.mounted .field:nth-child(1) { animation: fadeUp 0.5s ease both; animation-delay: 380ms; }
        .ethara-root.mounted .field:nth-child(2) { animation: fadeUp 0.5s ease both; animation-delay: 460ms; }
        .ethara-root.mounted .field:nth-child(3) { animation: fadeUp 0.5s ease both; animation-delay: 540ms; }
        .ethara-root.mounted .submit-btn { animation: fadeUp 0.5s ease both; animation-delay: 620ms; }
        .ethara-root.mounted .form-footer { animation: fadeIn 0.4s ease both; animation-delay: 720ms; }

        @media (max-width: 1023px) and (min-width: 768px) {
          .ethara-root { flex-direction: column; overflow-y: auto; height: auto; }
          .left-panel {
            width: 100%; min-height: unset; height: 72px;
            flex-direction: row; align-items: center; justify-content: center;
            padding: 0;
          }
          .left-panel::before, .left-panel::after, .left-top, .left-bottom { display: none; }
          .left-wordmark {
            position: static; transform: none; writing-mode: horizontal-tb;
            font-style: italic; font-size: 22px; letter-spacing: 0.32em; opacity: 0.82;
          }
          .right-panel { width: 100%; min-height: calc(100vh - 72px); padding: 52px 24px; }
        }

        @media (max-width: 767px) {
          .ethara-root { flex-direction: column; overflow-y: auto; height: auto; }
          .left-panel {
            width: 100%; min-height: unset; height: 60px;
            flex-direction: row; align-items: center; justify-content: center;
            padding: 0;
          }
          .left-panel::before, .left-panel::after, .left-top, .left-bottom { display: none; }
          .left-wordmark {
            position: static; transform: none; writing-mode: horizontal-tb;
            font-style: italic; font-size: 20px; letter-spacing: 0.28em; opacity: 0.82;
          }
          .right-panel {
            width: 100%; min-height: calc(100vh - 60px);
            padding: 40px 24px 64px; align-items: flex-start; justify-content: center;
          }
          .form-wrap { max-width: 100%; width: 100%; }
          .form-heading { font-size: 38px; }
          .form-sub { font-size: 14px; }
          .field-input { height: 48px; }
          .submit-btn { height: 52px; }
        }
      `}</style>

      <div className={`ethara-root${mounted ? ' mounted' : ''}`}>
        <div className="left-panel">
          <div className="left-top">
            <span className="left-dash" />
          </div>
          <div className="left-wordmark">ETHARA</div>
          <div className="left-bottom">
            <span className="left-tag">// begin your work</span>
            <span className="left-desc">Join your team on Ethara.</span>
            <span className="left-copy">© Ethara 2025</span>
          </div>
        </div>

        <div className="right-panel">
          <div className="form-wrap">
            <div className="form-header">
              <span className="form-dash" />
              <h1 className="form-heading">Create your account.</h1>
              <p className="form-sub">Get started — it only takes a moment.</p>
            </div>

            <form className={`ethera-form${shake ? ' shake' : ''}`} onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label">Full Name</label>
                <input
                  className={`field-input${error ? ' error' : ''}`}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Elias Thorne"
                  required
                />
              </div>

              <div className="field">
                <label className="field-label">Email</label>
                <input
                  className={`field-input${error ? ' error' : ''}`}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="field">
                <label className="field-label">Password</label>
                <div className="pw-wrap">
                  <input
                    className={`field-input${error ? ' error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPassword(p => !p)}
                  >
                    {showPassword ? 'hide' : 'show'}
                  </button>
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <p className="form-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
