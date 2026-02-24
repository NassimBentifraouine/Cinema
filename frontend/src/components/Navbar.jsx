import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useFiltersStore } from '../store/filters.store';

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // For local search state that syncs with global store
    const { search, setSearch } = useFiltersStore();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };



    return (
        <nav
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                background: scrolled ? 'var(--color-bg-dark)' : 'transparent',
                transition: 'background-color 0.3s ease',
                padding: '0 4%',
                height: '72px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none'
            }}
        >
            {/* Left side: Logo & Primary Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', outline: 'none' }}>
                    {/* Red Square Icon similar to mockup */}
                    <div style={{
                        width: '24px', height: '24px',
                        backgroundColor: 'var(--color-accent)',
                        borderRadius: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {/* Could put a small white icon inside, but mockup is just a simple shape */}
                        <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '2px', marginLeft: '4px', marginTop: '-4px' }} />
                    </div>
                    <span style={{
                        fontFamily: 'var(--font-family-sans)', fontWeight: 800,
                        fontSize: '1.4rem', letterSpacing: '-0.03em', color: 'var(--color-white)',
                    }}>
                        CineView
                    </span>
                </Link>

                {/* Desktop nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to="/" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-white)' }}>
                        {t('nav.catalog')}
                    </Link>
                    {isAuthenticated && (
                        <Link to="/dashboard" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-neutral-400)' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-neutral-400)'}>
                            {t('nav.dashboard')}
                        </Link>
                    )}
                    {isAdmin() && (
                        <Link to="/admin" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-accent)' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-accent)'}>
                            {t('nav.admin')}
                        </Link>
                    )}
                </div>
            </div>

            {/* Right side: Search, Notifications, Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>



                {/* Language Toggles */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '0.5rem' }}>
                    <button
                        onClick={() => i18n.changeLanguage('fr')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: i18n.language === 'fr' ? 1 : 0.5, transition: 'opacity 0.2s', padding: 0 }}
                        title="Français"
                    >🇫🇷</button>
                    <button
                        onClick={() => i18n.changeLanguage('en')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: i18n.language === 'en' ? 1 : 0.5, transition: 'opacity 0.2s', padding: 0 }}
                        title="English"
                    >🇬🇧</button>
                </div>

                {isAuthenticated ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        {/* Profil Menu */}

                        {/* Profile Menu */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                style={{
                                    background: 'transparent', border: 'none', padding: 0,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center'
                                }}
                            >
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e50914") center/cover',
                                    border: '2px solid transparent',
                                    transition: 'border-color 0.2s'
                                }} onMouseEnter={e => e.currentTarget.style.borderColor = 'white'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'} />
                            </button>

                            {userMenuOpen && (
                                <div
                                    style={{
                                        position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                                        minWidth: '220px', zIndex: 100,
                                        backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-neutral-800)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '0.5rem 0',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <div style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--color-neutral-400)', borderBottom: '1px solid var(--color-neutral-800)', marginBottom: '0.5rem' }}>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('nav.dashboard')}</div>
                                        <strong style={{ color: 'white' }}>{user?.email}</strong>
                                    </div>
                                    <NavMenuItem icon={<User size={16} />} label={t('nav.dashboard')} to="/dashboard" onClick={() => setUserMenuOpen(false)} />
                                    {isAdmin() && (
                                        <NavMenuItem icon={<Settings size={16} />} label={t('nav.admin')} to="/admin" onClick={() => setUserMenuOpen(false)} />
                                    )}
                                    <hr style={{ border: 'none', borderTop: '1px solid var(--color-neutral-800)', margin: '0.5rem 0' }} />
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                                            width: '100%', padding: '0.6rem 1rem',
                                            border: 'none', background: 'transparent', color: 'var(--color-neutral-200)',
                                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                                            textAlign: 'left'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-neutral-200)' }}
                                    >
                                        <LogOut size={16} />
                                        {t('nav.logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/login" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-white)' }}>
                            {t('nav.login')}
                        </Link>
                        <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-pill)' }}>
                            {t('nav.register')}
                        </Link>
                    </div>
                )}
            </div>

            {/* Click outside overlay */}
            {userMenuOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setUserMenuOpen(false)} />
            )}
        </nav>
    );
}

function NavMenuItem({ icon, label, to, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.5rem 1rem', color: 'var(--color-neutral-200)',
                fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-neutral-200)' }}
        >
            {icon}
            {label}
        </Link>
    );
}
