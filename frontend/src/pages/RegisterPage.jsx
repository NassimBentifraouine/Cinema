import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, Film, CheckCircle, XCircle } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toaster';

const RULES = [
    { key: 'len', label: '8+ caractères', test: v => v.length >= 8 },
    { key: 'upper', label: 'Majuscule', test: v => /[A-Z]/.test(v) },
    { key: 'lower', label: 'Minuscule', test: v => /[a-z]/.test(v) },
    { key: 'digit', label: 'Chiffre', test: v => /[0-9]/.test(v) },
    { key: 'special', label: 'Caractère spécial', test: v => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) },
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
        if (failedRules.length) e.password = failedRules[0].label + ' requis';
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
            toast({ message: 'Compte créé avec succès ! 🎉', type: 'success' });
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || t('errors.server_error');
            toast({ message: msg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '100%', maxWidth: '440px' }} className="animate-fade-in">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <Film size={24} color="white" />
                    </div>
                    <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800 }}>{t('auth.register_title')}</h1>
                    <p style={{ margin: 0, color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>Rejoignez la communauté</p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Email */}
                    <div>
                        <Label icon={<Mail size={14} />}>{t('auth.email')}</Label>
                        <input
                            id="email" type="email" autoComplete="email"
                            value={form.email}
                            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(v => ({ ...v, email: '' })); }}
                            placeholder="you@example.com"
                            style={inputStyle(errors.email)}
                            aria-required="true" aria-invalid={!!errors.email}
                        />
                        {errors.email && <ErrMsg>{errors.email}</ErrMsg>}
                    </div>

                    {/* Password */}
                    <div>
                        <Label icon={<Lock size={14} />}>{t('auth.password')}</Label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPwd ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={form.password}
                                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(v => ({ ...v, password: '' })); }}
                                placeholder="••••••••"
                                onFocus={() => setPwdFocused(true)}
                                onBlur={() => setPwdFocused(false)}
                                style={{ ...inputStyle(errors.password), paddingRight: '2.5rem' }}
                                aria-required="true" aria-invalid={!!errors.password}
                                aria-describedby="pwd-rules"
                            />
                            <button type="button" onClick={() => setShowPwd(v => !v)} style={eyeBtn} aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.password && <ErrMsg>{errors.password}</ErrMsg>}
                        {/* Password strength checklist */}
                        {(pwdFocused || form.password) && (
                            <div id="pwd-rules" style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }} role="list">
                                {RULES.map(r => {
                                    const ok = r.test(form.password);
                                    return (
                                        <div key={r.key} role="listitem" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: ok ? '#22c55e' : 'var(--color-neutral-400)' }}>
                                            {ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {r.label}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div>
                        <Label icon={<Lock size={14} />}>{t('auth.confirm_password')}</Label>
                        <input
                            id="confirm-password" type="password" autoComplete="new-password"
                            value={form.confirmPassword}
                            onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setErrors(v => ({ ...v, confirmPassword: '' })); }}
                            placeholder="••••••••"
                            style={inputStyle(errors.confirmPassword)}
                            aria-required="true" aria-invalid={!!errors.confirmPassword}
                        />
                        {errors.confirmPassword && <ErrMsg>{errors.confirmPassword}</ErrMsg>}
                    </div>

                    <button type="submit" disabled={loading} style={submitBtn(loading)}>
                        {loading ? t('auth.registering') : t('auth.register_btn')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>
                    {t('auth.has_account')}{' '}
                    <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{t('auth.login_link')}</Link>
                </p>
            </div>
        </div>
    );
}

function Label({ icon, children }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            {icon} {children}
        </label>
    );
}
function ErrMsg({ children }) {
    return <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: 'var(--color-accent)' }}>{children}</p>;
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
    border: 'none', cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s',
});
