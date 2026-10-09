import { Link, Navigate } from "react-router-dom";
import "./Landing.css";

const marquee = ["SECURE TRACKING", "SMART BUDGETS", "CLEAR INSIGHTS", "EASY CONTROL"];
const bars = [40, 65, 30, 90, 55, 25, 45];
const days = ["M", "T", "W", "T", "F", "S", "S"];

const features = [
  { title: "Income & Expenses", text: "Add, edit and delete transactions with categories, dates and notes." },
  { title: "Visual Insights", text: "Spending by category and monthly income vs expense charts." },
  { title: "Private by Design", text: "Every account sees only its own data, protected by JWT login." },
];

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function Landing() {
  const user = getUser();
  if (user?.token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-logo">FinTrack</div>
        <nav className="lp-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </nav>
        <Link to="/login" className="lp-btn lp-btn-dark">Login / Sign Up</Link>
      </header>

      <section className="lp-hero" id="home">
        <div className="lp-hero-text">
          <span className="lp-pill">Free personal finance tracker</span>
          <h1>
            TRACK EVERY <span>RUPEE.</span>
          </h1>
          <p>Take control of your money with clarity, not complexity.</p>
          <div className="lp-cta">
            <Link to="/register" className="lp-btn lp-btn-primary">Get Started</Link>
            <Link to="/login" className="lp-btn lp-btn-ghost">Login</Link>
          </div>
          <div className="lp-tags">
            <span>#SecureSpending</span>
            <span>#SmartBudgets</span>
            <span>#MoneyMadeSimple</span>
          </div>
        </div>

        <div className="lp-phone" aria-hidden="true">
          <div className="lp-phone-top">
            <span>9:41</span>
            <span className="lp-dot" />
          </div>
          <div className="lp-card">
            <small>Sample balance</small>
            <strong>Rs 46,500</strong>
            <div className="lp-bars">
              {bars.map((h, i) => (
                <div key={i} className="lp-bar-col">
                  <div className={`lp-bar ${i === 3 ? "active" : ""}`} style={{ height: `${h}%` }} />
                  <span>{days[i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-recent">
            <div className="lp-recent-head">Recent transactions</div>
            <div className="lp-row"><span>Salary</span><b className="up">+Rs 50,000</b></div>
            <div className="lp-row"><span>Groceries</span><b className="down">-Rs 3,500</b></div>
          </div>
        </div>
      </section>

      <div className="lp-marquee">
        <div className="lp-marquee-track">
          {[...marquee, ...marquee, ...marquee, ...marquee].map((m, i) => (
            <span key={i}>{m} <i>✱</i></span>
          ))}
        </div>
      </div>

      <section className="lp-section" id="features">
        <h2>Everything you need</h2>
        <div className="lp-grid">
          {features.map((f) => (
            <div key={f.title} className="lp-feature">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section" id="how">
        <h2>How it works</h2>
        <div className="lp-grid">
          <div className="lp-feature"><b className="lp-step">1</b><h3>Create account</h3><p>Sign up in seconds.</p></div>
          <div className="lp-feature"><b className="lp-step">2</b><h3>Add transactions</h3><p>Log income and expenses.</p></div>
          <div className="lp-feature"><b className="lp-step">3</b><h3>See the picture</h3><p>Charts show where money goes.</p></div>
        </div>
        <Link to="/register" className="lp-btn lp-btn-primary lp-center">Start tracking for free</Link>
      </section>

      <footer className="lp-footer">© {new Date().getFullYear()} FinTrack. Built with React, Node, Express and MongoDB.</footer>
    </div>
  );
}