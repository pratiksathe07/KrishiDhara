import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-earth-50">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌾</span>
          <span className="text-xl font-bold text-primary-700">KrishiDhara</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to={`/${role}/dashboard`} className="btn-primary !w-auto px-5 py-2.5 text-sm">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-outline !w-auto px-5 py-2.5 text-sm">Login</Link>
              <Link to="/register" className="btn-primary !w-auto px-5 py-2.5 text-sm">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          🌱 Connecting Agriculture, Digitally
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight text-balance">
          Empowering India&apos;s<br />
          <span className="text-primary-600">Agricultural Community</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          KrishiDhara connects farmers with agricultural labor and dealers — streamlining hiring, trading, and field management for rural India.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="btn-primary !w-auto px-8 py-3.5 text-base">
            Get Started — It&apos;s Free
          </Link>
          <Link to="/login" className="btn-outline !w-auto px-8 py-3.5 text-base">
            I have an account
          </Link>
        </div>
      </section>

      {/* Role cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: "👨‍🌾", role: "Farmer", desc: "Manage your land, crops, hire agricultural workers and connect with dealers." },
            { icon: "👷", role: "Labor", desc: "Find agricultural work near you. Showcase your skills and get hired by farmers." },
            { icon: "🏪", role: "Dealer", desc: "Connect with farmers to buy and sell agricultural produce and commodities." },
          ].map((card) => (
            <div key={card.role} className="card hover:shadow-card-hover transition-shadow duration-200">
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.role}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
