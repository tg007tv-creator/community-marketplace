import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { RouterProvider, useRouter } from '@/router';
import { BottomNav } from '@/components/Navigation';
import { HomePage } from '@/pages/HomePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { SellerDashboardPage } from '@/pages/SellerDashboardPage';
import { AuthPage } from '@/pages/AuthPage';
import { AdminPage } from '@/pages/AdminPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ChatPage } from '@/pages/ChatPage';

function Routes() {
  const { path } = useRouter();

  let page: React.ReactNode;
  let showBottomNav = true;

  if (path === '/' || path === '') {
    page = <HomePage />;
  } else if (path.startsWith('/product/')) {
    const id = path.replace('/product/', '');
    page = <ProductDetailPage id={id} />;
    showBottomNav = false;
  } else if (path.startsWith('/sell')) {
    page = <SellerDashboardPage />;
  } else if (path.startsWith('/auth')) {
    page = <AuthPage />;
    showBottomNav = false;
  } else if (path.startsWith('/admin')) {
    page = <AdminPage />;
  } else if (path.startsWith('/profile')) {
    page = <ProfilePage />;
  } else if (path.startsWith('/chat')) {
    page = <ChatPage />;
  } else {
    page = <HomePage />;
  }

  return (
    <>
      {page}
      {showBottomNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider>
          <Routes />
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
