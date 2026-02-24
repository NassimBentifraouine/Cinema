import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toaster';

// UI Components
import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
        if (failedRules.length) e.password = t(`auth.rules.${failedRules[0].key}`) + ' required';
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
            toast({ message: t('auth.toast_register_success'), type: 'success' });
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

            <GlassPanel style={{ width: '100%', maxWidth: '460px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-family-heading)', letterSpacing: '-0.02em', color: 'white' }}>{t('auth.register_title')}</h1>
                    <p style={{ margin: 0, color: 'var(--color-neutral-400)', fontSize: '0.95rem' }}>{t('auth.register_subtitle')}</p>
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

                    <div>
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
                                    autoComplete="new-password"
                                    className="premium-input"
                                    value={form.password}
                                    onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(v => ({ ...v, password: '' })); }}
                                    placeholder="••••••••"
                                    onFocus={() => setPwdFocused(true)}
                                    onBlur={() => setPwdFocused(false)}
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

                        {/* Rules checklist */}
                        {(pwdFocused || form.password) && (
                            <div style={{
                                marginTop: '-0.5rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr',
                                gap: '0.4rem 1rem', padding: '0.75rem',
                                backgroundColor: 'var(--color-bg-dark)', borderRadius: '4px',
                                border: '1px solid var(--color-neutral-800)'
                            }}>
                                {RULES.map(r => {
                                    const ok = r.test(form.password);
                                    return (
                                        <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: ok ? '#22c55e' : 'var(--color-neutral-400)' }}>
                                            {ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {t(`auth.rules.${r.key}`)}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <Input
                        id="confirm-password"
                        label={t('auth.confirm_password')}
                        icon={Lock}
                        error={errors.confirmPassword}
                        type="password"
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setErrors(v => ({ ...v, confirmPassword: '' })); }}
                        placeholder="••••••••"
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', marginBottom: '1.5rem', marginTop: '0.5rem' }}
                    >
                        {loading ? t('auth.registering') : t('auth.register_btn')}
                    </Button>
                </form>

                <p style={{ textAlign: 'center', margin: 0, fontSize: '0.9rem', color: 'var(--color-neutral-400)' }}>
                    {t('auth.has_account')}{' '}
                    <Link to="/login" style={{ color: 'white', fontWeight: 700 }}>
                        {t('auth.login_link')}
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
