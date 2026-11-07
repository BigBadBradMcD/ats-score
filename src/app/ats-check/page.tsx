import type { Metadata } from "next";
import AtsCheckClient from "@/components/AtsCheckClient";

export const metadata: Metadata = {
  title: "Free ATS Resume Score Checker — Is Your Resume Getting Filtered? | OneResume",
  description:
    "Paste your resume and a job description. Get your ATS compatibility score with keyword match analysis, section completeness, formatting checks, and actionable improvement suggestions.",
};

export default function AtsCheckPage() {
  return <AtsCheckClient />;
}
