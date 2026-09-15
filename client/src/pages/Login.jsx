import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); 

    try {
      const response = await api.post('/api/auth/login', { email, password });
      setUser(response.data.user); 
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink text-center">Login</h1>

      <form onSubmit={handleSubmit} className="mt-8 border border-line rounded-lg p-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full border border-line rounded-md px-3 py-2 text-sm"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full border border-line rounded-md px-3 py-2 text-sm mt-3"
        />

        {error && <p className="text-danger text-sm mt-3">{error}</p>}

        <button
          type="submit"
          className="w-full px-5 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-dark mt-4"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;