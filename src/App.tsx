import { lazy, Suspense } from 'react';
import { MotionConfig } from 'motion/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DetailSkeleton, PageSkeleton } from './components/Skeleton';
import { ThemeProvider } from './hooks/useTheme';
import { CompareProvider } from './hooks/useCompare';
import { loadComparePage, loadVehiclePage } from './lib/preload';

// Rotas secundárias em chunks separados; o import também é disparado no hover dos cards.
const VehiclePage = lazy(loadVehiclePage);
const ComparePage = lazy(loadComparePage);

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/veiculo/:id',
        element: (
          <Suspense fallback={<DetailSkeleton />}>
            <VehiclePage />
          </Suspense>
        ),
      },
      {
        path: '/comparar',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <ComparePage />
          </Suspense>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
], { basename: import.meta.env.BASE_URL });

export function App() {
  return (
    <ThemeProvider>
      <CompareProvider>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
      </CompareProvider>
    </ThemeProvider>
  );
}
