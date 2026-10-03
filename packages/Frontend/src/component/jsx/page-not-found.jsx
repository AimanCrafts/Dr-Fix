import React from "react";
import { Link } from "react-router-dom";
import Header from "../../component/jsx/header";
import Footer from "../../component/jsx/footer";
import "../css/page-not-found.css";

function PageNotFound() {
  return (
    <div className="df-simple-page">
      <Header variant="marketing" />
      <main className="df-empty-state">
        <div className="df-empty-state__content">
          <span className="df-empty-state__code">404</span>
          <h1>Oops!</h1>
          <p>This page is not created at this moment.</p>
          <Link to="/" className="df-empty-state__button">
            Back to home!
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PageNotFound;
