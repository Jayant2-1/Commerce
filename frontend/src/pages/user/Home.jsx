import { Link } from 'react-router-dom';
import { FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import Shop from './Shop';

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-image">
          <img
            src="/images/fashion-5.jpg"
            alt="A carefully curated selection of garments in a boutique"
          />
        </div>
        <div className="home-hero-content">
          <span className="home-hero-eyebrow">Autumn private edit</span>
          <h1 id="home-hero-title" className="home-hero-title">
            Luxury fashion<br />without restraint.
          </h1>
          <p className="home-hero-copy">
            Curated silhouettes, polished materials, and occasion-ready pieces selected for a quieter kind of statement.
          </p>
          <div className="home-hero-actions">
            <Link to="/shop" className="home-hero-button">
              <FiShoppingBag aria-hidden="true" />
              Shop collection
            </Link>
            <a href="#home-catalogue" className="home-hero-button">
              View catalogue
              <FiArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="home-catalogue" className="home-catalogue" aria-label="Product catalogue">
        <Shop />
      </section>
    </div>
  );
}
