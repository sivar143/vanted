import { db, servicesTable } from "@workspace/db";
import { count } from "drizzle-orm";

const services = [
  {
    name: "Professional Logo Design",
    shortDescription: "Custom, eye-catching logo for your brand",
    description: "Get a professionally designed logo that represents your brand identity. Includes multiple concepts, unlimited revisions, and full ownership rights. Delivered in all formats (SVG, PNG, PDF).",
    price: 99.00,
    category: "Design",
    featured: true,
    available: true,
    deliveryTime: "3-5 business days",
    rating: 4.9,
    reviewCount: 248,
    imageUrl: null,
  },
  {
    name: "SEO Optimization Package",
    shortDescription: "Boost your website ranking on Google",
    description: "Comprehensive SEO audit and optimization for your website. Includes keyword research, on-page optimization, meta tags, backlink strategy, and monthly reporting to track your improvements.",
    price: 249.00,
    category: "Marketing",
    featured: true,
    available: true,
    deliveryTime: "7-10 business days",
    rating: 4.8,
    reviewCount: 193,
    imageUrl: null,
  },
  {
    name: "Social Media Management",
    shortDescription: "Full social media presence management",
    description: "We manage your social media accounts across all platforms. Includes content creation, scheduling, community management, and monthly analytics reports to grow your online presence.",
    price: 399.00,
    category: "Marketing",
    featured: false,
    available: true,
    deliveryTime: "Ongoing monthly",
    rating: 4.7,
    reviewCount: 156,
    imageUrl: null,
  },
  {
    name: "Website Development",
    shortDescription: "Modern, responsive website for your business",
    description: "Full-featured business website built with the latest technologies. Mobile responsive, fast-loading, SEO friendly, and easy to manage. Includes 1 year hosting and support.",
    price: 899.00,
    category: "Development",
    featured: true,
    available: true,
    deliveryTime: "14-21 business days",
    rating: 4.9,
    reviewCount: 312,
    imageUrl: null,
  },
  {
    name: "Content Writing & Copywriting",
    shortDescription: "Engaging content that converts visitors",
    description: "Professional content writing for websites, blogs, and marketing materials. SEO-optimized, compelling copy that engages your audience and drives conversions.",
    price: 79.00,
    category: "Content",
    featured: false,
    available: true,
    deliveryTime: "2-4 business days",
    rating: 4.6,
    reviewCount: 204,
    imageUrl: null,
  },
  {
    name: "Video Production & Editing",
    shortDescription: "Professional video content for your brand",
    description: "High-quality video production and editing services. Perfect for promotional videos, product demos, YouTube content, and social media reels. Includes scriptwriting assistance.",
    price: 349.00,
    category: "Video",
    featured: true,
    available: true,
    deliveryTime: "5-10 business days",
    rating: 4.8,
    reviewCount: 127,
    imageUrl: null,
  },
  {
    name: "Email Marketing Campaign",
    shortDescription: "Targeted email campaigns that convert",
    description: "Complete email marketing setup and campaign management. Includes list segmentation, template design, A/B testing, automation workflows, and performance analytics.",
    price: 199.00,
    category: "Marketing",
    featured: false,
    available: true,
    deliveryTime: "5-7 business days",
    rating: 4.5,
    reviewCount: 89,
    imageUrl: null,
  },
  {
    name: "UI/UX Design",
    shortDescription: "User-centered design for digital products",
    description: "End-to-end UI/UX design for web and mobile applications. Includes user research, wireframing, prototyping, and high-fidelity mockups. Delivered with a complete design system.",
    price: 599.00,
    category: "Design",
    featured: false,
    available: true,
    deliveryTime: "10-14 business days",
    rating: 4.9,
    reviewCount: 178,
    imageUrl: null,
  },
  {
    name: "Business Consulting",
    shortDescription: "Strategic advice to grow your business",
    description: "One-on-one business consulting sessions with industry experts. Covers market analysis, growth strategy, operational efficiency, and financial planning. 3-session package included.",
    price: 299.00,
    category: "Consulting",
    featured: false,
    available: true,
    deliveryTime: "Flexible scheduling",
    rating: 4.7,
    reviewCount: 63,
    imageUrl: null,
  },
  {
    name: "Mobile App Development",
    shortDescription: "Native iOS and Android app development",
    description: "Custom mobile application development for iOS and Android. Includes full design, development, testing, and App Store submission. Built with modern frameworks for best performance.",
    price: 1499.00,
    category: "Development",
    featured: true,
    available: true,
    deliveryTime: "30-45 business days",
    rating: 4.8,
    reviewCount: 97,
    imageUrl: null,
  },
  {
    name: "Brand Identity Package",
    shortDescription: "Complete brand identity from scratch",
    description: "Comprehensive brand identity creation including logo, color palette, typography, brand guidelines, business cards, and letterhead design. Everything you need to launch a new brand.",
    price: 449.00,
    category: "Design",
    featured: false,
    available: true,
    deliveryTime: "10-14 business days",
    rating: 4.8,
    reviewCount: 142,
    imageUrl: null,
  },
  {
    name: "Data Analytics Dashboard",
    shortDescription: "Insights and reporting for your business data",
    description: "Custom data analytics dashboard to visualize your business KPIs. Integrates with your existing data sources, provides real-time insights, automated reports, and predictive analytics.",
    price: 699.00,
    category: "Development",
    featured: false,
    available: true,
    deliveryTime: "14-20 business days",
    rating: 4.6,
    reviewCount: 54,
    imageUrl: null,
  },
];

async function seed() {
  const [existing] = await db.select({ count: count() }).from(servicesTable);
  if ((existing?.count ?? 0) > 0) {
    console.log(`Database already has ${existing?.count} services. Skipping seed.`);
    return;
  }

  console.log("Seeding services...");
  await db.insert(servicesTable).values(services);
  console.log(`✅ Seeded ${services.length} services successfully.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
