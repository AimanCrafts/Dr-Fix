import { Link } from "react-router-dom";
import Header from "./header.jsx";
import Footer from "./footer.jsx";
import "../css/legal.css";

/**
 * LegalPage (component/jsx/legal-page.jsx)
 * Shared layout for the Terms of Service and Privacy Policy pages.
 *   sections: [{ heading, paragraphs?: string[], bullets?: string[] }]
 */
function LegalPage({ title, updated, intro, sections, otherLink }) {
  return (
    <div className="lg-page">
      <Header variant="app" />

      <main className="lg-main">
        <header className="lg-hero">
          <h1>{title}</h1>
          <p className="lg-hero__updated">Last updated: {updated}</p>
          {intro && <p className="lg-hero__intro">{intro}</p>}
        </header>

        <nav className="lg-toc" aria-label="On this page">
          {sections.map((section, index) => (
            <a key={section.heading} href={`#section-${index + 1}`}>
              {index + 1}. {section.heading}
            </a>
          ))}
        </nav>

        <div className="lg-body">
          {sections.map((section, index) => (
            <section
              key={section.heading}
              id={`section-${index + 1}`}
              className="lg-section"
            >
              <h2>
                {index + 1}. {section.heading}
              </h2>

              {section.paragraphs?.map((text) => (
                <p key={text}>{text}</p>
              ))}

              {section.bullets && (
                <ul>
                  {section.bullets.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="lg-also">
          Also see our <Link to={otherLink.to}>{otherLink.label}</Link>. Questions?{" "}
          <Link to="/contact">Contact us</Link>.
        </p>
      </main>

      <Footer />
    </div>
  );
}

export default LegalPage;
