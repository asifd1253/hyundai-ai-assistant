import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left branding section */}
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">H</div>

          <span className="auth-eyebrow">
            INTELLIGENT AUTOMOTIVE EXPERIENCE
          </span>

          <h1>
            Discover Hyundai.
            <br />
            Ask smarter.
          </h1>

          <p>
            Your AI-powered assistant for exploring Hyundai vehicles,
            understanding specifications, and comparing models.
          </p>

          <div className="auth-brand-footer">
            Powered by AI and vehicle documentation
          </div>
        </div>
      </section>

      {/* Right login section */}
      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <div className="auth-brand-logo">H</div>
            <span>Hyundai AI Assistant</span>
          </div>

          <span className="auth-form-eyebrow">WELCOME BACK</span>

          <h2>Sign in to your account</h2>

          <p className="auth-description">
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?
            <Link to="/register"> Create an account</Link>
          </p>

          <div className="auth-security-note">
            Secure authentication for your Hyundai AI workspace.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
