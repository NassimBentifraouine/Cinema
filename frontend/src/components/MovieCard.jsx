import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useTranslation } from 'react-i18next';

const PLACEHOLDER_POSTER = 'https://via.placeholder.com/300x450/141414/8888aa?text=No+Poster';

export default function MovieCard({ movie, isFavorite, onToggleFavorite, variant = 'grid' }) {
    const { isAuthenticated } = useAuthStore();
    const { i18n } = useTranslation();
    const isEn = i18n.language === 'en';
    const displayTitle = (isEn && movie.titleVO) ? movie.titleVO : movie.title;
    const displayPlot = (isEn && movie.plotVO) ? movie.plotVO : movie.plot;
    const displayGenre = (isEn && movie.genreVO?.length > 0) ? movie.genreVO : movie.genre;

    const posterSrc = movie.customPoster
        ? `http://localhost:3001${movie.customPoster}`
        : movie.poster || PLACEHOLDER_POSTER;

    if (variant === 'list') {
        return (
            <div style={{
                display: 'flex', gap: '1.5rem', alignItems: 'center',
                background: 'var(--color-bg-card)', padding: '1rem',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-800)',
                transition: 'border-color 0.2s'
            }} className="group hover:border-neutral-600">
                <Link to={`/movie/${movie.imdbId || movie._id}`} style={{ flexShrink: 0, width: '100px', aspectRatio: '2/3', overflow: 'hidden', borderRadius: '4px' }}>
                    <img src={posterSrc} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <Link to={`/movie/${movie.imdbId || movie._id}`}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{displayTitle}</h3>
                        </Link>
                        {movie.imdbRating > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-gold)', fontWeight: 800, fontSize: '0.85rem' }}>
                                <Star size={12} fill="currentColor" />
                                {movie.imdbRating.toFixed(1)}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-neutral-400)', marginBottom: '0.75rem' }}>
                        <span>{movie.year}</span>
                        {displayGenre && displayGenre.length > 0 && (
                            <>
                                <span>•</span>
                                <span className="line-clamp-1">{displayGenre.join(', ')}</span>
                            </>
                        )}
                    </div>
                    <p className="line-clamp-2" style={{ fontSize: '0.85rem', color: 'var(--color-neutral-300)', margin: 0, lineHeight: 1.5 }}>
                        {displayPlot}
                    </p>
                </div>
                {isAuthenticated && onToggleFavorite && (
                    <button
                        onClick={(e) => { e.preventDefault(); onToggleFavorite(movie._id); }}
                        style={{ background: 'none', border: 'none', color: isFavorite ? 'var(--color-accent)' : 'var(--color-neutral-600)', cursor: 'pointer', padding: '0.5rem' }}
                    >
                        <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }} className="group">
            {/* ... rest of existing grid layout ... */}

            {/* Poster Container */}
            <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                aspectRatio: '2/3',
                backgroundColor: 'var(--color-bg-card)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
                <Link to={`/movie/${movie.imdbId || movie._id}`} style={{ display: 'block', height: '100%', width: '100%' }}>
                    <img
                        src={posterSrc}
                        alt={displayTitle}
                        loading="lazy"
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                            transition: 'transform 0.4s ease'
                        }}
                        className="group-hover:scale-105"
                        onError={(e) => { e.target.src = PLACEHOLDER_POSTER; }}
                    />
                </Link>

                {/* Top Right Rating Badge */}
                {movie.imdbRating > 0 && (
                    <div style={{
                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(4px)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        display: 'flex', alignItems: 'center', gap: '0.25rem'
                    }}>
                        <Star size={10} fill="var(--color-gold)" color="var(--color-gold)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>
                            {movie.imdbRating.toFixed(1)}
                        </span>
                    </div>
                )}

                {/* Favorite button (if authenticated) */}
                {isAuthenticated && onToggleFavorite && (
                    <button
                        onClick={(e) => { e.preventDefault(); onToggleFavorite(movie._id); }}
                        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        style={{
                            position: 'absolute', bottom: '0.5rem', right: '0.5rem',
                            padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            transition: 'all 0.2s', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                            opacity: 0, transform: 'translateY(10px)'
                        }}
                        className="group-hover:opacity-100 group-hover:-translate-y-0"
                    >
                        <Heart size={16} fill={isFavorite ? 'var(--color-accent)' : 'none'} color={isFavorite ? 'var(--color-accent)' : 'white'} />
                    </button>
                )}
            </div>

            {/* Content Below Poster */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Link to={`/movie/${movie.imdbId || movie._id}`} style={{ display: 'block' }}>
                    <h3 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', fontWeight: 700, color: 'white', lineHeight: 1.3 }} className="line-clamp-1">
                        {displayTitle}
                    </h3>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                    {movie.year && <span>{movie.year}</span>}
                    {movie.year && movie.genre && movie.genre.length > 0 && <span>•</span>}
                    {displayGenre && displayGenre.length > 0 && (
                        <span className="line-clamp-1">
                            {displayGenre.slice(0, 2).join(', ')}
                        </span>
                    )}
                </div>
            </div>

        </div>
    );
}
