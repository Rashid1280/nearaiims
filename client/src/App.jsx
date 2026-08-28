import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Properties from './pages/Properties.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropertyDetail from './pages/PropertyDetail.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();

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

<nav className="flex items-center gap-6 px-6 py-4 border-b border-gray-200 bg-white">

  <Link to="/" className="font-semibold text-gray-900 hover:text-violet-600">
    Home
  </Link>

  <Link to="/properties" className="text-gray-700 hover:text-violet-600">
    Properties
  </Link>

  <div className="ml-auto flex items-center gap-6">

    {loading ? (
      <span className="text-sm text-gray-400">Checking session...</span>
    ) : user ? (
      <span className="text-sm text-gray-600">Logged in as {user.name}</span>
    ) : (
      <>
        <Link to="/login" className="text-gray-700 hover:text-violet-600">
          Login
        </Link>
        <Link to="/register" className="text-gray-700 hover:text-violet-600">
          Register
        </Link>
      </>
    )}

    {user && (
      <Link to="/dashboard" className="text-gray-700 hover:text-violet-600">
        My Dashboard
      </Link>
    )}

    {user && (
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-700"
      >
        Logout
      </button>
    )}

  </div>
</nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/properties/:id' element={<PropertyDetail/>}/>
        <Route path='/dashboard' element={ <ProtectedRoute> <OwnerDashboard /> </ProtectedRoute>}/>
      </Routes>
    </div>
  );
}

export default App;