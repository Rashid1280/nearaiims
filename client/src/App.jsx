import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Properties from './pages/Properties.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import axios from 'axios';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyDetail from './pages/PropertyDetail.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useState } from 'react';
import AddProperty from './pages/AddProperty.jsx';
import EditProperty from './pages/EditProperty.jsx';

function App() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  return (
    <div>
      <nav className="px-6 py-4 border-b border-line bg-white">
        <div className="flex items-center justify-between flex-wrap">
          <Link to="/" className="font-semibold text-brand text-lg">NearAIIMS</Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-ink"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div
            className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-col gap-3 mt-4
                        md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:mt-0`}
          >
            <Link to="/properties" onClick={() => setMenuOpen(false)} className="text-ink hover:text-brand">
              Properties
            </Link>

            {user && (
              <Link to="/add-property" onClick={() => setMenuOpen(false)} className="text-ink hover:text-brand">
                List a property
              </Link>
            )}
            {user && (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-ink hover:text-brand">
                My Dashboard
              </Link>
            )}

            {loading ? (
              <span className="text-sm text-muted">Checking session...</span>
            ) : user ? (
              <span className="text-sm text-muted">Logged in as {user.name}</span>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-ink hover:text-brand">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="text-ink hover:text-brand">
                  Register
                </Link>
              </>
            )}
            
            {user && (
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="px-3 py-1.5 rounded-md bg-brand text-white text-sm hover:bg-brand-dark"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/properties/:id' element={<PropertyDetail/>}/>
        <Route path='/dashboard' element={ <ProtectedRoute> <OwnerDashboard /> </ProtectedRoute>}/>
        <Route path="/add-property" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />
        <Route path="/edit-property/:id" element={<ProtectedRoute><EditProperty /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;