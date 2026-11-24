import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard-container">
        {/* Welcome Section */}
        <section className="dashboard-welcome">
          <div>
            <span className="welcome-label">HYUNDAI AI PLATFORM</span>

            <h1>
              Welcome to your
              <br />
              Hyundai AI Assistant
            </h1>

            <p>
              Explore vehicle specifications, compare models, and get accurate
              answers powered by Hyundai brochures.
            </p>

            <Link to="/chat" className="welcome-button">
              Explore AI Assistant →
            </Link>
          </div>

          <div className="welcome-decoration">
            <div className="welcome-circle">
              <span>H</span>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Explore Your Workspace</h2>
              <p>Everything you need in one place.</p>
            </div>
          </div>

          <div className="dashboard-cards">
            {/* Brochures Card */}
            <article className="dashboard-card">
              <div className="card-icon brochure-icon">
                <span>PDF</span>
              </div>

              <h3>Vehicle Brochures</h3>

              <p>
                Upload, organize, and manage Hyundai vehicle brochures for
                intelligent document retrieval.
              </p>

              <Link to="/brochures" className="card-link">
                Manage Brochures →
              </Link>
            </article>

            {/* AI Assistant Card */}
            <article className="dashboard-card">
              <div className="card-icon assistant-icon">
                <span>AI</span>
              </div>

              <h3>AI Assistant</h3>

              <p>
                Ask questions about vehicle features, specifications, pricing,
                and comparisons.
              </p>

              <Link to="/chat" className="card-link">
                Start Conversation →
              </Link>
            </article>
          </div>
        </section>

        {/* Information Section */}
        <section className="dashboard-info">
          <div>
            <h3>Powered by Retrieval-Augmented Generation</h3>
            <p>
              Get answers grounded in your uploaded Hyundai vehicle brochures
              instead of relying only on general AI knowledge.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
