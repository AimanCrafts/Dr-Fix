import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";
import "../css/footer.css";
import facebook from "../../assets/icons/facebook.png";
import instagram from "../../assets/icons/instagram.png";
import x from "../../assets/icons/x.png";
import youtube from "../../assets/icons/youtube.png";

function Footer({ size = "full" }) {
  const year = new Date().getFullYear();
  const footerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const f = footerRef.current;
    const cv = canvasRef.current;
    if (!f || !cv) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let parts = [];
    let rings = [];
    let raf = 0;
    let last = 0;

    const fit = () => {
      const r = f.getBoundingClientRect();
      cv.width = r.width;
      cv.height = r.height;
    };
    fit();
    window.addEventListener("resize", fit);

    const pos = (e) => {
      const r = f.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };

    const ember = (x, y, burst) => {
      const a = Math.random() * 6.283;
      const v = burst
        ? 1.5 + Math.random() * 3.5
        : 0.3 + Math.random() * 0.9;
      parts.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - (burst ? 0 : 0.6),
        life: 1,
        s: 1.5 + Math.random() * 2.5,
      });
    };

    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = "lighter";

      rings = rings.filter((r) => r.life > 0);
      rings.forEach((r) => {
        r.rad += 4.5;
        r.life -= 0.018;
        ctx.strokeStyle = `rgba(255,110,50,${Math.max(0, r.life * 0.8)})`;
        ctx.lineWidth = 2 + r.life * 3;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.rad, 0, 6.283);
        ctx.stroke();
      });

      parts = parts.filter((p) => p.life > 0);
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= 0.017;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * 4);
        g.addColorStop(0, `rgba(255,150,80,${Math.max(0, p.life)})`);
        g.addColorStop(1, "rgba(241,90,36,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * 4, 0, 6.283);
        ctx.fill();
      });

      raf = parts.length || rings.length ? requestAnimationFrame(loop) : 0;
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const handlePointerMove = (e) => {
      const [x, y] = pos(e);
      f.style.setProperty("--mx", x + "px");
      f.style.setProperty("--my", y + "px");
      if (calm) return;
      const t = performance.now();
      if (t - last > 40) {
        last = t;
        ember(x, y, false);
        kick();
      }
    };

    const handlePointerLeave = () => f.classList.remove("is-lit");
    const handlePointerEnter = () => f.classList.add("is-lit");

    const handleClick = (e) => {
      if (calm || e.target.closest("a, button, input")) return;
      const [x, y] = pos(e);
      rings.push({ x, y, rad: 6, life: 1 }, { x, y, rad: 0, life: 0.75 });
      for (let i = 0; i < 26; i++) ember(x, y, true);
      kick();
    };

    f.addEventListener("pointermove", handlePointerMove);
    f.addEventListener("pointerleave", handlePointerLeave);
    f.addEventListener("pointerenter", handlePointerEnter);
    f.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", fit);
      f.removeEventListener("pointermove", handlePointerMove);
      f.removeEventListener("pointerleave", handlePointerLeave);
      f.removeEventListener("pointerenter", handlePointerEnter);
      f.removeEventListener("click", handleClick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (size === "thin") {
    return (
      <footer className="site-footer site-footer--thin">
        <p>© {year} Dr.-Fix. All rights reserved.</p>
      </footer>
    );
  }

  const linkColumns = [
    {
      title: "Quick Links",
      links: [
        ["Home", "/"],
        ["Services", "/services"],
        ["How It Works", "/how-it-works"],
        ["About Us", "/about"],
        ["Contact Us", "/contact"],
      ],
    },
    {
      title: "Company",
      links: [
        ["About Dr.-Fix", "/about-dr-fix"],
        ["Technician Login", "/technician/login"],
        ["Terms of Service", "/terms"],
        ["Privacy Policy", "/privacy"],
      ],
    },
    {
      title: "Customer",
      links: [
        ["My Bookings", "/my-bookings"],
        ["Account Settings", "/settings"],
        ["FAQ", "/faq"],
      ],
    },
  ];

  const socials = [
    ["Facebook", facebook, "https://www.facebook.com/drfix.bd"],
    ["Instagram", instagram, "https://www.instagram.com/drfix.bd"],
    ["X", x, "https://x.com/drfix_bd"],
    ["YouTube", youtube, "https://www.youtube.com/@DrFixBD"],
  ];

  return (
    <footer ref={footerRef} className="site-footer site-footer--full">
      <canvas ref={canvasRef} className="footer-fx" aria-hidden="true" />
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <div className="site-footer__logo-row">
            <span className="site-footer__logo-mark" aria-hidden="true">
              <Wrench size={18} strokeWidth={2.4} />
            </span>
            <span className="site-footer__wordmark">
              Dr.<b>-Fix</b>
            </span>
          </div>
          <p className="site-footer__tagline">
            Your home&apos;s doctor. We diagnose. We fix. You relax.
          </p>
          <div className="site-footer__socials">
            {socials.map(([label, icon, href]) => (
              <a
                key={label}
                href={href}
                className="social-icon"
                aria-label={label}
                target="_blank"
                rel="noreferrer"
              >
                <img src={icon} alt="" className="social-icon__image" />
              </a>
            ))}
          </div>
        </div>

        {linkColumns.map((column) => (
          <div className="site-footer__col" key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="site-footer__emergency">
          <p>Need urgent help?</p>
          <a href="tel:0961234567" className="btn btn--outline-footer">
            📞 Call Now
          </a>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {year} Dr.-Fix. All rights reserved.</p>
        <div className="site-footer__bottom-links">
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
