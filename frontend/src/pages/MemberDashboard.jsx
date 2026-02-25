import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Star, Clock, Film } from 'lucide-react';
import { userApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import StarRating from '../components/StarRating';


import GlassPanel from '../components/ui/GlassPanel';

const TABS = [
    { key: 'favorites', icon: <Heart size={16} /> },
    { key: 'ratings', icon: <Star size={16} /> },
    { key: 'history', icon: <Clock size={16} /> },
];

export default function MemberDashboard() {
    const { t, i18n } = useTranslation();
    const { user } = useAuthStore();
    const [tab, setTab] = useState('favorites');
    const [data, setData] = useState({ favorites: [], ratings: [], history: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            userApi.getFavorites(),
            userApi.getRatings(),
            userApi.getHistory(),
        ]).then(([f, r, h]) => {
            setData({
                favorites: f.data.favorites || [],
                ratings: r.data.ratings || [],
                history: (h.data.history || []).filter(item => item && item.movie),
            });
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <main style={{ width: '92%', maxWidth: '1400px', margin: '0 auto', padding: '160px 0 4rem', position: 'relative' }} className="animate-fade-in">
            {/* Page Header */}
            <header style={{ marginBottom: '3.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '32px', height: '2px', backgroundColor: 'var(--color-accent)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        {t('dashboard.user_space', 'USER SPACE')}
                    </span>
                </div>
                <h1 style={{
                    margin: 0,
                    fontSize: '3rem',
                    fontWeight: 950,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    color: 'white',
                    fontFamily: 'var(--font-family-heading)'
                }}>
                    {t('dashboard.title')}
                </h1>
                <p style={{ margin: '0.75rem 0 0', color: 'var(--color-neutral-400)', fontSize: '1rem', fontWeight: 500 }}>
                    {user?.email}
                </p>
            </header>

            {/* Tabs Navigation */}
            <div style={{
                display: 'flex',
                gap: '2.5rem',
                marginBottom: '3rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                paddingBottom: '0.2rem'
            }}>
                {TABS.map(({ key, icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        role="tab"
                        aria-selected={tab === key}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.8rem 0',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            color: tab === key ? 'white' : 'var(--color-neutral-400)',
                            transition: 'color 0.3s ease'
                        }}
                    >
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: tab === key ? 1 : 0.6,
                            color: tab === key ? 'var(--color-accent)' : 'inherit'
                        }}>
                            {icon}
                        </span>
                        <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            fontFamily: 'var(--font-family-heading)'
                        }}>
                            {t(`dashboard.${key}`)}
                        </span>

                        {/* Active Underline Indicator */}
                        {tab === key && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-1px',
                                left: 0,
                                right: 0,
                                height: '2px',
                                background: 'var(--color-accent)',
                                boxShadow: '0 0 12px var(--color-accent)',
                                borderRadius: '2px'
                            }} className="animate-scale-x" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-lg)' }} />
                    ))}
                </div>
            ) : (
                <div className="animate-fade-in" style={{ animationDuration: '0.4s' }}>
                    {tab === 'favorites' && <FavoritesGrid favorites={data.favorites} t={t} />}
                    {tab === 'ratings' && <RatingsList ratings={data.ratings} t={t} />}
                    {tab === 'history' && <HistoryList history={data.history} t={t} i18n={i18n} />}
                </div>
            )}
        </main>
    );
}

function FavoritesGrid({ favorites, t }) {
    if (!favorites.length) return <EmptyState icon={<Heart size={40} />} msg={t('dashboard.no_favorites')} />;
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '2rem' }}>
            {favorites.map(movie => (
                <Link key={movie._id} to={`/movie/${movie.imdbId || movie._id}`}>
                    <GlassPanel padding="0" borderRadius="var(--radius-xl)" style={{ overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <img src={movie.poster || 'https://via.placeholder.com/160x240/100f1e/8888aa?text=?'} alt={movie.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                        <div style={{ padding: '0.75rem' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-neutral-100)', fontFamily: 'var(--font-family-heading)', lineHeight: 1.2 }} className="line-clamp-2">{movie.title}</p>
                            {movie.year && <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{movie.year}</p>}
                        </div>
                    </GlassPanel>
                </Link>
            ))}
        </div>
    );
}

function RatingsList({ ratings, t }) {
    if (!ratings.length) return <EmptyState icon={<Star size={40} />} msg={t('dashboard.no_ratings')} />;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {ratings.map(r => (
                <GlassPanel key={r._id} padding="1rem" borderRadius="var(--radius-xl)" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {r.movie?.poster && <img src={r.movie.poster} alt={r.movie.title} style={{ width: '56px', height: '84px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }} />}
                    <div style={{ flex: 1 }}>
                        <Link to={`/movie/${r.movie?.imdbId || r.movie?._id}`}>
                            <p style={{ margin: '0 0 0.4rem', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-family-heading)' }}>{r.movie?.title || '—'}</p>
                        </Link>
                        <StarRating value={r.score} max={10} readOnly size={16} />
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>{t('dashboard.my_rating', { score: r.score })}</p>
                    </div>
                </GlassPanel>
            ))}
        </div>
    );
}

function HistoryList({ history, t, i18n }) {
    if (!history.length) return <EmptyState icon={<Clock size={40} />} msg={t('dashboard.no_history')} />;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map(h => (
                <Link key={h._id} to={`/movie/${h.movie?.imdbId || h.movie?._id}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-card)'}
                    >
                        <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Film size={16} style={{ color: 'var(--color-neutral-400)' }} />
                        </div>
                        <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-neutral-200)' }}>{h.movie?.title || '—'}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>
                            {h.visitedAt ? new Date(h.visitedAt).toLocaleDateString(i18n?.language === 'en' ? 'en-US' : 'fr-FR') : ''}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function EmptyState({ icon, msg }) {
    return (
        <GlassPanel padding="7rem 2rem" borderRadius="var(--radius-xl)" style={{ textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)' }}>
            <div style={{ color: 'var(--color-neutral-600)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
            <p style={{ color: 'var(--color-neutral-400)', fontSize: '1.1rem', fontWeight: 500, maxWidth: '400px', margin: '0 auto' }}>{msg}</p>
        </GlassPanel>
    );
}
