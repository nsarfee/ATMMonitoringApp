'use client';
import { useState, useTransition } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await loginAction(username, password);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #fdf6f0 0%, #f5f5f7 50%, #fdf0ea 100%)' }}
    >
      {/* subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#e5e5ea 1px, transparent 1px), linear-gradient(90deg, #e5e5ea 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.35,
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        {/* Card */}
        <div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(242,101,34,0.10), 0 4px 16px rgba(0,0,0,0.08)' }}
        >
          {/* Header band */}
          <div
            className="px-8 pt-8 pb-6 text-center"
            style={{ background: 'linear-gradient(135deg, #f26522 0%, #e05510 100%)' }}
          >
            {/* BOP Logo mark */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg"
                style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(4px)', border: '2px solid rgba(255,255,255,0.30)' }}
              >
                BOP
              </div>
            </div>
            <h1 className="text-white font-black text-xl tracking-tight leading-tight">ATM Operations Control</h1>
            <p className="text-orange-100 text-[12px] font-semibold tracking-widest mt-1">THE BANK OF PUNJAB</p>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="admin"
                  autoComplete="username"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ '--tw-ring-color': '#f26522' } as React.CSSProperties}
                  onFocus={e => e.currentTarget.style.borderColor = '#f26522'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  onFocus={e => e.currentTarget.style.borderColor = '#f26522'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm select-none"
                  tabIndex={-1}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold"
                style={{ background: '#fff1f0', border: '1px solid #fecaca', color: '#dc2626' }}
              >
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: isPending ? '#f99a72' : 'linear-gradient(135deg, #f26522 0%, #e05510 100%)',
                boxShadow: isPending ? 'none' : '0 4px 16px rgba(242,101,34,0.35)',
              }}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Footer hint */}
          <div
            className="px-8 py-4 text-center border-t border-gray-100"
            style={{ background: '#fafafa' }}
          >
            <p className="text-[11px] text-gray-400">
              Authorised personnel only &nbsp;·&nbsp; BOP NOC
            </p>
          </div>
        </div>

        {/* Version tag */}
        <p className="text-center text-[10px] text-gray-400 mt-4 tracking-wider">
          ATM Control v2.0 &nbsp;·&nbsp; Secure Access
        </p>
      </div>
    </div>
  );
}
