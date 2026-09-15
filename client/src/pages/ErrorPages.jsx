import { Link } from "react-router-dom";

export const Unauthorized = () => (
  <div className="page-container">
    <div className="text-center max-w-sm">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-500 text-sm mb-6">You do not have permission to access this page.</p>
      <Link to="/" className="btn-primary !w-auto px-6">Go Home</Link>
    </div>
  </div>
);

export const NotFound = () => (
  <div className="page-container">
    <div className="text-center max-w-sm">
      <div className="text-6xl mb-4">🌿</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 text-sm mb-6">The page you are looking for doesn&apos;t exist.</p>
      <Link to="/" className="btn-primary !w-auto px-6">Go Home</Link>
    </div>
  </div>
);
