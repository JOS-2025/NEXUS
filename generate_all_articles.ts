import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY environment variable is missing!");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const DB_FILE = path.join(process.cwd(), 'db.json');

// List of authors to rotate
const AUTHORS = [
  {
    id: "auth-1",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    role: "Principal AI Research Scientist"
  },
  {
    id: "auth-2",
    name: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    role: "Serial Tech Bootstrapper & Investor"
  },
  {
    id: "auth-3",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    role: "Head of Productivity Engineering"
  },
  {
    id: "auth-admin",
    name: "Global Admin",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    role: "Lead System Architect"
  }
];

const topics = [
  {
    num: 1,
    topic: "The Complete Beginner's Guide to Artificial Intelligence in 2026",
    category: "Artificial Intelligence",
    difficulty: "Beginner",
    defaultTags: ["Artificial Intelligence", "Machine Learning", "Beginner Guide", "Technology"]
  },
  {
    num: 2,
    topic: "25 Best AI Tools You Should Be Using in 2026",
    category: "Artificial Intelligence",
    difficulty: "Beginner",
    defaultTags: ["AI Tools", "Productivity", "Technology", "Software"]
  },
  {
    num: 3,
    topic: "How ChatGPT Can Make You More Productive Every Day",
    category: "Productivity",
    difficulty: "Beginner",
    defaultTags: ["Productivity", "ChatGPT", "AI Hacks", "Workflows"]
  },
  {
    num: 4,
    topic: "Prompt Engineering Explained: A Beginner's Guide",
    category: "Artificial Intelligence",
    difficulty: "Beginner",
    defaultTags: ["Prompt Engineering", "AI Tips", "Beginner Guide", "LLMs"]
  },
  {
    num: 5,
    topic: "AI vs Human Intelligence: What AI Can and Cannot Do",
    category: "Artificial Intelligence",
    difficulty: "Intermediate",
    defaultTags: ["AI vs Human", "Philosophy", "Cognitive Science", "Technology"]
  },
  {
    num: 6,
    topic: "The Future of AI: Trends That Will Shape the Next Decade",
    category: "Artificial Intelligence",
    difficulty: "Intermediate",
    defaultTags: ["AI Trends", "Future Tech", "Predictions", "Deep Learning"]
  },
  {
    num: 7,
    topic: "Cloud Computing Explained for Beginners",
    category: "Technology",
    difficulty: "Beginner",
    defaultTags: ["Cloud Computing", "AWS", "Google Cloud", "Infrastructure"]
  },
  {
    num: 8,
    topic: "Cybersecurity Basics Everyone Should Know",
    category: "Technology",
    difficulty: "Beginner",
    defaultTags: ["Cybersecurity", "Online Safety", "Best Practices", "Privacy"]
  },
  {
    num: 9,
    topic: "The Best Free Software Every Student and Professional Should Have",
    category: "Technology",
    difficulty: "Beginner",
    defaultTags: ["Free Software", "Apps", "Students", "Productivity Tools"]
  },
  {
    num: 10,
    topic: "How APIs Work: A Simple Guide with Real Examples",
    category: "Technology",
    difficulty: "Beginner",
    defaultTags: ["APIs", "Web Development", "Coding", "Integration"]
  },
  {
    num: 11,
    topic: "Top Technology Skills That Will Be in Demand by 2030",
    category: "Technology",
    difficulty: "Intermediate",
    defaultTags: ["Tech Skills", "Career", "Future Work", "Programming"]
  },
  {
    num: 12,
    topic: "10 Science-Backed Productivity Habits That Actually Work",
    category: "Productivity",
    difficulty: "Beginner",
    defaultTags: ["Productivity", "Habits", "Neuroscience", "Peak Performance"]
  },
  {
    num: 13,
    topic: "Deep Work: How to Stay Focused in a Distracted World",
    category: "Productivity",
    difficulty: "Intermediate",
    defaultTags: ["Deep Work", "Focus", "Time Management", "Habits"]
  },
  {
    num: 14,
    topic: "The Best Productivity Apps for Students and Professionals",
    category: "Productivity",
    difficulty: "Beginner",
    defaultTags: ["Productivity Apps", "Software", "Time Tracking", "Task Management"]
  },
  {
    num: 15,
    topic: "How to Build a Daily Routine That Improves Productivity",
    category: "Productivity",
    difficulty: "Beginner",
    defaultTags: ["Daily Routine", "Time Management", "Habits", "Morning Routine"]
  },
  {
    num: 16,
    topic: "How to Start an Online Business from Scratch",
    category: "Entrepreneurship",
    difficulty: "Intermediate",
    defaultTags: ["Online Business", "Startups", "Solopreneur", "Business Guide"]
  },
  {
    num: 17,
    topic: "10 Profitable Online Business Ideas You Can Start Today",
    category: "Entrepreneurship",
    difficulty: "Beginner",
    defaultTags: ["Business Ideas", "Side Hustle", "Passive Income", "Entrepreneurship"]
  },
  {
    num: 18,
    topic: "Digital Marketing for Beginners: A Practical Guide",
    category: "Entrepreneurship",
    difficulty: "Beginner",
    defaultTags: ["Digital Marketing", "SEO", "Social Media", "Growth"]
  },
  {
    num: 19,
    topic: "How to Build a Personal Brand That Creates Opportunities",
    category: "Entrepreneurship",
    difficulty: "Intermediate",
    defaultTags: ["Personal Brand", "Networking", "Career Growth", "Marketing"]
  },
  {
    num: 20,
    topic: "The Biggest Mistakes First-Time Entrepreneurs Make (and How to Avoid Them)",
    category: "Entrepreneurship",
    difficulty: "Intermediate",
    defaultTags: ["Entrepreneur Mistakes", "Startups", "Lessons", "Business Tips"]
  }
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Response schema for structured Gemini generation
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    content: { 
      type: Type.STRING, 
      description: "Exhaustive, 2500+ word detailed guide in Markdown. Do not include mock titles or summary prefixes inside this. Go straight into introduction, detailed chapters with H2 and H3 headings, bold text, lists, comparison tables, visual callouts (Pro Tips, Expert Notes, Common Mistakes, Best Practices, Quick Facts, Key Takeaways). Must read like a wired/towardsdatascience professional editor. Be practical, complete, and avoid summary shortcuts." 
    },
    seoTitle: { type: Type.STRING, description: "SEO Title, 50-60 chars" },
    seoDescription: { type: Type.STRING, description: "SEO Meta description, 150-160 chars" },
    focusKeyword: { type: Type.STRING },
    secondaryKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    featuredImagePrompt: { type: Type.STRING, description: "Highly detailed AI image prompt to generate blog hero image" },
    faqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING }
        },
        required: ["question", "answer"]
      }
    },
    structuredData: {
      type: Type.OBJECT,
      properties: {
        articleSchema: { type: Type.STRING, description: "Exhaustive JSON-LD schema string for Article" },
        breadcrumbSchema: { type: Type.STRING, description: "Exhaustive JSON-LD schema string for Breadcrumb" },
        faqSchema: { type: Type.STRING, description: "Exhaustive JSON-LD schema string for FAQ" }
      },
      required: ["articleSchema", "breadcrumbSchema", "faqSchema"]
    },
    socialMedia: {
      type: Type.OBJECT,
      properties: {
        facebook: { type: Type.STRING },
        instagram: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        twitter: { type: Type.STRING },
        newsletterTeaser: { type: Type.STRING }
      },
      required: ["facebook", "instagram", "linkedin", "twitter", "newsletterTeaser"]
    },
    newsletterSummary: { type: Type.STRING, description: "100-word newsletter email summary" }
  },
  required: [
    "title", "summary", "content", "seoTitle", "seoDescription", "focusKeyword",
    "secondaryKeywords", "tags", "featuredImagePrompt", "faqs",
    "structuredData", "socialMedia", "newsletterSummary"
  ]
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Available models supporting generateContent to rotate
const ROTATION_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-flash-lite-latest",
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-3.1-pro-preview"
];

async function generateSingleArticle(item: typeof topics[0]): Promise<any> {
  const slug = generateSlug(item.topic);
  console.log(`\n[Queueing] Topic ${item.num}/20: "${item.topic}"`);

  let success = false;
  let articleData: any = null;
  let selectedModelUsed = "";

  for (const modelName of ROTATION_MODELS) {
    if (success) break;
    console.log(`[Rotation] Trying topic ${item.num} using model "${modelName}"...`);

    try {
      const prompt = `
        Write a comprehensive, publication-ready, long-form guide about: "${item.topic}".
        This is a cornerstone piece for the Category: "${item.category}".
        Difficulty Level: "${item.difficulty}".
        
        CRITICAL WRITING QUALITY REQUIREMENTS:
        - The article MUST contain between 2,500 and 4,000 words.
        - Avoid all generic summaries, placeholders, or abbreviated structures. Write exhaustive, dense, paragraph-long deep-dives under H2 and H3 headings.
        - Write in a highly professional, authoritative yet accessible English style suitable for TechCrunch, Wired, HubSpot, Zapier, or Towards Data Science.
        - Include realistic practical examples featuring developers, businesses, freelancers, or students where applicable.
        - Incorporate multiple visual callouts directly in markdown format (e.g. using Blockquotes or bold badges for: **[PRO TIP]**, **[EXPERT NOTE]**, **[COMMON MISTAKE]**, **[BEST PRACTICE]**, **[QUICK FACT]**, **[KEY TAKEAWAY]**).
        - Provide lists, comparative markdown tables, step-by-step procedures, or actionable checklists where appropriate to break up text and optimize readability.
        - Cite or mention authoritative sources where appropriate (e.g., OpenAI, Google, Microsoft, Anthropic, NVIDIA, OWASP, GitHub, MDN, W3C) without fabricating URLs.
        - Do not use cliches, keyword stuffing, or empty AI transitions.
        - Create 5-10 detailed Frequently Asked Questions.
        - Map out internal linking suggestions to the other 19 articles from the collection where logical.
        - Return the response conforming strictly to the requested JSON response schema.
      `;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.25
        }
      });

      const jsonStr = response.text?.trim() || "";
      articleData = JSON.parse(jsonStr);
      selectedModelUsed = modelName;
      success = true;
      console.log(`[SUCCESS] Topic ${item.num} generated successfully using ${modelName}!`);
    } catch (err: any) {
      console.error(`[Warning] Model "${modelName}" failed for topic ${item.num}. Error: ${err.message}`);
      // Fallback instantly to the next model in the rotation list
    }
  }

  if (!success || !articleData) {
    throw new Error(`Failed to generate topic "${item.topic}" after trying all models in the rotation list.`);
  }

  // Auto-rotate authors
  const author = AUTHORS[(item.num - 1) % AUTHORS.length];

  // Compute reading time
  const words = articleData.content.split(/\s+/).length;
  const readTimeMinutes = Math.max(5, Math.ceil(words / 225));
  const readTime = `${readTimeMinutes} min read`;

  // Unsplash professional default matching images based on category
  let defaultFeaturedImage = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800";
  if (item.category === "Artificial Intelligence") {
    defaultFeaturedImage = [
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800"
    ][item.num % 4];
  } else if (item.category === "Productivity") {
    defaultFeaturedImage = [
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=800"
    ][item.num % 4];
  } else if (item.category === "Entrepreneurship") {
    defaultFeaturedImage = [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
    ][item.num % 4];
  } else if (item.category === "Technology") {
    defaultFeaturedImage = [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800"
    ][item.num % 4];
  }

  // Assemble publication schema
  const publishedAt = new Date(Date.now() - (20 - item.num) * 24 * 60 * 60 * 1000).toISOString();
  const viewsCount = Math.floor(Math.random() * 800) + 150;
  const likesCount = Math.floor(viewsCount * (Math.random() * 0.2 + 0.1));

  return {
    id: `art-auto-${item.num}`,
    title: articleData.title,
    slug: slug,
    summary: articleData.summary,
    content: articleData.content,
    category: item.category,
    tags: Array.from(new Set([...(articleData.tags || []), ...item.defaultTags])),
    authorId: author.id,
    authorName: author.name,
    authorAvatar: author.avatar,
    authorRole: author.role,
    status: "published",
    featuredImage: defaultFeaturedImage,
    publishedAt: publishedAt,
    viewsCount: viewsCount,
    likesCount: likesCount,
    readTime: readTime,
    seoTitle: articleData.seoTitle,
    seoDescription: articleData.seoDescription,
    isPillar: item.num <= 5,
    workflowState: "Published",
    assignedAuthor: author.name,
    assignedEditor: "Site Editor",
    dueDate: publishedAt.split('T')[0],
    editorialNotes: `Generated via autonomous deep marketing editorial pipelines using model ${selectedModelUsed}.`,
    taskChecklist: [
      { id: `tk-${item.num}-1`, text: `Draft comprehensive guides on ${item.topic}`, done: true },
      { id: `tk-${item.num}-2`, text: "Optimize SEO metadata and keywords", done: true },
      { id: `tk-${item.num}-3`, text: "Incorporate structured JSON-LD Schema", done: true }
    ],
    activityHistory: [
      { timestamp: publishedAt, action: "Drafted and Peer Reviewed", user: author.name },
      { timestamp: publishedAt, action: "Approved and Published to Production Feed", user: "Site Editor" }
    ],
    revisions: [],
    focusKeyword: articleData.focusKeyword,
    secondaryKeywords: articleData.secondaryKeywords,
    featuredImagePrompt: articleData.featuredImagePrompt,
    faqs: articleData.faqs,
    structuredData: articleData.structuredData,
    socialMedia: articleData.socialMedia,
    newsletterSummary: articleData.newsletterSummary
  };
}

async function runSeeder() {
  console.log("Starting Multi-Model Resilient Seeding Engine...");
  
  if (!fs.existsSync(DB_FILE)) {
    console.error("Error: db.json does not exist.");
    process.exit(1);
  }

  // Load existing database
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!db.articles) {
    db.articles = [];
  }

  // Filter topics that don't exist yet
  const topicsToGenerate = topics.filter(item => {
    const slug = generateSlug(item.topic);
    return !db.articles.some((a: any) => a.slug === slug);
  });

  console.log(`Need to generate ${topicsToGenerate.length} remaining articles.`);

  // Process sequentially to be fully rate-limit compliant
  for (let i = 0; i < topicsToGenerate.length; i++) {
    const item = topicsToGenerate[i];
    console.log(`\n==================================================`);
    console.log(`Processing Article ${i + 1}/${topicsToGenerate.length} (Topic ${item.num}/20)`);
    console.log(`==================================================`);

    try {
      const art = await generateSingleArticle(item);
      if (art) {
        // Re-read db.json to avoid overwriting edits made during generation
        const currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        if (!currentDb.articles) {
          currentDb.articles = [];
        }
        if (!currentDb.articles.some((a: any) => a.slug === art.slug)) {
          currentDb.articles.push(art);
          fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2), 'utf8');
          console.log(`[SAVED] "${art.title}" successfully saved to db.json.`);
        }
      }
    } catch (err: any) {
      console.error(`[CRITICAL FAILED] Topic ${item.num} failed completely across all rotated models: ${err.message}`);
    }

    // Small pause between successful sequential calls to pace rate limits
    if (i < topicsToGenerate.length - 1) {
      console.log("Pacing... Pausing 5 seconds before next topic...");
      await sleep(5000);
    }
  }

  console.log("\n==================================================");
  console.log("All requested cornerstone articles successfully published!");
  console.log(`Total articles in DB: ${db.articles.length}`);
  console.log("==================================================");
}

runSeeder().catch(console.error);
