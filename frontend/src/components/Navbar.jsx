import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Film, Menu, X, Globe, User, LogOut, Settings, Heart } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const toggleLang = () => {
        const next = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(next);
        localStorage.setItem('cinecat_lang', next);
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    return (
        <nav className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Film size={18} color="white" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                            Ciné<span style={{ color: 'var(--color-accent)' }}>Catalog</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Language toggle */}
                        <button
                            onClick={toggleLang}
                            aria-label="Toggle language"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-pill)',
                                border: '1px solid var(--color-neutral-700)',
                                background: 'transparent', color: 'var(--color-neutral-200)',
                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-neutral-700)'}
                        >
                            <Globe size={14} />
                            {i18n.language.toUpperCase()}
                        </button>

                        {isAuthenticated ? (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    aria-label="User menu"
                                    aria-expanded={userMenuOpen}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-pill)',
                                        border: '1px solid var(--color-neutral-700)',
                                        background: 'var(--color-neutral-900)', color: 'var(--color-neutral-100)',
                                        cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <User size={16} />
                                    {user?.email?.split('@')[0]}
                                </button>
                                {userMenuOpen && (
                                    <div
                                        style={{
                                            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                            background: 'var(--color-bg-elevated)',
                                            border: '1px solid var(--color-neutral-700)',
                                            borderRadius: 'var(--radius-lg)', padding: '0.5rem',
                                            minWidth: '180px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                            zIndex: 100,
                                        }}
                                        className="animate-scale-in"
                                    >
                                        <NavMenuItem icon={<Heart size={15} />} label={t('nav.favorites')} to="/dashboard" onClick={() => setUserMenuOpen(false)} />
                                        {isAdmin() && (
                                            <NavMenuItem icon={<Settings size={15} />} label={t('nav.admin')} to="/admin" onClick={() => setUserMenuOpen(false)} />
                                        )}
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-neutral-700)', margin: '0.25rem 0' }} />
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                width: '100%', padding: '0.5rem 0.75rem',
                                                borderRadius: 'var(--radius-sm)', border: 'none',
                                                background: 'transparent', color: 'var(--color-accent)',
                                                cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-accent-muted)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <LogOut size={15} />
                                            {t('nav.logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <NavLink to="/login">{t('nav.login')}</NavLink>
                                <NavLink to="/register" accent>{t('nav.register')}</NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Close dropdown on outside click */}
            {userMenuOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setUserMenuOpen(false)} />
            )}
        </nav>
    );
}

function NavLink({ to, children, accent }) {
    return (
        <Link
            to={to}
            style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                background: accent ? 'var(--color-accent)' : 'transparent',
                color: accent ? 'white' : 'var(--color-neutral-200)',
                border: accent ? 'none' : '1px solid var(--color-neutral-700)',
            }}
        >
            {children}
        </Link>
    );
}

function NavMenuItem({ icon, label, to, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                color: 'var(--color-neutral-200)', fontSize: '0.875rem',
                transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-neutral-900)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            {icon}
            {label}
        </Link>
    );
}
