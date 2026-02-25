import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toaster';


import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
            toast({ message: t('auth.toast_welcome', { name: res.data.user.email.split('@')[0] }), type: 'success' });
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
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 1rem 2rem',
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

            <GlassPanel style={{ width: '100%', maxWidth: '440px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-family-heading)', letterSpacing: '-0.02em', color: 'white' }}>{t('auth.login_title')}</h1>
                    <p style={{ margin: 0, color: 'var(--color-neutral-400)', fontSize: '0.95rem' }}>{t('auth.login_subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column' }}>
                    <Input
                        id="email"
                        label={t('auth.email')}
                        icon={Mail}
                        error={errors.email}
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(v => ({ ...v, email: '' })); }}
                        placeholder="you@example.com"
                    />

                    <Input
                        id="password"
                        label={t('auth.password')}
                        icon={Lock}
                        error={errors.password}
                    >
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPwd ? 'text' : 'password'}
                                autoComplete="current-password"
                                className="premium-input"
                                value={form.password}
                                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(v => ({ ...v, password: '' })); }}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1rem',
                                    paddingRight: '2.75rem',
                                    fontSize: '1rem',
                                    backgroundColor: 'var(--color-bg-dark)',
                                    border: `1px solid ${errors.password ? '#ff4d4d' : 'rgba(255,255,255,0.1)'}`,
                                    color: 'white',
                                    borderRadius: 'var(--radius-sm)',
                                    outline: 'none'
                                }}
                            />
                            <button type="button" onClick={() => setShowPwd(v => !v)} style={eyeBtn} aria-label={showPwd ? 'Hide' : 'Show'}>
                                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </Input>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
                        <Link to="#" style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)', textDecoration: 'underline' }}>{t('auth.forgot_password')}</Link>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', marginBottom: '1.5rem' }}
                    >
                        {loading ? t('auth.logging_in') : t('auth.login_btn')}
                    </Button>
                </form>

                <p style={{ textAlign: 'center', margin: 0, fontSize: '0.9rem', color: 'var(--color-neutral-400)' }}>
                    {t('auth.no_account')}{' '}
                    <Link to="/register" style={{ color: 'white', fontWeight: 700 }}>
                        {t('auth.register_link')}
                    </Link>
                </p>
            </GlassPanel>
        </div>
    );
}

const eyeBtn = {
    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', display: 'flex'
};
