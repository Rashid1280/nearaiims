import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post('/api/auth/register', {
        name, email, password, phone,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink text-center">Register</h1>

      <form onSubmit={handleSubmit} className="mt-8 border border-line rounded-lg p-6 flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full border border-line rounded-md px-3 py-2 text-sm"
        />
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
          className="w-full border border-line rounded-md px-3 py-2 text-sm"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          required
          className="w-full border border-line rounded-md px-3 py-2 text-sm"
        />

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full px-5 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-dark mt-1"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;