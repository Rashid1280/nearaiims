import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold text-ink">Page not found</h1>
      <p className="text-muted mt-3">
        The page you are looking for does not exist or has moved.
      </p>
      <div className="flex justify-center gap-3 mt-6">
        <Link
          to="/"
          className="px-5 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-dark"
        >
          Go home
        </Link>
        <Link
          to="/properties"
          className="px-5 py-2 rounded-md border border-line text-ink text-sm font-medium hover:bg-surface"
        >
          Browse properties
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
