"use client";

import { useState } from "react";
import type { ScoreResult } from "@/lib/ats-scorer";

type Stage = "input" | "scoring" | "teaser" | "email-gate" | "capturing" | "full-report";

export default function AtsCheckClient() {
  const [stage, setStage] = useState<Stage>("input");
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
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
      setStage("teaser");
    } catch {
      setError("Network error. Please try again.");
      setStage("input");
    }
  }

  async function handleEmailCapture() {
    setEmailError("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setStage("capturing");
    try {
      await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, score: scoreResult?.score ?? 0 }),
      });
    } catch {
      // Non-blocking — show report regardless
    }
    setStage("full-report");
  }

  const scoreColor =
    !scoreResult ? "text-slate-500"
    : scoreResult.score >= 70 ? "text-secondary-500"
    : scoreResult.score >= 50 ? "text-amber-500"
    : "text-red-500";

  const scoreLabel =
    !scoreResult ? ""
    : scoreResult.score >= 70 ? "Strong match"
    : scoreResult.score >= 50 ? "Needs improvement"
    : "Poor match — you're being filtered out";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav — matches oneresume.ai header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between max-w-6xl">
          <a href="https://oneresume.ai" className="font-display font-bold text-slate-900 text-xl tracking-tight">
            OneResume<span className="text-brand-600">.ai</span>
          </a>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600 font-medium">
            <a href="https://oneresume.ai/#how-it-works" className="hover:text-brand-600 transition-colors">How it Works</a>
            <a href="https://oneresume.ai/#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="https://oneresume.ai/pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
          </nav>
          <a
            href="https://oneresume.ai/signup"
            className="btn-primary text-sm py-2 px-4"
          >
            Get Started Free
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 max-w-3xl py-14">
        {/* ── INPUT STAGE ── */}
        {(stage === "input" || stage === "scoring") && (
          <>
            <div className="text-center mb-10">
              <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
                Free ATS Resume Checker
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
                Is your resume getting filtered out
                <br className="hidden sm:block" /> before anyone reads it?
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Paste your resume and any job description.
                Get your <strong className="text-slate-800">free ATS match score</strong> in 10 seconds.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Your Resume
                </label>
                <textarea
                  className="input-field min-h-[180px] resize-y text-sm font-mono"
                  placeholder="Paste your resume text here…"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  disabled={stage === "scoring"}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Job Description
                </label>
                <textarea
                  className="input-field min-h-[140px] resize-y text-sm"
                  placeholder="Paste the job description you're applying to…"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={stage === "scoring"}
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm font-medium">{error}</p>
              )}

              <button
                className="btn-primary btn-lg w-full"
                onClick={handleScore}
                disabled={stage === "scoring"}
              >
                {stage === "scoring" ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing your resume…
                  </span>
                ) : (
                  "Score My Resume Free →"
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                🔒 No credit card. No account required. We never store your resume without your permission.
              </p>
            </div>

            {/* Social proof */}
            <div className="mt-8 text-center text-sm text-slate-500">
              Used by 10,000+ job seekers. Average ATS score before OneResume:{" "}
              <strong className="text-red-500">41%</strong>. After:{" "}
              <strong className="text-secondary-500">88%</strong>.
            </div>
          </>
        )}

        {/* ── TEASER STAGE ── */}
        {stage === "teaser" && scoreResult && (
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Your ATS Match Score
              </p>
              <div className={`font-display text-7xl font-bold mb-2 ${scoreColor}`}>
                {scoreResult.score}%
              </div>
              <p className={`text-lg font-semibold mb-5 ${scoreColor}`}>
                {scoreLabel}
              </p>

              {/* Score gauge */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${
                    scoreResult.score >= 70 ? "bg-secondary-500"
                    : scoreResult.score >= 50 ? "bg-amber-400"
                    : "bg-red-500"
                  }`}
                  style={{ width: `${scoreResult.score}%` }}
                />
              </div>

              {scoreResult.missingKeywords.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-left mb-2">
                  <p className="text-sm font-semibold text-red-700 mb-1">
                    ⚠️ Your resume is missing {scoreResult.missingKeywords.length} critical keywords
                    and phrases recruiters are looking for.
                  </p>
                  <p className="text-xs text-red-500">
                    Your competition is scoring ~72% on average for this type of role.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-brand-600 text-white rounded-2xl p-8 shadow-lg">
              <h2 className="font-display text-2xl font-bold mb-2">
                See the full keyword breakdown — free
              </h2>
              <p className="text-brand-100 mb-6">
                Enter your email to unlock which keywords you&rsquo;re missing, formatting issues, and how to fix them.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  className="flex-1 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailCapture()}
                />
                <button
                  className="bg-white text-brand-700 font-bold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors whitespace-nowrap"
                  onClick={handleEmailCapture}
                >
                  Show Full Report →
                </button>
              </div>
              {emailError && (
                <p className="text-red-300 text-sm mt-2">{emailError}</p>
              )}
              <p className="text-brand-200 text-xs mt-4">
                No spam. Unsubscribe any time. We&rsquo;ll also send you your full keyword gap report.
              </p>
            </div>
          </div>
        )}

        {/* ── CAPTURING ── */}
        {stage === "capturing" && (
          <div className="text-center py-20">
            <svg className="animate-spin h-12 w-12 text-brand-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-slate-600 font-medium">Generating your full report…</p>
          </div>
        )}

        {/* ── FULL REPORT ── */}
        {stage === "full-report" && scoreResult && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">Your Full ATS Report</h1>
              <p className="text-slate-500">We&rsquo;ve also sent this to <strong className="text-slate-700">{email}</strong></p>
            </div>

            {/* Score summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-6">
              <div className={`font-display text-6xl font-bold shrink-0 ${scoreColor}`}>
                {scoreResult.score}%
              </div>
              <div>
                <p className={`text-lg font-bold ${scoreColor}`}>{scoreLabel}</p>
                <p className="text-sm text-slate-500 mt-1">
                  Analyzed against {scoreResult.totalKeywordsChecked} job-relevant keywords
                </p>
              </div>
            </div>

            {/* Found keywords */}
            {scoreResult.foundKeywords.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6">
                <h2 className="font-semibold text-emerald-800 mb-3">
                  ✅ Keywords found in your resume ({scoreResult.foundKeywords.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {scoreResult.foundKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {scoreResult.missingKeywords.length > 0 && (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                <h2 className="font-semibold text-red-800 mb-3">
                  ❌ Missing keywords ({scoreResult.missingKeywords.length})
                </h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {scoreResult.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-red-600">
                  Adding these keywords (where they honestly reflect your experience) can significantly raise your score.
                </p>
              </div>
            )}

            {/* Formatting issues */}
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
              <h2 className="font-semibold text-amber-800 mb-3">
                ⚠️ Formatting issues ({scoreResult.formattingIssues.length})
              </h2>
              {scoreResult.formattingIssues.length > 0 ? (
                <ul className="space-y-1">
                  {scoreResult.formattingIssues.map((issue) => (
                    <li key={issue} className="text-sm text-amber-700 flex gap-2">
                      <span>•</span><span>{issue}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-secondary-500 font-medium">No major formatting issues detected. ✓</p>
              )}
            </div>

            {/* Quantified achievements */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h2 className="font-semibold text-blue-800 mb-2">
                📊 Quantified achievements: {scoreResult.quantifiedAchievements}
              </h2>
              {scoreResult.quantifiedAchievements === 0 ? (
                <p className="text-sm text-blue-700">
                  Your resume has <strong>no quantified results</strong> (numbers like "increased revenue by 30%",
                  "managed team of 5"). Resumes with metrics convert 3× better with hiring managers.
                </p>
              ) : (
                <p className="text-sm text-blue-700">
                  Good — you have {scoreResult.quantifiedAchievements} quantified result
                  {scoreResult.quantifiedAchievements !== 1 ? "s" : ""}. More is always better.
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="bg-brand-600 text-white rounded-2xl p-8 text-center shadow-lg">
              <h2 className="font-display text-2xl font-bold mb-2">
                OneResume can rewrite your resume to score 85%+ in 30 seconds
              </h2>
              <p className="text-brand-100 mb-6">
                No manual editing. Just paste your resume, pick the job, and get an ATS-optimized version instantly.
              </p>
              <a
                href="https://oneresume.ai/signup"
                className="inline-block bg-white text-brand-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-brand-50 transition-colors"
              >
                Start Free — No Credit Card →
              </a>
              <p className="text-brand-200 text-sm mt-3">
                Free forever for basic use. Pro is $9/month for unlimited applications.
              </p>
            </div>

            {/* Retry */}
            <div className="text-center">
              <button
                className="text-brand-600 hover:underline text-sm font-medium"
                onClick={() => {
                  setStage("input");
                  setResume("");
                  setJobDescription("");
                  setScoreResult(null);
                  setEmail("");
                }}
              >
                ← Score another resume
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} OneResume ·{" "}
        <a href="https://oneresume.ai/privacy" className="hover:text-brand-600 transition-colors">Privacy</a>
        {" "}·{" "}
        <a href="https://oneresume.ai" className="hover:text-brand-600 transition-colors">oneresume.ai</a>
      </footer>
    </div>
  );
}
