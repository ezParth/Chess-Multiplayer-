import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-bold text-blue-500">
        404
      </h1>

      <h2 className="text-3xl font-semibold mt-4">
        Page Not Found
      </h2>

      <p className="text-slate-400 mt-2 text-center max-w-md">
        The page you're looking for doesn't exist
        or has been moved.
      </p>

      <div className="flex gap-4 mt-8">
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Go Home
        </Link>

        <Link
          to="/chess"
          className="px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-900 transition"
        >
          Play Chess
        </Link>
      </div>
    </div>
  );
}