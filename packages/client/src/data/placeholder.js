import {
  Zap,
  Droplet,
  Wind,
  Sparkles,
  Hammer,
  PaintRoller,
} from "lucide-react";

export const categories = [
  { icon: Zap, label: "Electrician" },
  { icon: Droplet, label: "Plumber" },
  { icon: Wind, label: "AC Technician" },
  { icon: Sparkles, label: "Cleaner" },
  { icon: Hammer, label: "Carpenter" },
  { icon: PaintRoller, label: "Painter" },
];

export const services = [
  {
    id: "SVC-104",
    name: "Home Deep Cleaning",
    category: "Cleaner",
    price: 500,
    eta: "45 min",
    rating: 4.8,
    description: "Full house deep cleaning, kitchen and bathroom included.",
  },
  {
    id: "SVC-211",
    name: "AC Repair & Gas Refill",
    category: "AC Technician",
    price: 800,
    eta: "30 min",
    rating: 4.9,
    description: "Diagnostics, gas refill, and general AC maintenance.",
  },
  {
    id: "SVC-330",
    name: "Pipe Leak & Fixture Fix",
    category: "Plumber",
    price: 600,
    eta: "40 min",
    rating: 4.7,
    description: "Leak repair, tap and fixture installation.",
  },
  {
    id: "SVC-418",
    name: "Full House Wiring Check",
    category: "Electrician",
    price: 700,
    eta: "35 min",
    rating: 4.8,
    description: "Complete electrical safety inspection and minor fixes.",
  },
  {
    id: "SVC-522",
    name: "Furniture Assembly",
    category: "Carpenter",
    price: 450,
    eta: "50 min",
    rating: 4.6,
    description: "Flat-pack and custom furniture assembly.",
  },
  {
    id: "SVC-607",
    name: "Interior Wall Painting",
    category: "Painter",
    price: 1200,
    eta: "2-4 hrs",
    rating: 4.7,
    description: "Interior wall prep, priming, and finish painting.",
  },
];

export const bookings = [
  {
    id: 1,
    service: "Electrical Repair",
    provider: "Mike Johnson",
    date: "2026-07-20",
    time: "10:30 AM",
    price: 700,
    status: "Completed",
  },
  {
    id: 2,
    service: "Plumbing Fix",
    provider: "Sarah Wilson",
    date: "2026-07-18",
    time: "3:00 PM",
    price: 600,
    status: "Pending",
  },
  {
    id: 3,
    service: "AC Maintenance",
    provider: "David Chen",
    date: "2026-07-15",
    time: "9:00 AM",
    price: 800,
    status: "Completed",
  },
  {
    id: 4,
    service: "Deep Cleaning",
    provider: "Fatima Noor",
    date: "2026-07-12",
    time: "1:00 PM",
    price: 500,
    status: "In Progress",
  },
  {
    id: 5,
    service: "Furniture Assembly",
    provider: "Tanvir Ahmed",
    date: "2026-07-09",
    time: "11:00 AM",
    price: 450,
    status: "Completed",
  },
  {
    id: 6,
    service: "Interior Wall Painting",
    provider: "Karim Uddin",
    date: "2026-07-05",
    time: "8:00 AM",
    price: 1200,
    status: "Completed",
  },
  {
    id: 7,
    service: "Wiring Safety Check",
    provider: "Mike Johnson",
    date: "2026-06-29",
    time: "4:30 PM",
    price: 700,
    status: "Cancelled",
  },
];

export const notifications = [
  {
    id: 1,
    title: "Booking confirmed",
    body: "Sarah Wilson accepted your Plumbing Fix request.",
    time: "2h ago",
    read: false,
  },
  {
    id: 2,
    title: "Technician dispatched",
    body: "David Chen is on the way for AC Maintenance.",
    time: "1d ago",
    read: false,
  },
  {
    id: 3,
    title: "Payment received",
    body: "Your payment for Electrical Repair was processed.",
    time: "3d ago",
    read: true,
  },
];

export const testimonials = [
  {
    quote:
      "The electrician arrived on time and fixed the wiring fault fast. Booking felt like ordering food.",
    name: "Rashid H.",
    job: "Wiring Repair",
  },
  {
    quote:
      "AC was blowing warm air for a week. Booked at 9pm, technician showed up next morning — fixed in 30 minutes.",
    name: "Samia K.",
    job: "AC Repair",
  },
  {
    quote:
      "Loved the live status tracker — could see exactly when the cleaner was dispatched and arriving.",
    name: "Nadia S.",
    job: "Deep Cleaning",
  },
];
