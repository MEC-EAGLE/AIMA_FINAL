import { Link } from 'react-router-dom';
import logo from '../logo.png';

/**
 * Landing page shown at the root route. It features a black and white
 * theme with a detailed navbar and a hero section describing the AIMA
 * community and its key features.
 */
export default function Home() {
  return (
    <>
      <nav className="navbar navbar-aima">
        <div className="container d-flex align-items-center">
          <Link to="/" className="navbar-brand mx-auto d-flex align-items-center">
            <img src={logo} alt="AIMA logo" className="me-2" />
            <span className="fw-bold">AIMA</span>
          </Link>
          <div className="ms-auto">
            <Link to="/register" className="btn btn-outline-primary me-2">
              Join now
            </Link>
            <Link to="/login" className="btn btn-primary">Sign in</Link>
          </div>
        </div>
      </nav>

      <header className="hero-aima py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <h1 className="display-5 fw-bold">AI.Made.In Africa</h1>
              <p className="lead">
                AIMA is an all-in-one, AI-driven hiring platform built for Africa's startups
                and scaleups. We help companies find and grow reliable local tech talent.
              </p>
              <p>
                African startups often lose skilled professionals to larger organisations.
                AIMA bridges this gap with intelligent tools and a continent-wide community.
              </p>
              <h5 className="mt-4">Features</h5>
              <ul className="list-unstyled">
                <li className="mb-2">&#8226; Candidate engagement and assessment</li>
                <li className="mb-2">&#8226; Skill upskilling</li>
                <li className="mb-2">&#8226; Customized evaluations</li>
                <li className="mb-2">&#8226; Peer networking</li>
                <li className="mb-2">&#8226; Pre-vetted talent pool</li>
              </ul>
              <Link to="/register" className="btn btn-primary btn-lg me-2">
                Join now
              </Link>
              <Link to="/login" className="btn btn-outline-primary btn-lg">
                Sign in
              </Link>
            </div>
            <div className="col-md-6 text-center">
              <img src={logo} alt="AIMA logo" className="img-fluid rounded" />
            </div>
          </div>
        </div>
      </header>

      <section className="info-aima py-5">
        <div className="container">
          <h2 className="text-center mb-4">Why AIMA?</h2>
          <p>
            Africa is the fastest-growing continent for software developers with startups raising
            over $4B in 2021. The digital economy could reach $712B by 2050 and hiring is growing
            at 800% year over year.
          </p>
          <p>
            AIMA provides a pan-African platform for startups to source, evaluate and upskill
            talent so they can compete globally.
          </p>
        </div>
      </section>

    </>
  );
}
