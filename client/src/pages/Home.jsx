import heroImage from '../assets/hero.png';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="w-full">
      <div className="flex flex-col md:flex-row md:items-center">

        <div className="md:w-1/2 px-6 py-12 md:py-0 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-semibold text-ink leading-tight">
            Find your stay near AIIMS Raipur
          </h1>
          <p className="text-muted text-lg mt-4">
            Short-term rentals for patients and families, close to the hospital.
          </p>
          <Link
            to="/properties"
            className="inline-block mt-6 px-6 py-3 rounded-md bg-brand text-white font-medium hover:bg-brand-dark"
          >
            Browse properties
          </Link>
        </div>

        <div className="md:w-1/2">
          <img
            src={heroImage}
            alt=""
            className="w-full h-64 md:h-[520px] object-cover"
          />
        </div>

      </div>
    </section>
  );
}

export default Home;