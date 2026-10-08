import LegalPage from "./legal-page.jsx";

const SECTIONS = [
  {
    heading: "What we collect",
    bullets: [
      "Account details: your name, email, phone number and a password (stored only in scrambled, hashed form).",
      "Addresses you save and the bookings you make: service, date, time, address, notes and status.",
      "Reviews and ratings you write.",
      "For technicians: service category, years of experience, work area and the NID document you upload for verification.",
      "Your login session, which is kept in your browser so you stay signed in.",
    ],
  },
  {
    heading: "How we use it",
    bullets: [
      "To run the service: create your account, match your booking with a technician, and show you its progress.",
      "To contact you: verification codes, and booking updates such as 'accepted' or 'completed'. You can switch booking-update emails off in Settings.",
      "To keep the platform safe: verifying technicians and preventing misuse.",
    ],
  },
  {
    heading: "Who can see it",
    bullets: [
      "When a technician accepts your booking, they can see your name, phone number, address and your notes for that job.",
      "You can see the accepted technician's name and phone number.",
      "A technician sees reviewers by first name and last initial only.",
      "Reviews shown publicly never include your full address or phone number.",
      "Technician NID documents are used by the Dr.-Fix team to verify applications.",
      "We do not sell your personal data.",
      "We use outside services to host the site and deliver emails; they handle data only to provide those services.",
    ],
  },
  {
    heading: "How we protect it",
    paragraphs: [
      "Passwords are hashed, access to account data requires you to be logged in, and each person can only see their own bookings and settings. We take reasonable steps to protect your data, but no online service can promise perfect security.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep your data while your account is active. If you deactivate your account, you can no longer log in and a technician's public profile is hidden, but booking records are kept for service history and accounting.",
    ],
  },
  {
    heading: "Your choices",
    bullets: [
      "Edit your name, email and phone on the Profile page, and manage addresses on the Addresses page.",
      "Turn booking-update emails on or off in Settings.",
      "Change your password or deactivate your account in Settings.",
      "To ask for a correction or to ask a question about your data, use the Contact page.",
    ],
  },
  {
    heading: "Children",
    paragraphs: [
      "Dr.-Fix is meant for adults. If you are under 18, please use it only with a parent or guardian.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "If we change what we collect or how we use it, we will update this page and its date.",
    ],
  },
];

function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="7 October 2026"
      intro="What information Dr.-Fix collects, why, and who can see it."
      sections={SECTIONS}
      otherLink={{ to: "/terms", label: "Terms of Service" }}
    />
  );
}

export default Privacy;
