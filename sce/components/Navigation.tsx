import { Moon, Sun, Store, Shield, LayoutGrid, UserCircle2, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/router';
import { cn } from '@/lib/utils';

export function Header({ title, showBack }: { title?: string; showBack?: boolean }) {
  const { theme, toggle } = useTheme();
  const { navigate } = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-lg dark:border-gray-800/80 dark:bg-gray-950/90">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1 as unknown as string)}
              className="btn-ghost -ml-2 p-2"
              aria-label="ย้อนกลับ"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
          )}
          {title ? (
            <h1 className="text-base font-bold">{title}</h1>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Store size={18} />
              </div>
              <span className="text-base font-bold">ตลาดนัดชุมชน</span>
            </Link>
          )}
        </div>
        <button
          onClick={toggle}
          className="btn-ghost p-2"
          aria-label={theme === 'light' ? 'เปิดโหมดกลางคืน' : 'เปิดโหมดกลางวัน'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { profile } = useAuth();
  const { path } = useRouter();

  const items = [
    { to: '/', label: 'หน้าแรก', icon: LayoutGrid, match: (p: string) => p === '/' },
    { to: '/sell', label: 'ร้านของฉัน', icon: Store, match: (p: string) => p.startsWith('/sell') },
    ...(profile?.is_admin
      ? [{ to: '/admin', label: 'ผู้ดูแล', icon: Shield, match: (p: string) => p.startsWith('/admin') }]
      : []),
    {
      to: profile ? '/profile' : '/auth',
      label: profile ? 'บัญชี' : 'เข้าสู่ระบบ',
      icon: profile ? UserCircle2 : UserCircle2,
      match: (p: string) => p.startsWith('/profile') || p.startsWith('/auth'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex max-w-3xl items-stretch justify-around">
        {items.map((item) => {
          const active = item.match(path);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
                active
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <Icon size={22} className={active ? 'scale-110 transition-transform' : 'transition-transform'} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const { navigate } = useRouter();
  if (!profile) return null;
  return (
    <button
      onClick={async () => {
        await signOut();
        navigate('/');
      }}
      className="btn-secondary"
    >
      <LogOut size={16} /> ออกจากระบบ
    </button>
  );
}
