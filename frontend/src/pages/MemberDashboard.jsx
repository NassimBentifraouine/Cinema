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
                history: h.data.history || [],
            });
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800 }}>{t('dashboard.title')}</h1>
                <p style={{ margin: 0, color: 'var(--color-neutral-400)', fontSize: '0.9rem' }}>{user?.email}</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--color-bg-card)', padding: '0.3rem', borderRadius: 'var(--radius-lg)', width: 'fit-content', border: '1px solid var(--color-neutral-800)' }}>
                {TABS.map(({ key, icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        role="tab"
                        aria-selected={tab === key}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-md)',
                            border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                            background: tab === key ? 'var(--color-accent)' : 'transparent',
                            color: tab === key ? 'white' : 'var(--color-neutral-400)',
                            transition: 'all 0.2s',
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
                <>
                    {tab === 'favorites' && <FavoritesGrid favorites={data.favorites} t={t} />}
                    {tab === 'ratings' && <RatingsList ratings={data.ratings} t={t} />}
                    {tab === 'history' && <HistoryList history={data.history} t={t} />}
                </>
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
                    <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-neutral-800)', transition: 'transform 0.25s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <img src={movie.poster || 'https://via.placeholder.com/160x240/100f1e/8888aa?text=?'} alt={movie.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                        <div style={{ padding: '0.6rem' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-neutral-100)' }} className="line-clamp-2">{movie.title}</p>
                            {movie.year && <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--color-neutral-400)' }}>{movie.year}</p>}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ratings.map(r => (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-800)' }}>
                    {r.movie?.poster && <img src={r.movie.poster} alt={r.movie.title} style={{ width: '48px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />}
                    <div style={{ flex: 1 }}>
                        <Link to={`/movie/${r.movie?.imdbId || r.movie?._id}`}>
                            <p style={{ margin: '0 0 0.25rem', fontWeight: 600, fontSize: '0.95rem' }}>{r.movie?.title || '—'}</p>
                        </Link>
                        <StarRating value={r.score} max={10} readOnly size={14} />
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{t('dashboard.my_rating', { score: r.score })}</p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-800)', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-neutral-600)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-neutral-800)'}
                    >
                        <Film size={18} style={{ color: 'var(--color-neutral-500)', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{h.movie?.title || '—'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
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
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ color: 'var(--color-neutral-700)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
            <p style={{ color: 'var(--color-neutral-400)', fontSize: '1rem' }}>{msg}</p>
        </div>
    );
}
