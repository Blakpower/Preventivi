import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Articles } from './pages/Articles';
import { Quotes } from './pages/Quotes';
import { NewQuote } from './pages/NewQuote';
import { Customers } from './pages/Customers';
import { SettingsPage } from './pages/Settings';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { getCurrentUserId } from './db';

const RequireAuth = () => {
  const uid = getCurrentUserId();
  if (!uid) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <Dashboard />
      },
      {
        path: "articles",
        element: <Articles />
      },
      {
        path: "customers",
        element: <Customers />
      },
      {
        path: "quotes",
        element: <Quotes />
      },
      {
        path: "quotes/new",
        element: <NewQuote />
      },
      {
        path: "quotes/:id/edit",
        element: <NewQuote />
      },
      {
        path: "settings",
        element: <SettingsPage />
      },
      {
        path: "users",
        element: <Users />
      }
    ]
  }
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
