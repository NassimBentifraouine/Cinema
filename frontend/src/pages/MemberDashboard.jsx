import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Star, Clock, Film } from 'lucide-react';
import { userApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import StarRating from '../components/StarRating';

const TABS = [
    { key: 'favorites', icon: <Heart size={16} /> },
    { key: 'ratings', icon: <Star size={16} /> },
    { key: 'history', icon: <Clock size={16} /> },
];

export default function MemberDashboard() {
    const { t } = useTranslation();
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
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative' }} className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ margin: '0 0 0.5rem', fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-family-heading)', letterSpacing: '-0.02em' }}>{t('dashboard.title')}</h1>
                <p style={{ margin: 0, color: 'var(--color-neutral-400)', fontSize: '0.95rem' }}>{user?.email}</p>
            </div>

            {/* Tabs */}
            <div className="glass-panel" style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', padding: '0.5rem', borderRadius: 'var(--radius-xl)', width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
                {TABS.map(({ key, icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        role="tab"
                        aria-selected={tab === key}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)',
                            border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
                            fontFamily: 'var(--font-family-heading)',
                            background: tab === key ? 'var(--color-accent)' : 'transparent',
                            color: tab === key ? 'white' : 'var(--color-neutral-400)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: tab === key ? '0 4px 12px rgba(229, 9, 20, 0.3)' : 'none',
                        }}
                    >
                        {icon}
                        {t(`dashboard.${key}`)}
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
                    {tab === 'history' && <HistoryList history={data.history} t={t} />}
                </div>
            )}
        </main>
    );
}

function FavoritesGrid({ favorites, t }) {
    if (!favorites.length) return <EmptyState icon={<Heart size={40} />} msg={t('dashboard.no_favorites')} />;
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {favorites.map(movie => (
                <Link key={movie._id} to={`/movie/${movie.imdbId || movie._id}`}>
                    <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <img src={movie.poster || 'https://via.placeholder.com/160x240/100f1e/8888aa?text=?'} alt={movie.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                        <div style={{ padding: '0.75rem' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-neutral-100)', fontFamily: 'var(--font-family-heading)', lineHeight: 1.2 }} className="line-clamp-2">{movie.title}</p>
                            {movie.year && <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{movie.year}</p>}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function RatingsList({ ratings, t }) {
    if (!ratings.length) return <EmptyState icon={<Star size={40} />} msg={t('dashboard.no_ratings')} />;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ratings.map(r => (
                <div key={r._id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', borderRadius: 'var(--radius-xl)' }}>
                    {r.movie?.poster && <img src={r.movie.poster} alt={r.movie.title} style={{ width: '56px', height: '84px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }} />}
                    <div style={{ flex: 1 }}>
                        <Link to={`/movie/${r.movie?.imdbId || r.movie?._id}`}>
                            <p style={{ margin: '0 0 0.4rem', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-family-heading)' }}>{r.movie?.title || '—'}</p>
                        </Link>
                        <StarRating value={r.score} max={10} readOnly size={16} />
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>{t('dashboard.my_rating', { score: r.score })}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function HistoryList({ history, t }) {
    if (!history.length) return <EmptyState icon={<Clock size={40} />} msg={t('dashboard.no_history')} />;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                            {h.visitedAt ? new Date(h.visitedAt).toLocaleDateString('fr-FR') : ''}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function EmptyState({ icon, msg }) {
    return (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 1rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ color: 'var(--color-neutral-600)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
            <p style={{ color: 'var(--color-neutral-400)', fontSize: '1.05rem', fontWeight: 500 }}>{msg}</p>
        </div>
    );
}
