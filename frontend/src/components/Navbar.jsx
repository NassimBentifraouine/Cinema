import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useNavigate, Link, useLocation } from 'react-router-dom';


import Logo from './ui/Logo';
import NavLink from './ui/NavLink';
import LangButton from './ui/LangButton';
import Button from './ui/Button';
import GlassPanel from './ui/GlassPanel';

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

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

    const navStyle = {
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '92%',
        maxWidth: '1400px',
        zIndex: 100,
        background: scrolled ? 'linear-gradient(180deg, rgba(15,15,15,0.7) 0%, rgba(5,5,5,0.85) 100%)' : 'linear-gradient(180deg, rgba(15,15,15,0.2) 0%, rgba(5,5,5,0.5) 100%)',
        backdropFilter: 'blur(24px) saturate(200%)',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        padding: '0 1.5rem',
        height: scrolled ? '60px' : '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: scrolled ? '16px' : '28px',
        borderRadius: '100px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: scrolled ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 30px 60px rgba(0,0,0,0.6)' : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.3)'
    };

    return (
        <nav style={navStyle}>
            {/* Left side: Logo & Primary Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                <Logo height={scrolled ? '28px' : '36px'} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <NavLink to="/" active={location.pathname === '/'}>{t('nav.catalog')}</NavLink>
                    {isAdmin() && (
                        <NavLink to="/admin" color="var(--color-accent)" active={location.pathname.startsWith('/admin')}>{t('nav.admin')}</NavLink>
                    )}
                </div>
            </div>

            {/* Right side: Language, Login/Profile Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                {/* Language Toggles */}
                <div style={{
                    display: 'flex', gap: '0.2rem', alignItems: 'center',
                    background: 'rgba(0,0,0,0.4)', padding: '0.3rem',
                    borderRadius: 'var(--radius-pill)', border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)'
                }}>
                    <LangButton lang="fr" current={i18n.language} onClick={() => i18n.changeLanguage('fr')} title="Français" />
                    <LangButton lang="en" current={i18n.language} onClick={() => i18n.changeLanguage('en')} title="English" />
                </div>

                {isAuthenticated ? (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.4rem 0.4rem 0.4rem 1.25rem',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '100px',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 15px rgba(0,0,0,0.3)',
                                outline: 'none'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>{t('nav.dashboard')}</span>
                            <UserAvatar />
                        </button>

                        {userMenuOpen && (
                            <UserMenu
                                user={user}
                                isAdmin={isAdmin()}
                                onLogout={handleLogout}
                                t={t}
                                onClose={() => setUserMenuOpen(false)}
                            />
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <NavLink to="/login" active={location.pathname === '/login'}>{t('nav.login')}</NavLink>
                        <Button to="/register" pill size="sm">
                            {t('nav.register')}
                        </Button>
                    </div>
                )}
            </div>

            {/* Click outside overlay */}
            {userMenuOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setUserMenuOpen(false)} />
            )}

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </nav>
    );
}

// Internal Sub-components for cleaner structure
function UserAvatar() {
    return (
        <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e50914") center/cover',
        }} />
    );
}

function UserMenu({ user, isAdmin, onLogout, t, onClose }) {
    const itemStyle = {
        width: '100%',
        padding: '0.8rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: 'none',
        background: 'transparent',
        color: 'var(--color-neutral-200)',
        fontSize: '0.9rem',
        fontWeight: 700,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        boxSizing: 'border-box'
    };

    const handleHover = (e, isEnter) => {
        e.currentTarget.style.background = isEnter ? 'rgba(255, 255, 255, 0.05)' : 'transparent';
        e.currentTarget.style.color = isEnter ? 'white' : 'var(--color-neutral-200)';
    };

    return (
        <GlassPanel padding="1rem 0" borderRadius="1.25rem" style={{
            position: 'absolute', right: '10px', top: 'calc(100% + 15px)',
            minWidth: '260px', zIndex: 100,
            boxShadow: '0 30px 70px rgba(0,0,0,0.7)',
            overflow: 'hidden',
            animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid rgba(255,255,255,0.12)'
        }}>
            {/* Header: User Email */}
            <div style={{
                padding: '0.5rem 1.25rem 1rem',
                fontSize: '0.85rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '0.5rem'
            }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: 'var(--color-neutral-500)', marginBottom: '0.3rem' }}>{t('nav.profile', 'PROFIL')}</div>
                <div style={{ color: 'white', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>

            {/* Menu Links */}
            <Link to="/dashboard" onClick={onClose} style={itemStyle} onMouseEnter={e => handleHover(e, true)} onMouseLeave={e => handleHover(e, false)}>
                <User size={18} style={{ opacity: 0.8 }} />
                <span>{t('nav.dashboard')}</span>
            </Link>

            {isAdmin && (
                <Link to="/admin" onClick={onClose} style={itemStyle} onMouseEnter={e => handleHover(e, true)} onMouseLeave={e => handleHover(e, false)}>
                    <Settings size={18} style={{ opacity: 0.8 }} />
                    <span>{t('nav.admin')}</span>
                </Link>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0.5rem 0' }} />

            {/* Logout Button */}
            <button
                onClick={onLogout}
                style={{ ...itemStyle, color: '#ff4d4d' }}
                onMouseEnter={e => {
                    handleHover(e, true);
                    e.currentTarget.style.background = 'rgba(255, 77, 77, 0.08)';
                    e.currentTarget.style.color = '#ff4d4d';
                }}
                onMouseLeave={e => {
                    handleHover(e, false);
                    e.currentTarget.style.color = '#ff4d4d';
                }}
            >
                <LogOut size={18} style={{ opacity: 0.9 }} />
                <span>{t('nav.logout')}</span>
            </button>
        </GlassPanel>
    );
}
