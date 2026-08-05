import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Properties from './pages/Properties.jsx';

function App() {
  const { user, loading } = useAuth();

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/properties">Properties</Link>
        {' | '}
        {loading ? (
          <span>Checking session...</span>
        ) : user ? (
          <span>Logged in as {user.name}</span>
        ) : (
          <span>Not logged in</span>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
      </Routes>
    </div>
  );
}

export default App;