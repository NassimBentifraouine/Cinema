import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { userApi } from '../lib/api';
import { useToast } from './ui/Toaster';
import { useTranslation } from 'react-i18next';

export default function FavoriteButton({ movieId, size = 'md' }) {
    const { isAuthenticated } = useAuthStore();
    const { toast } = useToast();
    const { t } = useTranslation();
    const [isFav, setIsFav] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !movieId) return;
        userApi.getFavorites()
            .then(r => {
                const favIds = r.data.favorites.map(f => f._id || f);
                setIsFav(favIds.includes(movieId));
            })
            .catch(() => { });
    }, [isAuthenticated, movieId]);

    const toggle = async () => {
        if (!isAuthenticated) {
            toast({ message: 'Connectez-vous pour ajouter des favoris', type: 'info' });
            return;
        }
        setLoading(true);
        try {
            if (isFav) {
                await userApi.removeFavorite(movieId);
                setIsFav(false);
                toast({ message: t('movie.remove_favorite'), type: 'info' });
            } else {
                await userApi.addFavorite(movieId);
                setIsFav(true);
                toast({ message: t('movie.add_favorite') + ' ❤️', type: 'success' });
            }
        } catch {
            toast({ message: t('errors.server_error'), type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const pad = size === 'lg' ? '0.75rem 1.5rem' : '0.6rem 1.2rem';
    const fontSize = size === 'lg' ? '0.95rem' : '0.875rem';
    const iconSize = size === 'lg' ? 20 : 16;

    return (
        <button
            onClick={toggle}
            disabled={loading}
            aria-label={isFav ? t('movie.remove_favorite') : t('movie.add_favorite')}
            aria-pressed={isFav}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: pad, borderRadius: 'var(--radius-pill)',
                border: `1px solid ${isFav ? 'var(--color-accent)' : 'var(--color-neutral-700)'}`,
                background: isFav ? 'var(--color-accent-muted)' : 'transparent',
                color: isFav ? 'var(--color-accent)' : 'var(--color-neutral-200)',
                fontWeight: 600, fontSize, cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.25s',
                opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = 'var(--color-accent-muted)'; } }}
            onMouseLeave={e => { if (!isFav && !loading) { e.currentTarget.style.borderColor = 'var(--color-neutral-700)'; e.currentTarget.style.background = 'transparent'; } }}
        >
            <Heart size={iconSize} fill={isFav ? 'var(--color-accent)' : 'none'} color="currentColor" style={{ transition: 'fill 0.2s' }} />
            {isFav ? t('movie.remove_favorite') : t('movie.add_favorite')}
        </button>
    );
}
