import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { userApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { useToast } from './ui/Toaster';
import Button from './ui/Button';
import Input from './ui/Input';

export default function ProfileSettings() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user, setAuth, token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            return toast({ message: t('profile.password_mismatch'), type: 'error' });
        }

        setLoading(true);
        try {
            const res = await userApi.updateProfile({
                email: formData.email,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword || undefined
            });

            // Update local user state with the user returned from backend
            setAuth({ user: res.data.user, token });

            toast({ message: t('profile.update_success'), type: 'success' });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (error) {
            toast({ message: error.response?.data?.message || t('errors.server_error'), type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Input
                id="email"
                label={t('profile.email_label')}
                icon={Mail}
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
            />

            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', color: 'var(--color-neutral-300)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} color="var(--color-accent)" />
                    {t('profile.security_section')}
                </h3>

                <Input
                    id="currentPassword"
                    label={t('profile.current_password_label')}
                    icon={Lock}
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <Input
                        id="newPassword"
                        label={t('profile.new_password_label')}
                        icon={Lock}
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />
                    <Input
                        id="confirmPassword"
                        label={t('profile.confirm_password_label')}
                        icon={Lock}
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                size="lg"
                fullWidth
                icon={loading ? Loader2 : Save}
                style={{ marginTop: '0.5rem' }}
            >
                {loading ? t('common.loading') : t('profile.save_button')}
            </Button>
        </form>
    );
}
