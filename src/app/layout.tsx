import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Free ATS Resume Score Checker | OneResume",
  description:
    "Check your resume's ATS compatibility score for free. Paste your resume and a job description to see keyword match, section completeness, and formatting analysis with improvement suggestions.",
  keywords: ["ATS resume checker", "resume score", "ATS score", "resume keyword checker", "applicant tracking system", "resume optimization", "free resume checker"],
  openGraph: {
    title: "Free ATS Resume Score Checker | OneResume",
    description:
      "Is your resume getting past ATS filters? Get a free ATS compatibility score with keyword analysis, section completeness, and improvement suggestions.",
    type: "website",
    siteName: "OneResume",
    url: "https://ats.oneresume.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ATS Resume Score Checker | OneResume",
    description: "Check your resume's ATS score for free. Keyword match, formatting, and section analysis with actionable improvement tips.",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://ats.oneresume.ai",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Free ATS Resume Score Checker",
      description: "Check your resume's ATS compatibility score for free. Analyzes keyword match, section completeness, formatting, and content quality.",
      url: "https://ats.oneresume.ai",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      creator: {
        "@type": "Organization",
        name: "OneResume",
        url: "https://oneresume.ai",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is an ATS (Applicant Tracking System)?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An ATS is software that employers use to manage job applications. It scans and filters resumes before a human ever reads them. If your resume doesn't match the job's keywords and formatting requirements, it may be automatically rejected.",
          },
        },
        {
          "@type": "Question",
          name: "Is this ATS resume checker free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, completely free. No account, no credit card required. We built this to help job seekers understand how ATS systems evaluate their resumes.",
          },
        },
        {
          "@type": "Question",
          name: "What ATS score should I aim for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A score of 70 or above indicates a strong match with the job description. Below 50, your resume is likely being filtered out by ATS systems. Focus on the specific improvement suggestions to raise your score.",
          },
        },
        {
          "@type": "Question",
          name: "Do you store my resume data?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Your resume text is processed in real time and never saved to any database. It's discarded as soon as your score is calculated.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "OneResume", item: "https://oneresume.ai" },
        { "@type": "ListItem", position: 2, name: "Free ATS Score Checker", item: "https://ats.oneresume.ai" },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
