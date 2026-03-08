// FocusTube content script
// 1) Removes Shorts UI from YouTube surfaces.
// 2) Shows a "Reality Check" overlay on Shorts pages before allowing or redirecting.
// 3) Tracks watch time per category per day for analytics.

const FOCUSTUBE_ALLOW_KEY = "focustube_shorts_allowed";
let focustubeOverlayShown = false;

const ANALYTICS_STORAGE_KEY = "focusTubeAnalytics";

// Keyword-based categories for title classification
const CATEGORY_KEYWORDS = {
  productivity: ["productivity", "focus", "deep work", "time management", "habits", "planning", "efficiency", "study hacks", "to-do list", "task management", "get things done", "gtd", "routine planning", "calendar blocking"],
  education: ["lecture", "tutorial", "course", "lesson", "study", "learning", "explained", "guide", "class", "how to", "how-to", "exam prep", "revision", "crash course", "walkthrough"],
  programming: ["coding", "programming", "javascript", "python", "java", "c++", "php", "ruby", "go", "rust", "kotlin", "swift", "developer", "code", "script", "algorithm", "debugging"],
  technology: ["technology", "tech", "gadgets", "innovation", "software", "hardware", "computer", "device", "electronics", "cybersecurity", "blockchain", "internet", "network", "cloud", "iot"],
  ai: ["ai", "artificial intelligence", "machine learning", "neural network", "deep learning", "chatgpt", "gpt", "llm", "robotics", "automation", "data science", "nlp", "computer vision", "tensorflow", "pytorch"],
  science: ["science", "physics", "biology", "chemistry", "research", "experiment", "discovery", "quantum", "lab", "scientist", "theory", "hypothesis", "method", "analysis", "data"],
  space: ["space", "nasa", "astronaut", "rocket", "mars", "moon", "satellite", "galaxy", "cosmos", "universe", "exploration", "spacex", "star", "planet", "orbit"],
  finance: ["money", "investing", "investment", "stocks", "stock market", "crypto", "cryptocurrency", "finance", "trading", "economy", "business", "startup funding", "budgeting", "personal finance", "retirement", "savings", "side hustle", "income"],
  entrepreneurship: ["entrepreneur", "startup", "business", "founder", "venture", "pitch", "funding", "scale", "growth", "innovation", "ceo", "company", "market", "strategy", "leadership"],
  economics: ["economics", "economy", "market", "finance", "trade", "inflation", "recession", "gdp", "policy", "bank", "investment", "stock", "bond", "currency", "global"],
  health: ["health", "nutrition", "diet", "dieting", "workout", "exercise", "fitness", "bodybuilding", "health tips", "healthy", "weight loss", "lose weight", "cardio", "meal prep", "macro", "calories"],
  fitness: ["gym", "workout", "training", "bodybuilding", "exercise", "strength training", "cardio", "yoga", "pilates", "crossfit", "running", "cycling", "sports training", "flexibility", "endurance"],
  nutrition: ["nutrition", "diet", "meal", "food", "calories", "protein", "carbs", "fat", "vitamins", "minerals", "supplements", "healthy eating", "meal prep", "cooking", "recipe"],
  selfcare: ["morning routine", "night routine", "self care", "self-care", "meditation", "mindfulness", "mental health", "skincare", "skin care", "fitness routine", "wellness", "yoga", "journaling", "self love", "self-love", "relaxing", "anxiety relief", "stress relief"],
  psychology: ["psychology", "mind", "brain", "behavior", "therapy", "mental health", "cognitive", "emotion", "personality", "disorder", "counseling", "psychiatrist", "psychologist", "anxiety", "depression"],
  motivation: ["motivation", "motivational", "success", "discipline", "mindset", "goals", "achieve", "achievement", "self improvement", "self-improvement", "hard work", "inspiration", "inspiring", "grind", "no excuses", "mindset shift", "stay focused"],
  philosophy: ["philosophy", "think", "wisdom", "ethics", "metaphysics", "epistemology", "logic", "stoicism", "existentialism", "life", "meaning", "consciousness", "reality", "truth", "knowledge"],
  history: ["history", "historical", "ancient", "civilization", "war", "battle", "empire", "king", "queen", "revolution", "timeline", "archaeology", "artifact", "past", "heritage"],
  politics: ["election", "government", "debate", "policy", "president", "minister", "politics", "democracy", "parliament", "campaign", "congress", "senate", "prime minister"],
  geopolitics: ["geopolitics", "international", "foreign policy", "diplomacy", "alliance", "conflict", "global", "world order", "superpower", "nato", "united nations", "treaty", "sanctions", "border"],
  news: ["news", "breaking", "breaking news", "update", "live", "report", "headlines", "latest", "coverage", "press conference", "reporter", "world news"],
  documentary: ["documentary", "doc", "investigation", "expose", "true story", "biography", "profile", "behind the scenes", "real life", "factual", "non-fiction", "historical documentary", "nature documentary"],
  gaming: ["gameplay", "gaming", "stream", "streaming", "minecraft", "valorant", "fortnite", "speedrun", "walkthrough", "let's play", "lets play", "live stream", "ps5", "xbox", "nintendo", "esports", "ranked"],
  sports: ["sports", "football", "soccer", "basketball", "baseball", "tennis", "golf", "olympics", "championship", "league", "tournament", "athlete", "coach", "training", "match"],
  music: ["music", "song", "album", "artist", "band", "concert", "live music", "playlist", "genre", "rock", "pop", "hip hop", "jazz", "classical", "electronic"],
  movies: ["movie", "film", "cinema", "hollywood", "director", "actor", "actress", "trailer", "review", "blockbuster", "indie", "drama", "comedy", "action", "thriller"],
  entertainment: ["funny", "comedy", "meme", "memes", "prank", "reaction", "sketch", "standup", "stand-up", "roast", "fails", "fail", "viral", "challenge", "trolling", "vlog", "vlogger", "dance", "parody", "bloopers"],
  comedy: ["comedy", "funny", "humor", "joke", "standup", "sketch", "parody", "satire", "laugh", "hilarious", "comedian", "roast", "prank", "meme", "viral"],
  lifestyle: ["lifestyle", "daily life", "routine", "home", "family", "friends", "social", "community", "culture", "trend", "modern", "urban", "suburban", "rural"],
  travel: ["travel", "trip", "tour", "destination", "explore", "vacation", "travel vlog", "adventure", "journey", "wanderlust", "backpacking", "road trip", "flight", "hotel"],
  food: ["food", "cooking", "recipe", "chef", "cuisine", "restaurant", "dining", "meal", "eat", "taste", "flavor", "ingredient", "kitchen", "baking", "grilling"],
  fashion: ["fashion", "style", "clothing", "outfit", "designer", "runway", "trend", "model", "beauty", "makeup", "hair", "accessories", "brand", "luxury"],
  automotive: ["car", "automotive", "vehicle", "auto", "truck", "motorcycle", "engine", "driving", "road", "speed", "race", "tuning", "maintenance", "electric car", "hybrid"],
  design: ["design", "graphic design", "ui", "ux", "interface", "layout", "typography", "color", "creative", "artwork", "logo", "branding", "visual", "aesthetic"],
  art: ["art", "artist", "painting", "drawing", "sculpture", "gallery", "museum", "creative", "expression", "canvas", "brush", "sketch", "masterpiece", "exhibition"],
  photography: ["photography", "photo", "camera", "lens", "shoot", "portrait", "landscape", "editing", "light", "composition", "photographer", "dslr", "film", "digital"],
  spirituality: ["spirituality", "spiritual", "meditation", "mindfulness", "yoga", "zen", "buddhism", "enlightenment", "consciousness", "soul", "energy", "chakra", "karma", "prayer"],
  relationships: ["relationship", "love", "dating", "marriage", "couple", "romance", "communication", "trust", "commitment", "breakup", "friendship", "social", "connection"],
  parenting: ["parenting", "parent", "child", "kid", "baby", "family", "raising", "discipline", "education", "development", "toddler", "teen", "advice", "tips"],
  pets: ["pet", "dog", "cat", "animal", "puppy", "kitten", "vet", "training", "care", "breed", "rescue", "adoption", "cute", "funny", "wildlife"],
  nature: ["nature", "wildlife", "environment", "forest", "ocean", "mountain", "animal", "bird", "plant", "ecosystem", "conservation", "outdoor", "hiking", "camping"],
  other: []
};

// ===== Shared helpers for analytics =====

function analyticsGetTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Classify a video title into one of the categories above
function classifyTitle(title) {
  if (!title) return "other";
  const lower = title.toLowerCase();

  let bestCategory = "other";

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "other") continue;
    for (const keyword of keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return category; // first matching category wins
      }
    }
  }

  return bestCategory;
}

// Add `seconds` of watch time to today's analytics for the given category
function addWatchTimeToAnalytics(category, seconds) {
  if (!category || seconds <= 0) return;

  chrome.storage.local.get(ANALYTICS_STORAGE_KEY, (data) => {
    const analytics = data[ANALYTICS_STORAGE_KEY] || {};
    const today = analyticsGetTodayKey();
    const todayEntry = analytics[today] || {};

    const current =
      typeof todayEntry[category] === "number" ? todayEntry[category] : 0;

    todayEntry[category] = current + seconds;
    analytics[today] = todayEntry;

    chrome.storage.local.set({ [ANALYTICS_STORAGE_KEY]: analytics });
  });
}

// Detect if current page is a Shorts page
function isShortsPage() {
  return (
    location.hostname.includes("youtube.com") &&
    location.pathname.includes("/shorts")
  );
}

// Detect if current page is a watch page
function isWatchPage() {
  return (
    location.hostname.includes("youtube.com") &&
    location.pathname.startsWith("/watch")
  );
}

// ===== Shorts UI removal + overlay (existing functionality) =====

// Hide visible Shorts elements from the page
function hideShortsElements() {
  // Hide sidebar Shorts entry
  const guideEntries = document.querySelectorAll('ytd-guide-entry-renderer');
  guideEntries.forEach((entry) => {
    const link = entry.querySelector('a[href="/shorts/"]');
    if (link) {
      entry.style.display = 'none';
      entry.style.visibility = 'hidden';
      entry.style.height = '0';
      entry.style.overflow = 'hidden';
      entry.style.margin = '0';
      entry.style.padding = '0';
    }
  });

  // Hide mini sidebar Shorts entry
  const miniGuideEntries = document.querySelectorAll('ytd-mini-guide-entry-renderer');
  miniGuideEntries.forEach((entry) => {
    const link = entry.querySelector('a[href="/shorts/"]');
    if (link) {
      entry.style.display = 'none';
      entry.style.visibility = 'hidden';
      entry.style.height = '0';
      entry.style.overflow = 'hidden';
      entry.style.margin = '0';
      entry.style.padding = '0';
    }
  });

  // Hide other Shorts elements
  const otherSelectors = [
    "ytd-reel-shelf-renderer",
    "ytd-rich-section-renderer[is-shorts]",
    'a[href^="/shorts/"]:not(ytd-guide-entry-renderer a):not(ytd-mini-guide-entry-renderer a)'
  ];

  otherSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
    });
  });
}

// Create and show the Shorts blocker warning dialog
function createShortsBlockerDialog() {
  const dialog = document.createElement("div");
  dialog.id = "focustube-shorts-blocker";
  dialog.style.position = "fixed";
  dialog.style.inset = "0";
  dialog.style.zIndex = "999999";
  dialog.style.background = "rgba(15, 23, 42, 0.96)";
  dialog.style.display = "flex";
  dialog.style.alignItems = "center";
  dialog.style.justifyContent = "center";
  dialog.style.fontFamily =
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  const card = document.createElement("div");
  card.style.maxWidth = "420px";
  card.style.margin = "0 16px";
  card.style.padding = "24px 20px";
  card.style.borderRadius = "16px";
  card.style.background = "#020617";
  card.style.border = "2px solid #ef4444";
  card.style.boxShadow = "0 20px 60px rgba(239, 68, 68, 0.3)";
  card.style.color = "#e5e7eb";
  card.style.textAlign = "center";

  const icon = document.createElement("span");
  icon.textContent = "🛑";
  icon.style.fontSize = "48px";
  icon.style.marginBottom = "16px";
  icon.style.display = "block";

  const title = document.createElement("h2");
  title.textContent = "Shorts Blocked!";
  title.style.margin = "0 0 12px 0";
  title.style.fontSize = "20px";
  title.style.fontWeight = "700";
  title.style.color = "#fecaca";

  const message = document.createElement("p");
  message.textContent = "YouTube Shorts are blocked to help you focus.";
  message.style.margin = "0 0 8px 0";
  message.style.fontSize = "14px";
  message.style.color = "#d1d5db";

  const warning = document.createElement("p");
  warning.textContent = "This is a productivity protection feature.";
  warning.style.margin = "0 0 20px 0";
  message.style.fontSize = "13px";
  warning.style.color = "#9ca3af";

  const buttonsRow = document.createElement("div");
  buttonsRow.style.display = "flex";
  buttonsRow.style.gap = "12px";
  buttonsRow.style.marginTop = "16px";
  buttonsRow.style.flexDirection = "column";

  const dismissBtn = document.createElement("button");
  dismissBtn.textContent = "Life is short. Shorts make it shorter.";
  dismissBtn.style.padding = "12px 16px";
  dismissBtn.style.borderRadius = "8px";
  dismissBtn.style.border = "none";
  dismissBtn.style.background = "#ef4444";
  dismissBtn.style.color = "#ffffff";
  dismissBtn.style.fontSize = "14px";
  dismissBtn.style.fontWeight = "600";
  dismissBtn.style.cursor = "pointer";
  dismissBtn.style.width = "100%";
  dismissBtn.style.transition = "background 0.2s";

  dismissBtn.addEventListener("mouseover", () => {
    dismissBtn.style.background = "#dc2626";
  });

  dismissBtn.addEventListener("mouseout", () => {
    dismissBtn.style.background = "#ef4444";
  });

  dismissBtn.addEventListener("click", () => {
    dialog.remove();
  });

  const agreeBtn = document.createElement("button");
  agreeBtn.textContent = "Back to YouTube Home";
  agreeBtn.style.padding = "12px 16px";
  agreeBtn.style.borderRadius = "8px";
  agreeBtn.style.border = "1px solid #4b5563";
  agreeBtn.style.background = "transparent";
  agreeBtn.style.color = "#e5e7eb";
  agreeBtn.style.fontSize = "14px";
  agreeBtn.style.fontWeight = "600";
  agreeBtn.style.cursor = "pointer";
  agreeBtn.style.width = "100%";
  agreeBtn.style.transition = "border-color 0.2s, background 0.2s";

  agreeBtn.addEventListener("mouseover", () => {
    agreeBtn.style.background = "rgba(75, 85, 99, 0.2)";
    agreeBtn.style.borderColor = "#6b7280";
  });

  agreeBtn.addEventListener("mouseout", () => {
    agreeBtn.style.background = "transparent";
    agreeBtn.style.borderColor = "#4b5563";
  });

  agreeBtn.addEventListener("click", () => {
    dialog.remove();
  });

  buttonsRow.appendChild(dismissBtn);
  buttonsRow.appendChild(agreeBtn);

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(warning);
  card.appendChild(buttonsRow);

  dialog.appendChild(card);
  return dialog;
}

// Intercept clicks on Shorts links
function interceptShortsClicks() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href="/shorts/"]') || e.target.closest('ytd-guide-entry-renderer a') || e.target.closest('ytd-mini-guide-entry-renderer a');
    
    if (target) {
      const href = target.getAttribute('href') || '';
      if (href.includes('/shorts/') || target.closest('[aria-label*="Shorts"]') || target.querySelector('yt-formatted-string')?.textContent?.includes('Shorts')) {
        e.preventDefault();
        e.stopPropagation();
        
        // Show the warning dialog
        const existingDialog = document.getElementById('focustube-shorts-blocker');
        if (!existingDialog) {
          const dialog = createShortsBlockerDialog();
          document.body.appendChild(dialog);
        }
      }
    }
  }, true);
}

// Set up a MutationObserver to catch dynamically loaded Shorts
function observeDomForShorts() {
  if (!document.body) return;

  const observer = new MutationObserver((mutations) => {
    let needsCleanup = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        needsCleanup = true;
        break;
      }
    }

    if (needsCleanup) {
      hideShortsElements();
      showShortsOverlayIfNeeded();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Create and return the reality-check overlay element
function createShortsOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "focustube-shorts-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "999999";
  overlay.style.background = "rgba(15, 23, 42, 0.96)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.fontFamily =
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  const card = document.createElement("div");
  card.style.maxWidth = "420px";
  card.style.margin = "0 16px";
  card.style.padding = "20px 18px 16px";
  card.style.borderRadius = "14px";
  card.style.background = "#020617";
  card.style.border = "1px solid #1f2937";
  card.style.boxShadow = "0 18px 45px rgba(0, 0, 0, 0.6)";
  card.style.color = "#e5e7eb";
  card.style.textAlign = "left";

  const titleRow = document.createElement("div");
  titleRow.style.display = "flex";
  titleRow.style.alignItems = "center";
  titleRow.style.gap = "8px";
  titleRow.style.marginBottom = "8px";

  const icon = document.createElement("span");
  icon.textContent = "⚠";
  icon.style.fontSize = "18px";

  const title = document.createElement("h2");
  title.textContent = "FocusTube Intercepted This";
  title.style.margin = "0";
  title.style.fontSize = "16px";
  title.style.fontWeight = "600";

  titleRow.appendChild(icon);
  titleRow.appendChild(title);

  const message = document.createElement("p");
  message.textContent = "You were about to open YouTube Shorts.";
  message.style.margin = "4px 0 4px";
  message.style.fontSize = "13px";

  const sub = document.createElement("p");
  sub.textContent = "Average Shorts session ≈ 45 minutes.";
  sub.style.margin = "0 0 10px";
  sub.style.fontSize = "13px";
  sub.style.color = "#9ca3af";

  const question = document.createElement("p");
  question.textContent = "Do you want to continue?";
  question.style.margin = "0 0 12px";
  question.style.fontSize = "13px";

  const buttonsRow = document.createElement("div");
  buttonsRow.style.display = "flex";
  buttonsRow.style.gap = "8px";
  buttonsRow.style.marginTop = "6px";

  const returnBtn = document.createElement("button");
  returnBtn.textContent = "Return to YouTube Home";
  returnBtn.style.flex = "1";
  returnBtn.style.padding = "8px 10px";
  returnBtn.style.borderRadius = "999px";
  returnBtn.style.border = "none";
  returnBtn.style.background = "#22c55e";
  returnBtn.style.color = "#022c22";
  returnBtn.style.fontSize = "13px";
  returnBtn.style.fontWeight = "600";
  returnBtn.style.cursor = "pointer";

  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Continue to Shorts";
  continueBtn.style.flex = "1";
  continueBtn.style.padding = "8px 10px";
  continueBtn.style.borderRadius = "999px";
  continueBtn.style.border = "1px solid #4b5563";
  continueBtn.style.background = "transparent";
  continueBtn.style.color = "#e5e7eb";
  continueBtn.style.fontSize = "13px";
  continueBtn.style.fontWeight = "600";
  continueBtn.style.cursor = "pointer";

  // If user chooses to return, count this as a blocked Short and go home
  returnBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "shortsBlocked" }, () => {
      window.location.href = "https://www.youtube.com/";
    });
  });

  // If user chooses to continue, allow Shorts by removing the overlay
  // and remember this choice for this tab's session.
  continueBtn.addEventListener("click", () => {
    sessionStorage.setItem(FOCUSTUBE_ALLOW_KEY, "true");
    overlay.remove();
  });

  buttonsRow.appendChild(returnBtn);
  buttonsRow.appendChild(continueBtn);

  card.appendChild(titleRow);
  card.appendChild(message);
  card.appendChild(sub);
  card.appendChild(question);
  card.appendChild(buttonsRow);

  overlay.appendChild(card);
  return overlay;
}

// Show the overlay on Shorts pages, unless already allowed/handled
function showShortsOverlayIfNeeded() {
  if (!isShortsPage()) return;

  if (sessionStorage.getItem(FOCUSTUBE_ALLOW_KEY) === "true") return;
  if (focustubeOverlayShown) return;
  if (!document.body) return;

  focustubeOverlayShown = true;
  const overlay = createShortsOverlay();
  document.body.appendChild(overlay);
}

// ===== Watch-time tracking loop =====

// Simple interval-based tracking: every 5s, if on a visible watch page,
// classify the title and add 5 seconds to that category's total.
function startWatchTrackingLoop() {
  setInterval(() => {
    if (!isWatchPage()) return;
    if (document.visibilityState !== "visible") return;

    const title = document.title || "";
    const category = classifyTitle(title);

    // 5-second resolution
    addWatchTimeToAnalytics(category, 5);
  }, 5000);
}

// ===== Initialization =====

function initFocusTube() {
  hideShortsElements();
  showShortsOverlayIfNeeded();
  interceptShortsClicks();
  observeDomForShorts();
  startWatchTrackingLoop();

  setInterval(() => {
    hideShortsElements();
    showShortsOverlayIfNeeded();
  }, 5000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFocusTube);
} else {
  initFocusTube();
}

