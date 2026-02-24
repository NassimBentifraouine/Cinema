import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toaster';

const RULES = [
    { key: 'len', label: '8+ chars', test: v => v.length >= 8 },
    { key: 'upper', label: 'Uppercase', test: v => /[A-Z]/.test(v) },
    { key: 'lower', label: 'Lowercase', test: v => /[a-z]/.test(v) },
    { key: 'digit', label: 'Number', test: v => /[0-9]/.test(v) },
    { key: 'special', label: 'Special char', test: v => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) },
];

export default function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const { toast } = useToast();

    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [pwdFocused, setPwdFocused] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.email) e.email = t('errors.required');
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('errors.invalid_email');
        const failedRules = RULES.filter(r => !r.test(form.password));
        if (failedRules.length) e.password = failedRules[0].label + ' required';
        if (form.password !== form.confirmPassword) e.confirmPassword = t('errors.passwords_match');
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            const res = await authApi.register(form);
            setAuth(res.data);
            toast({ message: 'Account created! 🎉', type: 'success' });
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error creating account';
            toast({ message: msg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem',
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Cinematic Theater Background */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: -1,
                backgroundImage: 'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop")',
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'brightness(0.3) contrast(1.2)'
            }} />

            {/* Dark overlay gradient */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: -1,
                background: 'linear-gradient(to top, var(--color-bg-dark) 0%, transparent 100%)',
            }} />

            <div style={{
                width: '100%', maxWidth: '460px',
                backgroundColor: '#1b1212', // Slightly lighter than bg-dark for the card
                padding: '3rem 2.5rem',
                borderRadius: '8px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-family-heading)', letterSpacing: '-0.02em', color: 'white' }}>Join CineView</h1>
                    <p style={{ margin: 0, color: 'var(--color-neutral-400)', fontSize: '0.95rem' }}>Create an account to start tracking</p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <Label icon={<Mail size={16} />}>Email Address</Label>
                        <input
                            id="email" type="email" autoComplete="email"
                            className="premium-input"
                            value={form.email}
                            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(v => ({ ...v, email: '' })); }}
                            placeholder="you@example.com"
                            style={inputStyle(errors.email)}
                        />
                        {errors.email && <ErrMsg>{errors.email}</ErrMsg>}
                    </div>

                    <div>
                        <Label icon={<Lock size={16} />}>Password</Label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPwd ? 'text' : 'password'}
                                autoComplete="new-password"
                                className="premium-input"
                                value={form.password}
                                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(v => ({ ...v, password: '' })); }}
                                placeholder="••••••••"
                                onFocus={() => setPwdFocused(true)}
                                onBlur={() => setPwdFocused(false)}
                                style={{ ...inputStyle(errors.password), paddingRight: '2.75rem' }}
                            />
                            <button type="button" onClick={() => setShowPwd(v => !v)} style={eyeBtn} aria-label={showPwd ? 'Hide' : 'Show'}>
                                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <ErrMsg>{errors.password}</ErrMsg>}

                        {/* Rules checklist */}
                        {(pwdFocused || form.password) && (
                            <div style={{
                                marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr',
                                gap: '0.4rem 1rem', padding: '0.75rem',
                                backgroundColor: 'var(--color-bg-dark)', borderRadius: '4px',
                                border: '1px solid var(--color-neutral-800)'
                            }}>
                                {RULES.map(r => {
                                    const ok = r.test(form.password);
                                    return (
                                        <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: ok ? '#22c55e' : 'var(--color-neutral-400)' }}>
                                            {ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {r.label}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label icon={<Lock size={16} />}>Confirm Password</Label>
                        <input
                            id="confirm-password" type="password" autoComplete="new-password"
                            className="premium-input"
                            value={form.confirmPassword}
                            onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setErrors(v => ({ ...v, confirmPassword: '' })); }}
                            placeholder="••••••••"
                            style={inputStyle(errors.confirmPassword)}
                        />
                        {errors.confirmPassword && <ErrMsg>{errors.confirmPassword}</ErrMsg>}
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', marginTop: '1rem', borderRadius: '4px' }}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-neutral-400)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'white', fontWeight: 700 }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

function Label({ icon, children }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-neutral-200)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            {icon} {children}
        </label>
    );
}

function ErrMsg({ children }) {
    return <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#ff4d4d', fontWeight: 500 }}>{children}</p>;
}

const inputStyle = (err) => ({
    width: '100%', padding: '0.75rem 1rem', fontSize: '1rem',
    backgroundColor: 'var(--color-bg-dark)',
    border: `1px solid ${err ? '#ff4d4d' : 'var(--color-neutral-800)'}`,
    color: 'white',
    borderRadius: '4px',
    outline: 'none'
});

const eyeBtn = {
    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', display: 'flex'
};
