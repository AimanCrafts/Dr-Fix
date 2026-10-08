import LegalPage from "./legal-page.jsx";

const SECTIONS = [
  {
    heading: "Using Dr.-Fix",
    paragraphs: [
      "Dr.-Fix is an online platform that connects customers who need home repair and maintenance with independent technicians. We do not carry out the repair work ourselves.",
      "By creating an account or placing a booking you agree to these Terms and to our Privacy Policy.",
    ],
  },
  {
    heading: "Your account",
    bullets: [
      "Give accurate details (name, email, phone number) and keep them up to date.",
      "Keep your password private. You are responsible for what happens under your account.",
      "We may suspend an account that breaks these Terms or is used to cheat or harm the platform or other people.",
    ],
  },
  {
    heading: "Bookings and prices",
    paragraphs: [
      "Every service has a fixed price shown before you confirm. The price shown when you place a booking is the price for that booking; a later price change does not affect it.",
      "You choose a date within the next 30 days and one of the time windows (8-11 AM, 11 AM-2 PM, 2-5 PM, 5-8 PM). Same-day bookings need at least one hour of notice.",
      "A booking is a request. It is confirmed for you when a technician accepts it. If no technician accepts before the end of your chosen time window, the booking is cancelled automatically and we tell you.",
      "The listed price covers the service named. Any extra work or parts should be agreed with you before they start.",
    ],
  },
  {
    heading: "Cancelling a booking",
    paragraphs: [
      "You can cancel from My Bookings or the tracking page while a booking is pending or accepted, that is, before the technician starts work. There is currently no cancellation charge. If a technician had already accepted, we let them know.",
      "Once work has started it can no longer be cancelled in the app. Please contact us instead.",
    ],
  },
  {
    heading: "Payment",
    paragraphs: [
      "Payment is currently cash on service: you pay the technician directly after the job is completed. If we add online payment later, these Terms will be updated before it is offered.",
    ],
  },
  {
    heading: "For technicians",
    bullets: [
      "You apply with accurate details and an NID document for verification. Our team approves or rejects applications.",
      "Technicians are independent professionals, not employees of Dr.-Fix. You agree to do the work carefully and to arrive within the booked time window.",
      "Platform fee: Dr.-Fix keeps a percentage of each completed job. The percentage is shown on the technician sign-up page, and the amount you will earn is shown on every job request before you accept it.",
      "The fee is taken from the technician's earning. It is never added to the customer's price.",
      "If the percentage changes, it applies only to jobs you accept after the change, and you are notified.",
      "For cash jobs, the fee is settled with Dr.-Fix separately.",
      "We may suspend a technician account for serious or repeated misconduct.",
    ],
  },
  {
    heading: "Reviews",
    paragraphs: [
      "Customers can review a completed service. Reviews must be honest and respectful. We may remove reviews that are abusive, false or off-topic.",
    ],
  },
  {
    heading: "Acceptable use",
    bullets: [
      "Do not make false or joke bookings.",
      "Do not harass customers, technicians or our team.",
      "Do not try to access other people's accounts or data, or to disrupt the platform.",
    ],
  },
  {
    heading: "Deactivating your account",
    paragraphs: [
      "You can deactivate your account in Settings. It needs your password and is not possible while you have active bookings. Deactivation stops you from logging in and hides a technician's profile. Booking history is kept for our records.",
    ],
  },
  {
    heading: "Our responsibility",
    paragraphs: [
      "We work to keep the platform running and to approve technicians carefully, but technicians are independent and we cannot guarantee the result of any job. To the extent the law allows, Dr.-Fix is not liable for indirect losses or for the work done by technicians. Nothing here limits any right that cannot be limited under the law of Bangladesh.",
    ],
  },
  {
    heading: "Changes to these Terms",
    paragraphs: [
      "We may update these Terms. The date at the top shows the latest version. Continuing to use Dr.-Fix after a change means you accept it.",
    ],
  },
  {
    heading: "Governing law and contact",
    paragraphs: [
      "These Terms are governed by the laws of Bangladesh. If you have a question or a problem with a booking, please use the Contact page.",
    ],
  },
];

function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="7 October 2026"
      intro="The rules for using Dr.-Fix as a customer or a technician, in plain language."
      sections={SECTIONS}
      otherLink={{ to: "/privacy", label: "Privacy Policy" }}
    />
  );
}

export default Terms;
