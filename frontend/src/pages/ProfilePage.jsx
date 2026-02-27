import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';
import GlassPanel from '../components/ui/GlassPanel';
import ProfileSettings from '../components/ProfileSettings';

export default function ProfilePage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();

    return (
        <main style={{ width: '92%', maxWidth: '1400px', margin: '0 auto', padding: '160px 0 4rem', position: 'relative' }} className="animate-fade-in">
            <header style={{ marginBottom: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '32px', height: '2px', backgroundColor: 'var(--color-accent)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        {t('dashboard.account', 'MON COMPTE')}
                    </span>
                    <div style={{ width: '32px', height: '2px', backgroundColor: 'var(--color-accent)' }} />
                </div>
                <h1 style={{
                    margin: 0,
                    fontSize: '3.5rem',
                    fontWeight: 950,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    color: 'white',
                    fontFamily: 'var(--font-family-heading)'
                }}>
                    {t('profile.title')}
                </h1>
                <p style={{ margin: '1rem 0 0', color: 'var(--color-neutral-400)', fontSize: '1.1rem', fontWeight: 500 }}>
                    {user?.email}
                </p>
            </header>

            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <GlassPanel padding="3rem" borderRadius="1.5rem">
                    <ProfileSettings />
                </GlassPanel>
            </div>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </main>
    );
}
