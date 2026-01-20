import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Articles } from './pages/Articles';
import { Quotes } from './pages/Quotes';
import { NewQuote } from './pages/NewQuote';
import { SettingsPage } from './pages/Settings';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { getCurrentUserId } from './db';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const uid = getCurrentUserId();
  if (!uid) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/quotes" element={<Quotes />} />
                  <Route path="/quotes/new" element={<NewQuote />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/users" element={<Users />} />
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
