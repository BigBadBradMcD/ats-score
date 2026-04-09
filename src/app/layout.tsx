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
  title: "Free ATS Resume Score | OneResume",
  description:
    "Paste your resume and job description. Get your free ATS match score in 10 seconds. See exactly which keywords you're missing.",
  openGraph: {
    title: "Free ATS Resume Score | OneResume",
    description:
      "Find out if your resume is getting filtered before anyone reads it. Free ATS score in 10 seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
