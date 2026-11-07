"use client";

import { useState } from "react";
import type { ScoreResult } from "@/lib/ats-scorer";

const SAMPLE_JOB = {
  title: "Senior Software Engineer",
  description: `Senior Software Engineer — Acme Corp

We're looking for a Senior Software Engineer to join our product team and help build scalable, user-facing features.

Requirements:
- 5+ years of professional software development experience
- Strong proficiency in TypeScript, React, and Node.js
- Experience with RESTful APIs and microservices architecture
- Proficiency with SQL databases (PostgreSQL preferred) and NoSQL (MongoDB, Redis)
- Experience with cloud platforms (AWS, GCP, or Azure)
- Familiarity with CI/CD pipelines, Docker, and Kubernetes
- Strong understanding of data structures, algorithms, and system design
- Experience with agile development methodologies

Nice to have:
- Experience with GraphQL
- Background in performance optimization and monitoring
- Contributions to open-source projects
- Experience leading or mentoring junior engineers

Responsibilities:
- Design and implement new features across the full stack
- Write clean, tested, production-ready code
- Collaborate with product managers and designers to ship user-facing improvements
- Participate in code reviews, architecture discussions, and on-call rotations
- Mentor junior team members and contribute to engineering culture`,
};

type Stage = "input" | "scoring" | "results";

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl sm:text-5xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400 font-medium">out of 100</span>
      </div>
    </div>
  );
}

function ScoreBreakdown({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-900 font-semibold">{score}/{max}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const classes = severity === "high"
    ? "bg-red-100 text-red-700"
    : severity === "medium"
    ? "bg-amber-100 text-amber-700"
    : "bg-blue-100 text-blue-700";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${classes}`}>
      {severity}
    </span>
  );
}

export default function AtsCheckClient() {
  const [stage, setStage] = useState<Stage>("input");
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [error, setError] = useState("");

  async function handleScore() {
    setError("");
    if (resume.trim().length < 50) {
      setError("Please paste your full resume text.");
      return;
    }
    if (jobDescription.trim().length < 30) {
      setError("Please paste a job description.");
      return;
    }
    setStage("scoring");
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });
      const data = await res.json() as ScoreResult & { error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStage("input");
        return;
      }
      setScoreResult(data);
      setStage("results");
    } catch {
      setError("Network error. Please try again.");
      setStage("input");
    }
  }

  function handleTrySample() {
    setJobDescription(SAMPLE_JOB.description);
  }

  async function handleEmailCapture() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    try {
      await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, score: scoreResult?.score ?? 0 }),
      });
    } catch {
      // Non-blocking
    }
    setEmailCaptured(true);
  }

  function handleReset() {
    setStage("input");
    setResume("");
    setJobDescription("");
    setScoreResult(null);
    setEmail("");
    setEmailCaptured(false);
    setError("");
  }

  const scoreLabel = !scoreResult ? ""
    : scoreResult.score >= 70 ? "Strong match"
    : scoreResult.score >= 50 ? "Needs improvement"
    : "Low match — likely filtered out";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between max-w-5xl">
          <a href="https://oneresume.ai" className="font-display font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
            OneResume<span className="text-brand-600">.ai</span>
          </a>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600 font-medium">
            <a href="https://oneresume.ai/#how-it-works" className="hover:text-brand-600 transition-colors">How it Works</a>
            <a href="https://oneresume.ai/pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
            <a href="https://oneresume.ai/blog" className="hover:text-brand-600 transition-colors">Blog</a>
          </nav>
          <a
            href="https://oneresume.ai/signup?utm_source=ats-checker&utm_medium=header"
            className="btn-primary text-sm py-2 px-4"
          >
            Get Started Free
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 max-w-3xl py-8 sm:py-14">
        {/* ── INPUT STAGE ── */}
        {(stage === "input" || stage === "scoring") && (
          <>
            <div className="text-center mb-8 sm:mb-10">
              <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 sm:mb-5 uppercase tracking-wide">
                Free ATS Resume Checker
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 leading-tight mb-3 sm:mb-4">
                Is your resume getting past
                <br className="hidden sm:block" /> the ATS filters?
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
                Paste your resume and a job description. Get a detailed ATS compatibility
                report in seconds — <strong className="text-slate-800">no signup required</strong>.
              </p>
            </div>

            {!jobDescription.trim() && (
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-700">
                    No job description handy?
                  </p>
                  <p className="text-xs text-brand-500 mt-0.5">
                    Try a sample &ldquo;{SAMPLE_JOB.title}&rdquo; posting to see how it works.
                  </p>
                </div>
                <button
                  onClick={handleTrySample}
                  className="shrink-0 bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Use Sample Job
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 space-y-5">
              {/* Honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <div>
                <label htmlFor="resume" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Your Resume
                </label>
                <textarea
                  id="resume"
                  className="input-field min-h-[160px] sm:min-h-[180px] resize-y text-sm font-mono"
                  placeholder="Paste your resume text here..."
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  disabled={stage === "scoring"}
                />
                {resume.trim().length > 0 && resume.trim().length < 50 && (
                  <p className="text-xs text-amber-500 mt-1">Keep going — paste your full resume for the best results.</p>
                )}
              </div>

              <div>
                <label htmlFor="jd" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Job Description
                </label>
                <textarea
                  id="jd"
                  className="input-field min-h-[120px] sm:min-h-[140px] resize-y text-sm"
                  placeholder="Paste the job description you're applying to..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={stage === "scoring"}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                className="btn-primary btn-lg w-full"
                onClick={handleScore}
                disabled={stage === "scoring"}
              >
                {stage === "scoring" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing your resume...
                  </span>
                ) : (
                  "Check My Resume Score"
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                Free, no account required. We never store your resume.
              </p>
            </div>
          </>
        )}

        {/* ── RESULTS STAGE ── */}
        {stage === "results" && scoreResult && (
          <div className="space-y-5 sm:space-y-6">
            <div className="text-center mb-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Your ATS Score Report</h1>
              <p className="text-slate-500 text-sm sm:text-base">Here&rsquo;s how your resume stacks up against this job description.</p>
            </div>

            {/* Score ring + label */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
              <ScoreRing score={scoreResult.score} />
              <p className="mt-3 text-lg font-bold text-slate-800">{scoreLabel}</p>
              <p className="text-sm text-slate-500 mt-1">
                {scoreResult.wordCount} words &middot; {scoreResult.bulletCount} bullet points &middot; {scoreResult.quantifiedAchievements} measurable results
              </p>
            </div>

            {/* Score breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
              <h2 className="font-semibold text-slate-800 text-sm">Score Breakdown</h2>
              <ScoreBreakdown label="Keyword Match" score={scoreResult.keywordScore} max={45} color="#3b82f6" />
              <ScoreBreakdown label="Section Completeness" score={scoreResult.sectionScore} max={20} color="#8b5cf6" />
              <ScoreBreakdown label="Formatting" score={scoreResult.formattingScore} max={20} color="#f59e0b" />
              <ScoreBreakdown label="Content Quality" score={scoreResult.contentScore} max={15} color="#10b981" />
            </div>

            {/* Improvement suggestions */}
            {scoreResult.suggestions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
                <h2 className="font-semibold text-slate-800 mb-4 text-sm">Improvement Suggestions</h2>
                <ul className="space-y-3">
                  {scoreResult.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <SeverityBadge severity={s.severity} />
                      <span className="text-slate-700 leading-relaxed">{s.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Found keywords */}
            {scoreResult.foundKeywords.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 sm:p-6">
                <h2 className="font-semibold text-emerald-800 mb-3 text-sm">
                  Keywords Found ({scoreResult.foundKeywords.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {scoreResult.foundKeywords.map((kw) => (
                    <span key={kw} className="bg-emerald-100 text-emerald-800 text-xs sm:text-sm px-2.5 py-1 rounded-full font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {scoreResult.missingKeywords.length > 0 && (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-5 sm:p-6">
                <h2 className="font-semibold text-red-800 mb-3 text-sm">
                  Missing Keywords ({scoreResult.missingKeywords.length})
                </h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {scoreResult.missingKeywords.map((kw) => (
                    <span key={kw} className="bg-red-100 text-red-800 text-xs sm:text-sm px-2.5 py-1 rounded-full font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-red-600">
                  Add these keywords where they honestly reflect your experience.
                </p>
              </div>
            )}

            {/* Section check */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h2 className="font-semibold text-slate-800 mb-3 text-sm">Resume Sections</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scoreResult.sections.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    {s.found ? (
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={s.found ? "text-slate-700" : "text-slate-500"}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-brand-600 text-white rounded-2xl p-6 sm:p-8 text-center shadow-lg">
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">
                {scoreResult.score >= 70
                  ? "Good score! OneResume can push it even higher."
                  : "OneResume can rewrite your resume to pass ATS filters"}
              </h2>
              <p className="text-brand-100 mb-5 text-sm sm:text-base">
                Paste your resume and a job description. Get an ATS-optimized version tailored to the role — in under 2 minutes.
              </p>
              <a
                href={`https://oneresume.ai/ats-resume-checker?utm_source=ats-checker&utm_medium=cta&score=${scoreResult.score}`}
                className="inline-block bg-white text-brand-700 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg hover:bg-brand-50 transition-colors"
              >
                Get a Tailored Resume — Free
              </a>
              <p className="text-brand-200 text-xs sm:text-sm mt-3">
                No credit card required. One free rewrite every month.
              </p>
            </div>

            {/* Email capture */}
            {!emailCaptured ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-center">
                <p className="text-sm font-semibold text-slate-700 mb-1">Want tips to improve your score?</p>
                <p className="text-xs text-slate-400 mb-3">We&rsquo;ll send improvement tips based on your results.</p>
                <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <input
                    type="email"
                    className="input-field text-sm"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailCapture()}
                  />
                  <button onClick={handleEmailCapture} className="btn-primary text-sm shrink-0">
                    Send Tips
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-secondary-500/10 rounded-2xl border border-secondary-500/20 p-4 text-center">
                <p className="text-sm font-semibold text-secondary-600">
                  Check your inbox for your improvement tips.
                </p>
              </div>
            )}

            {/* Retry */}
            <div className="text-center">
              <button
                className="text-brand-600 hover:underline text-sm font-medium"
                onClick={handleReset}
              >
                Score another resume
              </button>
            </div>
          </div>
        )}
      </main>

      {/* How it works / FAQ section for SEO */}
      {stage === "input" && (
        <section className="bg-white border-t border-slate-200 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8 sm:mb-10">
              How the ATS Resume Score Checker Works
            </h2>
            <div className="grid gap-6 sm:gap-8">
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Paste your resume and a job description</h3>
                  <p className="text-sm text-slate-500">Copy the text from your resume and the job posting you want to apply to.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Get your ATS compatibility score</h3>
                  <p className="text-sm text-slate-500">We analyze keyword match, section completeness, formatting, and content quality to produce a score from 0 to 100.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Follow the improvement suggestions</h3>
                  <p className="text-sm text-slate-500">Each report includes specific, actionable steps to improve your score — ranked by priority.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 sm:mt-14">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "What is an ATS (Applicant Tracking System)?",
                    a: "An ATS is software that employers use to manage job applications. It scans and filters resumes before a human ever reads them. If your resume doesn't match the job's keywords and formatting requirements, it may be automatically rejected.",
                  },
                  {
                    q: "Is this tool really free?",
                    a: "Yes, completely free. No account, no credit card, no limits on basic usage. We built this to help job seekers understand how ATS systems evaluate their resumes.",
                  },
                  {
                    q: "What score should I aim for?",
                    a: "A score of 70 or above indicates a strong match with the job description. Below 50, your resume is likely being filtered out by ATS systems. Focus on the specific improvement suggestions to raise your score.",
                  },
                  {
                    q: "Do you store my resume data?",
                    a: "No. Your resume text is processed in real time and never saved to any database. It's discarded as soon as your score is calculated.",
                  },
                  {
                    q: "How is this different from OneResume.ai?",
                    a: "This tool scores your existing resume. OneResume.ai goes further — it rewrites your resume to be tailored for a specific job, with AI that optimizes for both ATS compatibility and hiring manager appeal.",
                  },
                ].map((faq) => (
                  <details key={faq.q} className="group border border-slate-200 rounded-xl">
                    <summary className="flex items-center justify-between cursor-pointer p-4 sm:p-5 text-sm sm:text-base font-semibold text-slate-800 hover:text-brand-600 transition-colors">
                      {faq.q}
                      <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} OneResume &middot;{" "}
        <a href="https://oneresume.ai/privacy" className="hover:text-brand-600 transition-colors">Privacy</a>
        {" "}&middot;{" "}
        <a href="https://oneresume.ai" className="hover:text-brand-600 transition-colors">oneresume.ai</a>
      </footer>
    </div>
  );
}
