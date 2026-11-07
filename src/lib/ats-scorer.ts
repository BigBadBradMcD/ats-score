const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","up","about","into","through","during","is","are","was","were",
  "be","been","being","have","has","had","do","does","did","will","would",
  "could","should","may","might","shall","can","need","dare","ought","used",
  "i","we","you","he","she","it","they","them","their","this","that","these",
  "those","what","which","who","whom","how","when","where","why","all","each",
  "every","both","few","more","most","other","some","such","no","nor","not",
  "only","own","same","so","than","too","very","just","because","as","until",
  "while","if","then","our","your","his","her","its","my","job","role","work",
  "experience","years","year","strong","excellent","ability","skills","skill",
  "knowledge","understanding","team","teams","company","business","position",
  "required","preferred","plus","bonus","including","opportunity",
  "looking","seeking","candidate","candidates","join","us","help","make","well",
  "also","new","ensure","across","within","between","following","key","must",
  "highly","proven","demonstrated","responsible","responsibilities",
]);

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s+#.]/g, " ").replace(/\s+/g, " ").trim();
}

function extractKeywords(text: string): string[] {
  const words = normalise(text).split(" ").filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const tokens: string[] = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]} ${words[i + 1]}`);
  }
  for (let i = 0; i < words.length - 2; i++) {
    tokens.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return tokens;
}

function tokenWeight(token: string): number {
  const words = token.split(" ").length;
  return words === 3 ? 3 : words === 2 ? 2 : 1;
}

const EXPECTED_SECTIONS = [
  { pattern: /\b(experience|work history|employment|professional experience)\b/i, name: "Work Experience", weight: 3 },
  { pattern: /\b(education|degree|bachelor|master|phd|university|college)\b/i, name: "Education", weight: 2 },
  { pattern: /\b(skills|technical skills|core competencies|proficiencies)\b/i, name: "Skills", weight: 2 },
  { pattern: /\b(summary|objective|professional summary|profile)\b/i, name: "Summary/Objective", weight: 1 },
  { pattern: /\b(certifications?|licenses?|credentials?)\b/i, name: "Certifications", weight: 1 },
];

export interface SectionCheck {
  name: string;
  found: boolean;
  weight: number;
}

export interface Suggestion {
  category: "keywords" | "formatting" | "sections" | "content";
  severity: "high" | "medium" | "low";
  text: string;
}

export interface ScoreResult {
  score: number;
  keywordScore: number;
  formattingScore: number;
  sectionScore: number;
  contentScore: number;
  foundKeywords: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  sections: SectionCheck[];
  quantifiedAchievements: number;
  totalKeywordsChecked: number;
  suggestions: Suggestion[];
  wordCount: number;
  bulletCount: number;
}

export function scoreResume(resume: string, jobDescription: string): ScoreResult {
  if (!resume.trim() || !jobDescription.trim()) {
    return {
      score: 0, keywordScore: 0, formattingScore: 0, sectionScore: 0, contentScore: 0,
      foundKeywords: [], missingKeywords: [], formattingIssues: [], sections: [],
      quantifiedAchievements: 0, totalKeywordsChecked: 0, suggestions: [],
      wordCount: 0, bulletCount: 0,
    };
  }

  const resumeNorm = normalise(resume);
  const jdTokens = extractKeywords(jobDescription);
  const suggestions: Suggestion[] = [];

  // --- Keyword matching (0-45 points) ---
  const seen = new Set<string>();
  const uniqueJdTokens: string[] = [];
  for (const t of jdTokens.sort((a, b) => b.split(" ").length - a.split(" ").length)) {
    const base = t.split(" ")[0];
    if (!seen.has(base)) {
      seen.add(base);
      uniqueJdTokens.push(t);
    }
  }
  const topTokens = uniqueJdTokens.slice(0, 40);

  const found: string[] = [];
  const missing: string[] = [];
  let totalWeight = 0;
  let foundWeight = 0;

  for (const token of topTokens) {
    const w = tokenWeight(token);
    totalWeight += w;
    if (resumeNorm.includes(token)) {
      found.push(token);
      foundWeight += w;
    } else {
      missing.push(token);
    }
  }
  const keywordScore = totalWeight > 0 ? Math.round((foundWeight / totalWeight) * 45) : 0;

  if (missing.length > 0) {
    const topMissing = missing.slice(0, 5).map(k => `"${k}"`).join(", ");
    suggestions.push({
      category: "keywords",
      severity: missing.length > 10 ? "high" : "medium",
      text: `Add missing keywords where they honestly reflect your experience: ${topMissing}${missing.length > 5 ? ` and ${missing.length - 5} more` : ""}.`,
    });
  }

  // --- Section completeness (0-20 points) ---
  const sections: SectionCheck[] = EXPECTED_SECTIONS.map(s => ({
    name: s.name,
    found: s.pattern.test(resume),
    weight: s.weight,
  }));

  let sectionWeightTotal = 0;
  let sectionWeightFound = 0;
  for (const s of sections) {
    sectionWeightTotal += s.weight;
    if (s.found) sectionWeightFound += s.weight;
  }
  const sectionScore = sectionWeightTotal > 0 ? Math.round((sectionWeightFound / sectionWeightTotal) * 20) : 0;

  const missingSections = sections.filter(s => !s.found);
  for (const s of missingSections) {
    suggestions.push({
      category: "sections",
      severity: s.weight >= 2 ? "high" : "medium",
      text: `Add a "${s.name}" section. ATS systems look for standard resume sections.`,
    });
  }

  // --- Formatting (0-20 points) ---
  const formattingIssues: string[] = [];

  if (/\.(png|jpg|jpeg|gif|svg|bmp)/i.test(resume)) {
    formattingIssues.push("Image references detected — ATS cannot parse images");
  }
  if ((resume.match(/\|/g) || []).length > 5) {
    formattingIssues.push("Table formatting detected — ATS systems often skip tabular content");
  }
  if (resume.length > 100 && !/[.!?]\s/m.test(resume)) {
    formattingIssues.push("No sentence-ending punctuation detected — text may be garbled from copy-paste");
  }

  const lines = resume.split(/\n/).filter(l => l.trim().length > 0);
  const longLines = lines.filter(l => l.trim().length > 200);
  if (longLines.length > 3) {
    formattingIssues.push("Several very long text blocks — break content into shorter bullet points");
  }

  const hasContactInfo = /\b[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}\b/i.test(resume) ||
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(resume);
  if (!hasContactInfo) {
    formattingIssues.push("No email address or phone number detected — include contact information");
  }

  const hasDatePatterns = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s*\d{4}\b/i.test(resume) ||
    /\b\d{1,2}\/\d{4}\b/.test(resume) ||
    /\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|19\d{2}|present|current)\b/i.test(resume);
  if (!hasDatePatterns) {
    formattingIssues.push("No employment dates detected — include dates for each position");
  }

  const formattingScore = Math.max(0, 20 - formattingIssues.length * 4);

  for (const issue of formattingIssues) {
    suggestions.push({
      category: "formatting",
      severity: issue.includes("contact") || issue.includes("dates") ? "high" : "medium",
      text: issue + ".",
    });
  }

  // --- Content quality (0-15 points) ---
  const wordCount = resume.split(/\s+/).filter(w => w.length > 0).length;
  const bulletCount = (resume.match(/^[\s]*[-•◦▪▸►*]\s/gm) || []).length;

  const quantMatches = resume.match(
    /\b\d+[\%x+]|\b\d+\s*(million|billion|thousand|k\b|%|percent|users|customers|revenue|mrr|arr|accounts|deals|projects|products|clients|employees|members)/gi
  ) || [];
  const quantifiedAchievements = quantMatches.length;

  let contentScore = 0;

  // Word count scoring (0-5): 300-800 is ideal
  if (wordCount >= 300 && wordCount <= 800) contentScore += 5;
  else if (wordCount >= 200 && wordCount <= 1200) contentScore += 3;
  else if (wordCount >= 100) contentScore += 1;

  // Bullet points (0-5): having bullets shows structure
  if (bulletCount >= 5) contentScore += 5;
  else if (bulletCount >= 2) contentScore += 3;
  else contentScore += 0;

  // Quantified achievements (0-5)
  if (quantifiedAchievements >= 4) contentScore += 5;
  else if (quantifiedAchievements >= 2) contentScore += 3;
  else if (quantifiedAchievements >= 1) contentScore += 1;

  if (quantifiedAchievements === 0) {
    suggestions.push({
      category: "content",
      severity: "high",
      text: 'Add measurable results (e.g. "increased revenue by 30%", "managed team of 5"). Resumes with metrics stand out to hiring managers.',
    });
  } else if (quantifiedAchievements < 3) {
    suggestions.push({
      category: "content",
      severity: "medium",
      text: `You have ${quantifiedAchievements} quantified result${quantifiedAchievements > 1 ? "s" : ""}. Try to add more measurable achievements to strengthen your resume.`,
    });
  }

  if (wordCount < 200) {
    suggestions.push({
      category: "content",
      severity: "high",
      text: "Your resume appears very short. A well-rounded resume typically has 300-800 words.",
    });
  } else if (wordCount > 1200) {
    suggestions.push({
      category: "content",
      severity: "low",
      text: "Your resume is quite long. Consider trimming to the most relevant experience for this role.",
    });
  }

  if (bulletCount < 2) {
    suggestions.push({
      category: "content",
      severity: "medium",
      text: "Use bullet points to list your achievements and responsibilities. ATS systems parse bullets reliably.",
    });
  }

  // Action verbs check
  const actionVerbs = /\b(led|managed|developed|created|implemented|designed|built|launched|increased|reduced|improved|delivered|achieved|negotiated|established|streamlined|optimized|analyzed|coordinated|directed)\b/i;
  if (!actionVerbs.test(resume)) {
    suggestions.push({
      category: "content",
      severity: "medium",
      text: 'Start bullet points with strong action verbs (e.g. "Led", "Developed", "Increased", "Delivered").',
    });
  }

  // Sort suggestions: high first
  const severityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const rawScore = keywordScore + formattingScore + sectionScore + contentScore;
  const score = Math.min(100, Math.max(1, rawScore));

  return {
    score,
    keywordScore,
    formattingScore,
    sectionScore,
    contentScore,
    foundKeywords: found.slice(0, 15),
    missingKeywords: missing.slice(0, 20),
    formattingIssues,
    sections,
    quantifiedAchievements,
    totalKeywordsChecked: topTokens.length,
    suggestions,
    wordCount,
    bulletCount,
  };
}
