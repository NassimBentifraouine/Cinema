import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Clock, Calendar, Heart, User } from 'lucide-react';
import { moviesApi, userApi } from '../lib/api';
import CommentSection from '../components/CommentSection';
import StarRating from '../components/StarRating';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toaster';

// UI Components
import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';

const PLACEHOLDER_POSTER = 'https://via.placeholder.com/400x600/141414/8888aa?text=No+Poster';
const AVATAR_PLACEHOLDER = 'https://api.dicebear.com/7.x/notionists/svg?seed=';

export default function MovieDetailPage() {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const { isAuthenticated } = useAuthStore();
    const { toast } = useToast();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [savingFav, setSavingFav] = useState(false);
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
        userApi.getFavorites().then(r => {
            const isFav = r.data.favorites?.some(f => (f._id || f) === id);
            setIsFavorite(!!isFav);
        }).catch(() => { });

        userApi.getRatings().then(r => {
            const found = r.data.ratings?.find(rt => rt.movie?._id === movie?._id);
            if (found) setUserRating(found.score);
        }).catch(() => { });

        // Add to history
        if (movie?._id) userApi.addHistory(movie._id).catch(() => { });
    }, [isAuthenticated, id, movie?._id]);

    const handleRate = async (score) => {
        if (!isAuthenticated) {
            toast({ message: t('movie.login_to_rate'), type: 'info' });
            return;
        }
        setRatingLoading(true);
        try {
            await userApi.rateMovie(movie._id, score);
            setUserRating(score);
            moviesApi.getOne(id).then(r => setMovie(r.data)).catch(() => { }); // Refresh stats
            toast({ message: `${score}/10!`, type: 'success' });
        } catch (err) {
            toast({ message: err.response?.data?.message || t('errors.server_error'), type: 'error' });
        } finally {
            setRatingLoading(false);
        }
    };

    const handleDeleteRating = async () => {
        setRatingLoading(true);
        try {
            await userApi.deleteRating(movie._id);
            setUserRating(0);
            moviesApi.getOne(id).then(r => setMovie(r.data)).catch(() => { }); // Refresh stats
            toast({ message: t('movie.remove_rating'), type: 'info' });
        } catch (err) {
            toast({ message: err.response?.data?.message || t('errors.server_error'), type: 'error' });
        } finally {
            setRatingLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            toast({ message: t('movie.login_to_favorite'), type: 'info' });
            return;
        }
        setSavingFav(true);
        try {
            if (isFavorite) {
                await userApi.removeFavorite(id);
                setIsFavorite(false);
                toast({ message: t('movie.removed_favorite'), type: 'info' });
            } else {
                await userApi.addFavorite(id);
                setIsFavorite(true);
                toast({ message: t('movie.added_favorite'), type: 'success' });
            }
        } catch (err) {
            toast({ message: err.response?.data?.message || t('errors.server_error'), type: 'error' });
        } finally {
            setSavingFav(false);
        }
    };

    if (loading) return <MovieDetailSkeleton />;
    if (!movie) return (
        <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <p style={{ color: 'var(--color-neutral-400)', fontSize: '1.2rem' }}>{t('catalog.no_results')}</p>
            <Link to="/" style={{ color: 'var(--color-accent)', marginTop: '1rem', display: 'inline-block' }}>
                ← {t('common.back')}
            </Link>
        </div>
    );

    const posterSrc = movie.customPoster
        ? `http://localhost:3001${movie.customPoster}`
        : movie.poster || PLACEHOLDER_POSTER;

    // Fake related movies since backend doesn't provide them, using same poster
    const relatedFake = [1, 2, 3];
    // Fake Cast
    const fakeCast = [
        { name: 'Matthew McConaughey', role: 'Cooper' },
        { name: 'Anne Hathaway', role: 'Brand' },
        { name: 'Jessica Chastain', role: 'Murph' },
        { name: 'Michael Caine', role: 'Professor Brand' },
        { name: 'Casey Affleck', role: 'Tom' }
    ];

    const isEn = i18n.language === 'en';
    const displayTitle = (isEn && movie.titleVO) ? movie.titleVO : movie.title;
    const displayPlot = (isEn && movie.plotVO) ? movie.plotVO : movie.plot;
    const displayGenre = (isEn && movie.genreVO?.length > 0) ? movie.genreVO : movie.genre;
    const displayLanguage = movie.language;

    return (
        <main className="animate-fade-in-slow" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Top Background Hero Section */}
            <div style={{ position: 'relative', width: '100%', height: '70vh', minHeight: '550px', overflow: 'hidden' }}>
                <div
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url(${posterSrc})`,
                        backgroundSize: 'cover', backgroundPosition: 'center 20%',
                        filter: 'blur(20px) scale(1.1)',
                        opacity: 0.3,
                        transform: 'translateZ(0)'
                    }}
                />
                <div
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to bottom, var(--color-bg-dark) 0%, transparent 50%, var(--color-bg-dark) 100%), linear-gradient(to right, var(--color-bg-dark) 0%, transparent 100%)',
                    }}
                />
            </div>

            {/* Main Content overlapping the hero */}
            <div style={{ maxWidth: '1400px', margin: '-45vh auto 0', padding: '0 4%', position: 'relative', zIndex: 10 }}>

                {/* Top Section Layout: Poster on left, Info on right */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '5rem', alignItems: 'end', marginBottom: '5rem' }}>

                    {/* Left: Premium Framed Poster */}
                    <div style={{ position: 'relative', transition: 'transform 0.5s ease' }}>
                        <div style={{
                            background: '#fff',
                            padding: '12px',
                            borderRadius: '2px',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1)',
                            position: 'relative',
                            zIndex: 10,
                            transform: 'rotate(-1deg)'
                        }}>
                            <img
                                src={posterSrc}
                                alt={movie.title}
                                style={{
                                    width: '100%', display: 'block',
                                    aspectRatio: '2/3', objectFit: 'cover'
                                }}
                            />
                        </div>
                    </div>

                    {/* Right: Info Area */}
                    <div style={{ paddingBottom: '2rem' }}>

                        {/* Breadcrumbs-ish / Meta */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '2rem', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                            <GlassPanel padding="0.4rem 0.8rem" borderRadius="var(--radius-sm)" style={{ color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>
                                {displayGenre?.length > 0 ? displayGenre.join(' / ') : 'MOVIE'}
                            </GlassPanel>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-neutral-300)' }}>
                                <Calendar size={16} color="var(--color-accent)" />
                                {movie.year || 'N/A'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-neutral-300)' }}>
                                <Clock size={16} color="var(--color-accent)" />
                                {movie.runtime || '2h 0m'}
                            </div>
                        </div>

                        {/* Cinematic Title */}
                        <h1 style={{
                            margin: '0 0 2.5rem',
                            fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                            fontWeight: 900,
                            lineHeight: 0.9,
                            letterSpacing: '-0.04em',
                            color: 'white',
                            textTransform: 'uppercase',
                            fontStyle: 'italic'
                        }}>
                            {displayTitle}
                        </h1>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4rem', flexWrap: 'wrap' }}>
                            {/* Dual Rating Block */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* IMDb Rating */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f5c518',
                                        color: '#000',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 900,
                                        width: 'fit-content'
                                    }}>
                                        IMDb
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{ display: 'flex', color: '#f5c518' }}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={20} fill={s <= (movie.imdbRating / 2) ? 'currentColor' : 'none'} color={s <= (movie.imdbRating / 2) ? 'currentColor' : 'var(--color-neutral-800)'} />
                                            ))}
                                        </div>
                                        <div style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                            {movie.imdbRating?.toFixed(1) || '0.0'}<span style={{ fontSize: '0.9rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>/10</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Community Rating */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-neutral-400)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('movie.community_score', 'UTILISATEURS')}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{ display: 'flex', color: 'var(--color-accent)' }}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={20} fill={s <= (movie.communityRating / 2) ? 'currentColor' : 'none'} color={s <= (movie.communityRating / 2) ? 'currentColor' : 'var(--color-neutral-800)'} />
                                            ))}
                                        </div>
                                        <div style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                            {movie.communityRating?.toFixed(1) || '0.0'}<span style={{ fontSize: '0.9rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>/10</span>
                                        </div>
                                        {movie.communityVotes > 0 && (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', backgroundColor: 'rgba(229, 9, 20, 0.1)' }}>
                                                {movie.communityVotes} {movie.communityVotes > 1 ? 'votes' : 'vote'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Column */}
                            {isAuthenticated && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '350px' }}>
                                    <Button
                                        onClick={handleToggleFavorite}
                                        disabled={savingFav}
                                        variant={isFavorite ? 'ghost' : 'primary'}
                                        size="lg"
                                        icon={Heart}
                                        style={{ width: '100%', border: isFavorite ? '2px solid rgba(255,255,255,0.2)' : 'none' }}
                                    >
                                        {isFavorite ? t('movie.in_watchlist') : t('movie.add_to_watchlist')}
                                    </Button>

                                    {/* Mini Rating Module */}
                                    <GlassPanel padding="1.5rem" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-neutral-400)', letterSpacing: '0.1em' }}>{t('movie.rate_movie')}</h3>
                                            {userRating > 0 && (
                                                <button
                                                    onClick={handleDeleteRating}
                                                    disabled={ratingLoading}
                                                    style={{
                                                        background: 'transparent', color: 'var(--color-neutral-500)',
                                                        fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                                                        border: 'none', textDecoration: 'underline'
                                                    }}
                                                >
                                                    {t('movie.remove_rating')}
                                                </button>
                                            )}
                                        </div>
                                        <StarRating value={userRating} onChange={ratingLoading ? undefined : handleRate} max={10} size={24} />
                                    </GlassPanel>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Content Section */}
                <div style={{ marginTop: '4rem' }}>
                    {/* Full Width: Plot & Info */}
                    <div>
                        <div style={{ marginBottom: '4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ width: '32px', height: '2px', backgroundColor: 'var(--color-accent)' }} />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'white' }}>
                                    {t('movie.plot')}
                                </h2>
                            </div>
                            <p style={{
                                color: 'var(--color-neutral-200)',
                                lineHeight: 1.8,
                                fontSize: '1.15rem',
                                margin: 0,
                                fontWeight: 400
                            }}>
                                {displayPlot || t('catalog.no_results')}
                            </p>
                        </div>

                        <CommentSection movieId={movie._id} />
                    </div>
                </div>
            </div>
        </main>
    );
}

function MovieDetailSkeleton() {
    return (
        <div style={{ minHeight: '100vh', padding: '6rem 4%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '4rem' }}>
                <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: '2px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '2rem' }}>
                    <div className="skeleton" style={{ height: '2rem', width: '40%' }} />
                    <div className="skeleton" style={{ height: '4rem', width: '80%' }} />
                    <div className="skeleton" style={{ height: '3rem', width: '50%' }} />
                </div>
            </div>
        </div>
    );
}
