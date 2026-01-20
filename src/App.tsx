import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Articles } from './pages/Articles';
import { Quotes } from './pages/Quotes';
import { NewQuote } from './pages/NewQuote';
import { SettingsPage } from './pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/quotes/new" element={<NewQuote />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
