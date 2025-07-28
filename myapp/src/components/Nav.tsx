import { Link } from 'react-router-dom';
import logo from '../logo.png';

export default function Nav() {
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
  };

  const current = localStorage.getItem('currentUser');
  const me = current ? JSON.parse(current) : null;

  return (
    <nav className="navbar navbar-expand-lg navbar-indeed">
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center"
          to={me && me.type === 'org' ? '/org-dashboard' : '/dashboard'}
        >
          <img src={logo} alt="logo" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className="nav-link"
                to={me && me.type === 'org' ? '/org-dashboard' : '/dashboard'}
              >
                Dashboard
              </Link>
            </li>
            {me && me.type === 'org' && (
              <li className="nav-item">
                <Link className="nav-link" to="/create">
                  Create
                </Link>
              </li>
            )}
            {me && me.type === 'org' && (
              <li className="nav-item">
                <Link className="nav-link" to="/create-assessment">
                  New Assessment
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/community">
                Community
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/jobs">
                Jobs
              </Link>
            </li>
            {me && me.type === 'member' && (
              <li className="nav-item">
                <Link className="nav-link" to="/assessment">
                  Assessment
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/calendar">
                Calendar
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/notes">
                Notes
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center" to="/settings">
                <i className="bi bi-gear-fill me-1"></i> Settings
              </Link>
            </li>
            {me && me.type === 'org' && (
              <li className="nav-item">
                <Link className="nav-link" to="/people-map">
                  People Map
                </Link>
              </li>
            )}
          </ul>
          <Link
            to="/login"
            className="btn btn-outline-secondary"
            onClick={handleLogout}
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}
