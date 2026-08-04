import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Properties from './pages/Properties.jsx';

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/properties">Properties</Link>
      </nav>
         
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
      </Routes>
    </div>
  );
}

export default App;