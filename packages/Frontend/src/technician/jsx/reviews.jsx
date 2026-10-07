import { useEffect, useState } from "react";
import { MessageSquareText, Star } from "lucide-react";
import Header from "../../component/jsx/header.jsx";
import { getTechnicianReviews } from "../api/reviews-api";
import "../css/reviews.css";

function Stars({ value, size = 16 }) {
  return (
    <span className="rv-stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? "is-on" : ""}
        />
      ))}
    </span>
  );
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function TechnicianReviews() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTechnicianReviews()
      .then(({ data: result }) => setData(result))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load your reviews."),
      );
  }, []);

  const maxCount = data ? Math.max(1, ...Object.values(data.distribution)) : 1;

  return (
    <div className="tech-page">
      <Header variant="technician" />

      <main className="tech-page__main rv-page">
        <h1>Reviews</h1>
        <p className="rv-intro">What customers said about your work.</p>

        {error && <div className="tech-message">{error}</div>}

        {!data && !error && (
          <div className="tech-empty">
            <p>Loading reviews...</p>
          </div>
        )}

        {data && data.count === 0 && (
          <div className="rv-empty">
            <MessageSquareText size={28} />
            <h2>No reviews yet</h2>
            <p>
              After a customer rates a completed job, their review will show up
              here.
            </p>
          </div>
        )}

        {data && data.count > 0 && (
          <>
            <section className="rv-summary">
              <div className="rv-summary__score">
                <strong>{data.average.toFixed(1)}</strong>
                <Stars value={data.average} size={20} />
                <span>
                  {data.count} {data.count === 1 ? "review" : "reviews"}
                </span>
              </div>

              <div className="rv-summary__bars">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div className="rv-bar" key={stars}>
                    <span>{stars} star</span>
                    <div className="rv-bar__track">
                      <div
                        className="rv-bar__fill"
                        style={{
                          width: `${(data.distribution[stars] / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span>{data.distribution[stars]}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rv-list">
              {data.items.map((item) => (
                <article className="rv-card" key={item.id}>
                  <div className="rv-card__top">
                    <div>
                      <strong>{item.reviewer_name}</strong>
                      <span>
                        {item.service_name ? `${item.service_name} · ` : ""}
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <Stars value={item.rating} />
                  </div>
                  {item.review ? (
                    <p>{item.review}</p>
                  ) : (
                    <p className="rv-card__none">No written comment.</p>
                  )}
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default TechnicianReviews;
