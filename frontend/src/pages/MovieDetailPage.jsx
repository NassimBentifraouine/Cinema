import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Clock, Globe, ChevronLeft, User } from 'lucide-react';
import { moviesApi, userApi } from '../lib/api';
import FavoriteButton from '../components/FavoriteButton';
import StarRating from '../components/StarRating';
import CommentSection from '../components/CommentSection';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toaster';

const PLACEHOLDER_POSTER = 'https://via.placeholder.com/400x600/100f1e/8888aa?text=No+Poster';

export default function MovieDetailPage() {
    const { id } = useParams();
    const { t } = useTranslation();
    const { isAuthenticated } = useAuthStore();
    const { toast } = useToast();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        moviesApi.getOne(id)
            .then(r => setMovie(r.data))
            .catch(() => setMovie(null))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!isAuthenticated) return;
        userApi.getRatings().then(r => {
            const found = r.data.ratings?.find(rt => rt.movie?._id === movie?._id);
            if (found) setUserRating(found.score);
        }).catch(() => { });
    }, [isAuthenticated, movie]);

    // Track history — called once movie is loaded and user is authenticated
    useEffect(() => {
        if (!isAuthenticated || !movie?._id) return;
        userApi.addHistory(movie._id).catch(() => { });
    }, [isAuthenticated, movie?._id]);

    const refreshMovie = () => {
        moviesApi.getOne(id).then(r => setMovie(r.data)).catch(() => { });
    };

    const handleRate = async (score) => {
        if (!isAuthenticated) {
            toast({ message: 'Connectez-vous pour noter ce film', type: 'info' });
            return;
        }
        setRatingLoading(true);
        try {
            await userApi.rateMovie(movie._id, score);
            setUserRating(score);
            refreshMovie(); // Update community stats
            toast({ message: `Note de ${score}/10 enregistrée !`, type: 'success' });
        } catch {
            toast({ message: t('errors.server_error'), type: 'error' });
        } finally {
            setRatingLoading(false);
        }
    };

    const handleDeleteRating = async () => {
        setRatingLoading(true);
        try {
            await userApi.deleteRating(movie._id);
            setUserRating(0);
            refreshMovie(); // Update community stats
            toast({ message: 'Note supprimée', type: 'info' });
        } catch {
            toast({ message: t('errors.server_error'), type: 'error' });
        } finally {
            setRatingLoading(false);
        }
    };

    if (loading) return <MovieDetailSkeleton />;
    if (!movie) return (
        <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <p style={{ color: 'var(--color-neutral-400)', fontSize: '1.2rem' }}>Film non trouvé.</p>
            <Link to="/" style={{ color: 'var(--color-accent)', marginTop: '1rem', display: 'inline-block' }}>
                ← Retour au catalogue
            </Link>
        </div>
    );

    const posterSrc = movie.customPoster
        ? `http://localhost:3001${movie.customPoster}`
        : movie.poster || PLACEHOLDER_POSTER;

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
            {/* Back link */}
            <Link
                to="/"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-neutral-400)', fontSize: '0.875rem', marginBottom: '1.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-neutral-100)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-neutral-400)'}
            >
                <ChevronLeft size={16} /> {t('common.back')}
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 320px) 1fr', gap: '2.5rem', alignItems: 'start' }}>
                {/* Poster */}
                <div style={{ position: 'sticky', top: '80px' }}>
                    <img
                        src={posterSrc}
                        alt={movie.title}
                        style={{ width: '100%', borderRadius: 'var(--radius-xl)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', display: 'block' }}
                        onError={e => { e.target.src = PLACEHOLDER_POSTER; }}
                    />
                </div>

                {/* Details */}
                <div>
                    {/* Genres */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        {(movie.genre || []).map(g => (
                            <span key={g} style={{
                                padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 600,
                                borderRadius: 'var(--radius-pill)', background: 'var(--color-neutral-900)',
                                color: 'var(--color-neutral-200)', border: '1px solid var(--color-neutral-700)',
                            }}>{g}</span>
                        ))}
                    </div>

                    <h1 style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, lineHeight: 1.15 }}>
                        {movie.title}
                    </h1>

                    {/* Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        {movie.year && <MetaItem icon={null} label={movie.year} />}
                        {movie.runtime && <MetaItem icon={<Clock size={14} />} label={movie.runtime} />}
                        {movie.language && <MetaItem icon={<Globe size={14} />} label={movie.language} />}

                        {/* Community Rating */}
                        {movie.communityVotes > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(var(--color-accent-rgb), 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}>
                                <User size={14} fill="currentColor" />
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{movie.communityRating.toFixed(1)}</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({movie.communityVotes} {movie.communityVotes > 1 ? 'avis' : 'avis'})</span>
                            </div>
                        )}

                        {movie.imdbRating > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'var(--color-neutral-900)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-700)' }}>
                                <Star size={16} fill="var(--color-gold)" color="var(--color-gold)" />
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-gold)' }}>{movie.imdbRating.toFixed(1)}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>/10 IMDb</span>
                            </div>
                        )}
                    </div>

                    {/* Plot */}
                    {movie.plot && (
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h2 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-neutral-400)', marginBottom: '0.5rem' }}>
                                {t('movie.plot')}
                            </h2>
                            <p style={{ color: 'var(--color-neutral-200)', lineHeight: 1.7, margin: 0 }}>{movie.plot}</p>
                        </div>
                    )}

                    {/* Director / Actors */}
                    {movie.director && <InfoRow label={t('movie.director')} value={movie.director} />}
                    {movie.actors && <InfoRow label={t('movie.actors')} value={movie.actors} />}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '2rem 0', alignItems: 'center' }}>
                        <FavoriteButton movieId={movie._id} size="lg" />
                    </div>

                    {/* User rating */}
                    <div style={{ padding: '1.25rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-800)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>{t('movie.rate_movie')}</h3>
                            {userRating > 0 && (
                                <button
                                    onClick={handleDeleteRating}
                                    disabled={ratingLoading}
                                    style={{
                                        background: 'transparent', border: 'none', color: '#ff4d4d',
                                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                        padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    Supprimer ma note
                                </button>
                            )}
                        </div>
                        <StarRating value={userRating} onChange={ratingLoading ? undefined : handleRate} max={10} size={22} />
                        {!isAuthenticated && <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-400)' }}>Connectez-vous pour noter ce film.</p>}
                    </div>
                </div>
            </div>

            {/* Comment Section below */}
            <CommentSection movieId={movie._id} />
        </main>
    );
}

function MetaItem({ icon, label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
            {icon}
            {label}
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-neutral-400)', marginRight: '0.5rem' }}>{label}:</span>
            <span style={{ color: 'var(--color-neutral-200)', fontSize: '0.9rem' }}>{value}</span>
        </div>
    );
}

function MovieDetailSkeleton() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 320px) 1fr', gap: '2.5rem' }}>
                <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-xl)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="skeleton" style={{ height: '2.5rem', width: '60%', borderRadius: 'var(--radius-md)' }} />
                    <div className="skeleton" style={{ height: '1rem', width: '40%', borderRadius: 'var(--radius-md)' }} />
                    <div className="skeleton" style={{ height: '6rem', borderRadius: 'var(--radius-lg)' }} />
                    <div className="skeleton" style={{ height: '3rem', width: '200px', borderRadius: 'var(--radius-pill)' }} />
                </div>
            </div>
        </div>
    );
}
