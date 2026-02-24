import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

const PLACEHOLDER_POSTER = 'https://via.placeholder.com/300x450/100f1e/8888aa?text=No+Poster';

export default function MovieCard({ movie, isFavorite, onToggleFavorite }) {
    const { isAuthenticated } = useAuthStore();
    const posterSrc = movie.customPoster
        ? `http://localhost:3001${movie.customPoster}`
        : movie.poster || PLACEHOLDER_POSTER;

    return (
        <div
            className="card-hover"
            style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-neutral-800)',
                cursor: 'pointer',
                aspectRatio: '2/3',
            }}
        >
            <Link to={`/movie/${movie.imdbId || movie._id}`} style={{ display: 'block', height: '100%' }}>
                {/* Poster */}
                <img
                    src={posterSrc}
                    alt={movie.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.src = PLACEHOLDER_POSTER; }}
                />

                {/* Hover overlay */}
                <div
                    className="movie-overlay"
                    style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(7,7,15,0.98) 0%, rgba(7,7,15,0.6) 50%, transparent 100%)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                        padding: '1rem', opacity: 0, transition: 'opacity 0.3s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'white', lineHeight: 1.3 }} className="line-clamp-2">
                        {movie.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                        {movie.year && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{movie.year}</span>
                        )}
                        {movie.imdbRating > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: 'auto' }}>
                                <Star size={12} fill="var(--color-gold)" color="var(--color-gold)" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                                    {movie.imdbRating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                    {movie.plot && (
                        <p className="line-clamp-3" style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)', lineHeight: 1.5 }}>
                            {movie.plot}
                        </p>
                    )}
                </div>
            </Link>

            {/* Always visible overlay at bottom - title and rating when not hovering */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(7,7,15,0.9))',
                padding: '2rem 0.75rem 0.75rem',
                pointerEvents: 'none',
            }}>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'white' }} className="line-clamp-2">
                    {movie.title}
                </p>
                {movie.imdbRating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                        <Star size={10} fill="var(--color-gold)" color="var(--color-gold)" />
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                            {movie.imdbRating.toFixed(1)}
                        </span>
                    </div>
                )}
            </div>

            {/* IMDb rating badge top-right */}
            {movie.imdbRating > 0 && (
                <div style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'rgba(7,7,15,0.85)', borderRadius: 'var(--radius-sm)',
                    padding: '0.2rem 0.45rem', display: 'flex', alignItems: 'center', gap: '0.2rem',
                }}>
                    <Star size={10} fill="var(--color-gold)" color="var(--color-gold)" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-gold)' }}>
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
                        position: 'absolute', top: '0.5rem', left: '0.5rem',
                        background: 'rgba(7,7,15,0.85)', border: 'none', borderRadius: 'var(--radius-sm)',
                        padding: '0.35rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Heart size={16} fill={isFavorite ? 'var(--color-accent)' : 'none'} color={isFavorite ? 'var(--color-accent)' : 'white'} />
                </button>
            )}
        </div>
    );
}
