import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, Film } from 'lucide-react';
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
        <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-in">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <Film size={24} color="white" />
                    </div>
                    <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800 }}>{t('auth.login_title')}</h1>
                    <p style={{ margin: 0, color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>Accédez à votre espace personnel</p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <FormField id="email" label={t('auth.email')} icon={<Mail size={16} />} error={errors.email}>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(v => ({ ...v, email: '' })); }}
                            placeholder="you@example.com"
                            style={inputStyle(errors.email)}
                        />
                    </FormField>

                    <FormField id="password" label={t('auth.password')} icon={<Lock size={16} />} error={errors.password}>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPwd ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={form.password}
                                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(v => ({ ...v, password: '' })); }}
                                placeholder="••••••••"
                                style={{ ...inputStyle(errors.password), paddingRight: '2.5rem' }}
                            />
                            <button type="button" onClick={() => setShowPwd(v => !v)} style={eyeBtn} aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </FormField>

                    <button type="submit" disabled={loading} style={submitBtn(loading)}>
                        {loading ? t('auth.logging_in') : t('auth.login_btn')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>
                    {t('auth.no_account')}{' '}
                    <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{t('auth.register_link')}</Link>
                </p>
            </div>
        </div>
    );
}

function FormField({ id, label, icon, error, children }) {
    return (
        <div>
            <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                {icon} {label}
            </label>
            {children}
            {error && <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: 'var(--color-accent)' }}>{error}</p>}
        </div>
    );
}

const inputStyle = (err) => ({
    width: '100%', padding: '0.65rem 0.85rem',
    background: 'var(--color-neutral-900)',
    border: `1px solid ${err ? 'var(--color-accent)' : 'var(--color-neutral-700)'}`,
    borderRadius: 'var(--radius-md)', color: 'var(--color-neutral-100)',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
});

const eyeBtn = {
    position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', display: 'flex',
};

const submitBtn = (loading) => ({
    padding: '0.75rem', borderRadius: 'var(--radius-pill)',
    background: loading ? 'var(--color-neutral-700)' : 'var(--color-accent)',
    color: 'white', fontWeight: 700, fontSize: '0.95rem',
    border: 'none', cursor: loading ? 'wait' : 'pointer',
    transition: 'all 0.2s',
});
