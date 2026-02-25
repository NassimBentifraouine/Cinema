import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, MessageSquare, Send } from 'lucide-react';
import { moviesApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { useToast } from './ui/Toaster';

export default function CommentSection({ movieId }) {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuthStore();
    const { toast } = useToast();

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await moviesApi.getComments(movieId);
            setComments(res.data);
        } catch {
            console.error('Failed to fetch comments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [movieId]);

    const handleSumbit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            toast({ message: t('movie.comment_empty'), type: 'error' });
            return;
        }

        setSubmitting(true);
        try {
            await moviesApi.addComment(movieId, newComment);
            setNewComment('');
            fetchComments();
            toast({ message: 'Commentaire ajouté !', type: 'success' });
        } catch {
            toast({ message: t('errors.server_error'), type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;

        try {
            await moviesApi.deleteComment(commentId);
            setComments(comments.filter(c => c._id !== commentId));
            toast({ message: t('movie.delete_comment') + ' OK', type: 'success' });
        } catch {
            toast({ message: t('errors.server_error'), type: 'error' });
        }
    };

    return (
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-800)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 800 }}>
                <MessageSquare size={20} color="var(--color-accent)" />
                {t('movie.comments')} <span style={{ color: 'var(--color-neutral-400)', fontSize: '1rem', fontWeight: 500 }}>({comments.length})</span>
            </h3>

            {/* Comment Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSumbit} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t('movie.add_comment')}
                            rows={3}
                            style={{
                                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                                background: 'var(--color-neutral-900)', border: '1px solid var(--color-neutral-700)',
                                color: 'var(--color-neutral-100)', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                            >
                                {submitting ? t('common.loading') : (
                                    <>
                                        <Send size={16} />
                                        {t('movie.post_comment')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div style={{ padding: '1.25rem', background: 'rgba(var(--color-accent-rgb), 0.1)', border: '1px dashed var(--color-accent)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '2rem', color: 'var(--color-accent)' }}>
                    {t('movie.login_to_comment')}
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />
            ) : comments.length === 0 ? (
                <p style={{ color: 'var(--color-neutral-400)', textAlign: 'center', fontStyle: 'italic', padding: '2rem 0' }}>{t('movie.no_comments')}</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {comments.map((comment) => (
                        <div key={comment._id} style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-neutral-800)', color: 'var(--color-neutral-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                                {comment.user?.email ? comment.user.email.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <div>
                                        <span style={{ fontWeight: 600, color: 'var(--color-neutral-200)', marginRight: '0.5rem' }}>
                                            {comment.user?.email ? comment.user.email.split('@')[0] : 'Utilisateur'}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                                            {new Date(comment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {(user?.role === 'ADMIN' || user?._id === comment.user?._id) && (
                                        <button
                                            onClick={() => handleDelete(comment._id)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--color-neutral-500)', cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', display: 'flex' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#ff4d4d'; e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-neutral-500)'; e.currentTarget.style.background = 'transparent'; }}
                                            title={t('movie.delete_comment')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <p style={{ margin: 0, color: 'var(--color-neutral-300)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                    {comment.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
