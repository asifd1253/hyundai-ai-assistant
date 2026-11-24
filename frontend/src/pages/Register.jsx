import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
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
      await register(formData.name, formData.email, formData.password);

      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
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
            Your journey
            <br />
            starts here.
          </h1>

          <p>
            Create your account and explore Hyundai vehicles with an AI
            assistant powered by vehicle brochures.
          </p>

          <div className="auth-brand-footer">
            Powered by AI and vehicle documentation
          </div>
        </div>
      </section>

      {/* Right registration section */}
      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <div className="auth-brand-logo">H</div>
            <span>Hyundai AI Assistant</span>
          </div>

          <span className="auth-form-eyebrow">GET STARTED</span>

          <h2>Create your account</h2>

          <p className="auth-description">
            Enter your details to create your workspace.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="name">Full name</label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

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
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?
            <Link to="/login"> Sign in</Link>
          </p>

          <div className="auth-security-note">
            Secure authentication for your Hyundai AI workspace.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
