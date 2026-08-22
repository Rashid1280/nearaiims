import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Properties from './pages/Properties.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropertyDetail from './pages/PropertyDetail.jsx'

function App() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
     axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true })
          .then(() => {
            setUser(null);
            navigate('/');
          })
          .catch((err) => console.error('Logout failed:', err));
}

   

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
        {user && <button onClick={handleLogout}>Logout</button>}        

      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/properties/:id' element={<PropertyDetail/>}/>
      </Routes>
    </div>
  );
}

export default App;