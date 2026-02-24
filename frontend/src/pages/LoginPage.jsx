import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toaster';

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const { toast } = useToast();

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.email) e.email = t('errors.required');
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('errors.invalid_email');
        if (!form.password) e.password = t('errors.required');
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            const res = await authApi.login(form);
            setAuth(res.data);
            toast({ message: `Bienvenue, ${res.data.user.email.split('@')[0]} !`, type: 'success' });
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || t('errors.login_failed');
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
                width: '100%', maxWidth: '440px',
                backgroundColor: '#1b1212', // Slightly lighter than bg-dark for the card
                padding: '3rem 2.5rem',
                borderRadius: '8px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-family-heading)', letterSpacing: '-0.02em', color: 'white' }}>Welcome Back</h1>
                    <p style={{ margin: 0, color: 'var(--color-neutral-400)', fontSize: '0.95rem' }}>Sign in to continue to CineView</p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <FormField id="email" label="Email Address" icon={<Mail size={16} />} error={errors.email}>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className="premium-input"
                            value={form.email}
                            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(v => ({ ...v, email: '' })); }}
                            placeholder="you@example.com"
                            style={inputStyle(errors.email)}
                        />
                    </FormField>

                    <FormField id="password" label="Password" icon={<Lock size={16} />} error={errors.password}>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPwd ? 'text' : 'password'}
                                autoComplete="current-password"
                                className="premium-input"
                                value={form.password}
                                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(v => ({ ...v, password: '' })); }}
                                placeholder="••••••••"
                                style={{ ...inputStyle(errors.password), paddingRight: '2.75rem' }}
                            />
                            <button type="button" onClick={() => setShowPwd(v => !v)} style={eyeBtn} aria-label={showPwd ? 'Hide' : 'Show'}>
                                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </FormField>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
                        <Link to="#" style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)', textDecoration: 'underline' }}>Forgot password?</Link>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', marginTop: '1rem', borderRadius: '4px' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-neutral-400)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'white', fontWeight: 700 }}>
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

function FormField({ id, label, icon, error, children }) {
    return (
        <div>
            <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-neutral-200)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                {icon} {label}
            </label>
            {children}
            {error && <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#ff4d4d', fontWeight: 500 }}>{error}</p>}
        </div>
    );
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
