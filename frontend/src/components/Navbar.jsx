import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">H</div>
          <span>Hyundai AI Assistant</span>
        </Link>

        <div className="navbar-actions">
          <div className="navbar-user">
            <div className="navbar-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div className="navbar-user-info">
              <span className="navbar-user-name">{user?.name}</span>
              <span className="navbar-user-role">{user?.role || "User"}</span>
            </div>
          </div>

          <button className="navbar-logout" onClick={handleLogout}>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
