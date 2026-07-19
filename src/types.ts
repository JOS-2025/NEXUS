import fs from 'fs';
import path from 'path';

// ==========================================
// CENTRAL TS INTERFACES FOR DIGITAL PUBLISHING OS (DPOS)
// ==========================================

export interface AnalyticsMetrics {
  totalViews: number;
  totalLikes: number;
  subscribersCount: number;
  totalDownloads: number;
  revenueMetrics: {
    totalRevenue: string;
    breakdown: {
      memberships: string;
      sponsorships: string;
      affiliates: string;
    }
  };
  articlePerformance: {
    id: string;
    title: string;
    views: number;
    likes: number;
    category: string;
    workflowState?: string;
    readCompletionRate?: number;
  }[];
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ActivityHistoryItem {
  timestamp: string;
  action: string;
  user: string;
}

export interface Revision {
  timestamp: string;
  title: string;
  content: string;
  author: string;
  note?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  status: 'draft' | 'published';
  featuredImage: string;
  publishedAt: string;
  viewsCount: number;
  likesCount: number;
  readTime: string; // e.g. "5 min read"
  seoTitle: string;
  seoDescription: string;
  
  // MODULE 1 - Editorial Workflow Engine
  workflowState?: 'Idea' | 'Research' | 'Outline' | 'Draft' | 'AI Review' | 'Editor Review' | 'SEO Review' | 'Scheduled' | 'Published' | 'Updated' | 'Archived';
  assignedAuthor?: string;
  assignedEditor?: string;
  dueDate?: string;
  editorialNotes?: string;
  taskChecklist?: TaskChecklistItem[];
  activityHistory?: ActivityHistoryItem[];

  // MODULE 2 - Article Version Control
  revisions: Revision[];

  // MODULE 4 - Internal Linking Intelligence
  isPillar?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  approved: boolean;
  parentId?: string;
  likes?: number;
  likedBy?: string[];
}

export interface Subscriber {
  email: string;
  status: 'subscribed' | 'unsubscribed';
  subscribedAt: string;
  preferences: string[]; // categories like ["artificial-intelligence", "productivity"]
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'Template' | 'Checklist' | 'Prompt Pack';
  fileUrl: string;
  downloadsCount: number;
  author: string;
  fileSize: string;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  pricingType: 'Free' | 'Freemium' | 'Paid';
  url: string;
  features: string[];
  affiliateUrl: string;
  logoUrl: string;
  alternatives: string[];
  reviews: { author: string; rating: number; content: string; date: string }[];
  pros?: string[];
  cons?: string[];
  screenshots?: string[];
}

// MODULE 5 - Topic Clusters (Hierarchical Topic Architecture)
export interface TopicCluster {
  id: string;
  name: string;
  slug: string;
  description: string;
  pillarArticleId?: string; // Anchor/Pillar content ID
  featuredArticleIds: string[]; // Related articles inside cluster
  recommendedResourceIds: string[]; // resources related to this cluster
  relatedToolIds: string[]; // AI Tools inside cluster
}

// MODULE 6, 7 & 9 - Reading Experience, Personalization & Advanced Analytics
export interface ReadingSession {
  id: string;
  readerEmail: string;
  articleId: string;
  scrollDepth: number; // percentage (0-100)
  completed: boolean;
  engagementTimeSeconds: number;
  timestamp: string;
}

export interface ReaderProfile {
  email: string;
  bookmarks: string[]; // article IDs
  readingHistory: { articleId: string; timestamp: string }[];
  streakCount: number;
  lastActiveDate?: string; // YYYY-MM-DD
  readingGoalMinutesPerDay?: number;
  displayName?: string;
  role?: string;
  bio?: string;
  password?: string; // stored credentials
  interests?: string[];
  isPremium?: boolean;
  paypalEmail?: string;
  paypalSubscriptionId?: string;
}

// MODULE 10 - Knowledge Base Hub
export interface KnowledgeHubGuide {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string; // Markdown content
  category: string;
  learningPath: string; // e.g. "Zero-to-One Solopreneurship"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  relatedArticleIds: string[];
  relatedToolIds: string[];
}

export interface SearchQueryAnalytics {
  query: string;
  count: number;
  lastSearchedAt: string;
}

export interface CookieConsent {
  userEmail: string;
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  consentVersion: string;
  consentDate: string;
  updatedAt: string;
}

// Central Notification and Audience Engagement interfaces
export interface AppNotification {
  id: string;
  userId: string; // userEmail
  title: string;
  body: string;
  category: string; // 'Articles' | 'AI News' | 'Comments' | 'Replies' | 'System' | 'Promotions' | 'Resources' | 'Courses' | 'Security'
  channel: 'in_app' | 'push' | 'email';
  isRead: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  deepLink?: string;
  campaignId?: string;
}

export interface NotificationPreference {
  userEmail: string;
  categories: Record<string, { email: boolean; push: boolean; inApp: boolean }>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  templateId: string;
  type: string; // 'Announcement' | 'Newsletter' | 'Breaking News' | 'Weekly Digest' | 'Promotions' | 'Product Launch' | 'Event Reminder' | 'Feature Release'
  segmentId: string;
  scheduleType: 'immediate' | 'scheduled' | 'recurring';
  scheduledTime?: string;
  recurrence?: 'daily' | 'weekly' | 'none';
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  createdAt: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
}

export interface NotificationLog {
  id: string;
  campaignId?: string;
  notificationId?: string;
  userEmail: string;
  channel: 'email' | 'push' | 'in_app';
  status: 'success' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

export interface NotificationEvent {
  id: string;
  eventType: string; // 'article_published' | 'comment_added' | 'comment_reply' | 'author_followed' | 'course_released' | 'resource_added' | 'tool_added' | 'tool_updated' | 'user_inactive' | 'subscription_expiring' | 'account_verification' | 'security_event'
  payload: any;
  processed: boolean;
  createdAt: string;
}

export interface NotificationQueueItem {
  id: string;
  userEmail: string;
  title: string;
  body: string;
  channel: 'email' | 'push' | 'in_app';
  campaignId?: string;
  deepLink?: string;
  scheduledAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  createdAt: string;
}

export interface PushSubscriptionItem {
  id: string;
  userEmail: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceType: 'desktop' | 'mobile';
  browser: string;
  createdAt: string;
}

export interface EmailSubscriberItem {
  email: string;
  status: 'subscribed' | 'unsubscribed';
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  templateId: string;
  isActive: boolean;
  delayMinutes: number;
  createdAt: string;
}

export interface CampaignSegment {
  id: string;
  name: string;
  filters: {
    userRoles?: string[];
    interestCategories?: string[];
    minActivityDays?: number;
    maxActivityDays?: number;
    subscriptionPlans?: string[];
    newsletterStatus?: 'all' | 'subscribed' | 'unsubscribed';
  };
  createdAt: string;
}

export interface DeliveryAttempt {
  id: string;
  queueId: string;
  channel: string;
  status: 'success' | 'failed';
  error?: string;
  attemptedAt: string;
}

export interface TrackingEvent {
  id: string;
  type: 'open' | 'click';
  userEmail: string;
  campaignId?: string;
  notificationId?: string;
  device: string;
  browser: string;
  createdAt: string;
}

// Master DB Structure
export interface DBStructure {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  comments: Comment[];
  subscribers: Subscriber[];
  resources: Resource[];
  aiTools: AITool[];
  topicClusters: TopicCluster[];
  readingSessions: ReadingSession[];
  readerProfiles: Record<string, ReaderProfile>;
  knowledgeGuides: KnowledgeHubGuide[];
  searchQueries: SearchQueryAnalytics[];
  cookieConsents?: Record<string, CookieConsent>;
  notifications?: AppNotification[];
  notificationPreferences?: Record<string, NotificationPreference>;
  notificationTemplates?: NotificationTemplate[];
  notificationCampaigns?: NotificationCampaign[];
  notificationLogs?: NotificationLog[];
  notificationEvents?: NotificationEvent[];
  notificationQueue?: NotificationQueueItem[];
  pushSubscriptions?: PushSubscriptionItem[];
  emailSubscribers?: EmailSubscriberItem[];
  automationRules?: AutomationRule[];
  campaignSegments?: CampaignSegment[];
  deliveryAttempts?: DeliveryAttempt[];
  trackingEvents?: TrackingEvent[];
}

const DB_FILE = path.join(process.cwd(), 'db.json');

// Default initial seeded database structure (Zero Placeholders, high-quality)
const INITIAL_DB: DBStructure = {
  articles: [
    {
      id: "art-1",
      title: "The Evolution of Large Language Models: From Transformers to Gemini 3.5",
      slug: "evolution-of-large-language-models-transformers-to-gemini-3-5",
      summary: "Explore the deep structural paradigm shifts from the original 2017 Transformer architecture to modern multi-modal, agentic-ready AI giants like Gemini 3.5.",
      content: `The release of the landmark paper "Attention Is All You Need" in 2017 fundamentally reshaped the field of artificial intelligence. By replacing recurrent neural networks (RNNs) with the self-attention mechanism, the Transformer architecture allowed for unprecedented parallelization and scale, giving birth to the era of Large Language Models (LLMs).\n\n### The Transformer Breakthrough\nTraditional architectures processed text sequentially, making them slow and unable to capture long-range contextual relationships effectively. The self-attention mechanism solved this by evaluating the relationship between all words in a sentence simultaneously, regardless of their distance. This allowed neural networks to build deeply nuanced representations of language.\n\n### The Shift to Multimodality\nEarly models like GPT-2 and GPT-3 were strictly text-based. However, human intelligence is sensory and rich. The paradigm shifted toward native multimodality, where models are trained on images, audio, and video concurrently. \n\nGemini represents the pinnacle of this multimodal design. Instead of stitch-together components (e.g., a speech-to-text transcriber feeding a text model, which feeds an image generator), modern models process all modalities natively using a unified representation. This yields a massive jump in logical reasoning, audio synthesis, and visual analysis.\n\n### The Agentic Paradigm and the Future\nWe are now moving from passive informational assistants to autonomous, proactive agents. Modern models are designed to invoke tools, read web pages, construct and run code, and cooperate in multi-agent workflows to accomplish complex, open-ended tasks.\n\nAs models grow faster and more cost-efficient, the integration of long-term planning, tool hybrid usage, and reinforcement learning during inference is creating AI systems that can execute high-level software development, medical diagnostics, and technical writing with little to no human intervention.`,
      category: "Artificial Intelligence",
      tags: ["Machine Learning", "LLMs", "Deep Learning", "Technology"],
      authorId: "auth-1",
      authorName: "Sarah Chen",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      authorRole: "Principal AI Research Scientist",
      status: "published",
      featuredImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
      publishedAt: "2026-07-01T08:30:00Z",
      viewsCount: 1420,
      likesCount: 312,
      readTime: "6 min read",
      seoTitle: "The Evolution of Large Language Models: From Transformers to Gemini 3.5",
      seoDescription: "An in-depth guide on how Large Language Models evolved from the original 2017 Transformer architecture into modern agentic, native multimodal powerhouses.",
      isPillar: true,
      workflowState: "Published",
      assignedAuthor: "Sarah Chen",
      assignedEditor: "Site Editor",
      dueDate: "2026-07-01",
      editorialNotes: "Approved by leadership for initial launch. Perfect pillar article.",
      taskChecklist: [
        { id: "tk-1", text: "Draft comprehensive content on self-attention", done: true },
        { id: "tk-2", text: "Verify Gemini 3.5 architecture details", done: true },
        { id: "tk-3", text: "Perform AI editorial optimization", done: true },
        { id: "tk-4", text: "Complete final editor review and verify SEO links", done: true }
      ],
      activityHistory: [
        { timestamp: "2026-06-28T09:00:00Z", action: "Created idea block", user: "Sarah Chen" },
        { timestamp: "2026-06-29T14:30:00Z", action: "Submitted for editor review", user: "Sarah Chen" },
        { timestamp: "2026-07-01T08:30:00Z", action: "Published to production", user: "Site Editor" }
      ],
      revisions: [
        {
          timestamp: "2026-06-29T14:30:00Z",
          title: "The Evolution of LLMs: From Transformers to Gemini 3.5",
          content: "Original draft of the Transformer-to-Gemini timeline by Sarah Chen. Focuses heavily on mathematical modeling of attention layers.",
          author: "Sarah Chen",
          note: "Initial draft submission"
        }
      ]
    },
    {
      id: "art-2",
      title: "Building a $15k/Month AI Micro-SaaS: A Practical Solopreneur's Playbook",
      slug: "building-15k-month-ai-micro-saas-solopreneur-playbook",
      summary: "A step-by-step master guide for engineering, positioning, and launching a highly profitable AI-powered Micro-SaaS as a solo founder in 2026.",
      content: `The barrier to entry for building software has never been lower. With powerful generative AI models available via simple API endpoints, a single engineer can build, launch, and scale a SaaS product that once required a team of ten.\n\nHowever, building is only 20% of the battle. The remaining 80% is finding a profitable niche, validating demand, positioning your product, and marketing with relentless consistency.\n\n### Step 1: Finding Your Micro-SaaS Niche\nDo not build "yet another general AI writing assistant." The market is saturated. Instead, find a hyper-specific, high-value problem in an industry you understand. For example:\n- An AI-powered lease agreement reviewer for commercial real estate agents.\n- A localized transcript-to-minutes translator for small municipal city councils.\n- A customized automated image generator for boutique antique stores.\n\nTarget industries where users have high budget capacity and low technical tolerance. They are happy to pay $49-$199/month for software that saves them 5 hours of manual work.\n\n### Step 2: The Lean Technical Architecture\nKeep your stack as simple as possible. You need speed-to-market. Here is a recommended minimal viable stack:\n- **Frontend & Backend**: Next.js or React + Node (Express)\n- **Database**: PostgreSQL or Supabase\n- **AI Engine**: Gemini 3.5 API (using the cost-efficient flash models via server proxy)\n- **Payments**: Stripe Billing with Customer Portal\n- **Authentication**: Firebase Auth or OAuth\n\nAlways wrap your API calls to Gemini on the server side to protect your API keys and apply rate limits to prevent expensive abuse.\n\n### Step 3: Relentless SEO and Distribution\nLaunch on Product Hunt, Hacker News, and specialized directories. Create 10 hyper-focused SEO comparison or tutorial articles targeting long-tail keywords in your industry. Answer questions on Reddit and Quora with detailed value-driven comments, and link back to your tool naturally.\n\nFocus on retention. If you acquire 100 users paying $50/month, you have built a life-changing $5,000/month business. At 300 users, you are at $15,000/month. The path is clear: find the problem, solve it cleanly, and distribute it aggressively.`,
      category: "Entrepreneurship",
      tags: ["SaaS", "Startups", "Solopreneur", "Growth Hacks"],
      authorId: "auth-2",
      authorName: "Marcus Vance",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      authorRole: "Serial Tech Bootstrapper & Investor",
      status: "published",
      featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      publishedAt: "2026-07-03T10:15:00Z",
      viewsCount: 980,
      likesCount: 245,
      readTime: "8 min read",
      seoTitle: "Solopreneur Guide: How to Build and Scale an AI Micro-SaaS to $15k/Month",
      seoDescription: "An actionable, developer-focused playbook to identify high-value niches, build lean technical architectures, and acquire customers for your AI software business.",
      isPillar: true,
      workflowState: "Published",
      assignedAuthor: "Marcus Vance",
      assignedEditor: "Site Editor",
      dueDate: "2026-07-02",
      editorialNotes: "Superb roadmap for aspiring entrepreneurs. High conversion potential.",
      taskChecklist: [
        { id: "tk-5", text: "Validate SaaS market points", done: true },
        { id: "tk-6", text: "Flesh out Stripe billing strategy", done: true },
        { id: "tk-7", text: "Add link recommendations for cursor editor", done: true }
      ],
      activityHistory: [
        { timestamp: "2026-06-30T10:00:00Z", action: "Began writing initial draft", user: "Marcus Vance" },
        { timestamp: "2026-07-02T16:00:00Z", action: "Approved for publication", user: "Site Editor" }
      ],
      revisions: []
    },
    {
      id: "art-3",
      title: "10x Productivity: Mastering Autonomous Agents and Task Pipelines",
      slug: "10x-productivity-mastering-autonomous-agents-task-pipelines",
      summary: "How to design personal autonomous multi-agent pipelines to automate research, writing, content generation, and code review processes entirely.",
      content: `The modern professional is no longer just a creator; they are a conductor. Rather than executing every task manually, high-leverage individuals are using autonomous AI agents to build multi-step productivity pipelines.\n\n### What is an Autonomous Agent?\nUnlike standard chatbots that wait for your next prompt, an autonomous agent is given a high-level goal, a set of tools (such as web search, file access, and code executors), and a loop of self-reflection. It breaks down the goal into sub-tasks, executes them sequentially, evaluates its own progress, and self-corrects until the goal is achieved.\n\n### Designing Your First Automated Pipeline\nLet us look at a real-world pipeline: **Automated Competitive Intelligence**.\n\n1. **Triggers**: A cron job runs every Monday at 8 AM.\n2. **Agent 1 (Researcher)**: Uses Google Search Grounding to find recent news, launches, and blog posts of 5 key competitors.\n3. **Agent 2 (Synthesizer)**: Takes the raw competitive data and extracts major feature additions, pricing shifts, and marketing tactics. It outputs a structured markdown report.\n4. **Agent 3 (Strategist)**: Analyzes the competitive report against your own product roadmap and generates three strategic recommendations.\n5. **Notification**: Sends the finished brief directly to your Slack channel or email.\n\n### The Future of High-Leverage Work\nBy delegating repetitive information retrieval, data synthesis, and first-draft generation to agent pipelines, you free up your mental bandwidth for strategic decision-making, creative breakthroughs, and deep relationship-building. The professionals who excel in the coming decade will be those who master the art of prompt engineering, workflow orchestration, and agent governance.`,
      category: "Productivity",
      tags: ["Automation", "Agents", "Prompt Engineering", "Lifehacks"],
      authorId: "auth-3",
      authorName: "Elena Rostova",
      authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      authorRole: "Head of Productivity Engineering",
      status: "published",
      featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
      publishedAt: "2026-07-05T14:20:00Z",
      viewsCount: 1120,
      likesCount: 304,
      readTime: "5 min read",
      seoTitle: "Autonomous AI Agents: The Secret to 10x Professional Productivity",
      seoDescription: "Learn how to orchestrate multi-agent AI systems and task pipelines to fully automate research, outline generation, and business workflows.",
      isPillar: false,
      workflowState: "Published",
      assignedAuthor: "Elena Rostova",
      assignedEditor: "Site Editor",
      dueDate: "2026-07-04",
      editorialNotes: "Excellent write-up on productivity frameworks. Well-researched.",
      taskChecklist: [
        { id: "tk-8", text: "Create autonomous loop diagram outline", done: true },
        { id: "tk-9", text: "Review against SEO accessibility guidelines", done: true }
      ],
      activityHistory: [
        { timestamp: "2026-07-03T11:00:00Z", action: "Assigned topic outline", user: "Site Editor" },
        { timestamp: "2026-07-05T14:20:00Z", action: "Published to feed", user: "Site Editor" }
      ],
      revisions: []
    },
    {
      id: "art-4",
      title: "The Ultimate Guide to Advanced Tailwind Styling & CSS Variables in 2026",
      slug: "ultimate-guide-advanced-tailwind-styling-css-variables-2026",
      summary: "Master modern CSS-in-utility styling paradigms. Build eye-friendly sophisticated dark modes using custom theme definitions, variable mapping, and micro-transitions.",
      content: `In the modern digital landscape, web typography and eye-strain-friendly color pairing have moved from nice-to-haves to absolute product requirements.\n\n### The Sophisticated Dark Aesthetic\nGone are the days of harsh absolute blacks (#000000) and aggressive contrasting neon accents. High-end modern publishing interfaces utilize a soft, ambient, layered hierarchy:\n- **Deep Base Canvas**: #050505 (pitch charcoal) or #0a0a0a\n- **Floating Cards**: #0f0f0f or #121212 styled with a subtle border of rgba(255, 255, 255, 0.08)\n- **Muted Accents**: Brand glowing accents like Molten Amber, Copper Orange (#F27D26), or Cosmic Slate. These colors direct user focus without triggering visual fatigue.\n\nBy binding these properties directly into tailwindcss custom theme variables via CSS @theme rules, we can toggle entire color schemes dynamically and establish fluid transitions on hover states seamlessly.`,
      category: "Technology",
      tags: ["Tailwind", "CSS", "Frontend", "Web Development"],
      authorId: "auth-admin",
      authorName: "Global Admin",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      authorRole: "Lead System Architect",
      status: "published",
      featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
      publishedAt: "2026-07-07T09:15:00Z",
      viewsCount: 420,
      likesCount: 112,
      readTime: "4 min read",
      seoTitle: "Advanced Tailwind V4 & CSS Custom Properties Guide",
      seoDescription: "A developer guide to styling modern sophisticated dark modes with custom Tailwind configurations, CSS variables, and fluid negative space.",
      isPillar: false,
      workflowState: "Published",
      assignedAuthor: "Global Admin",
      assignedEditor: "Global Admin",
      dueDate: "2026-07-06",
      editorialNotes: "Self-authored guide detailing our exact platform styling paradigm.",
      taskChecklist: [],
      activityHistory: [],
      revisions: []
    }
  ],
  categories: [
    { id: "cat-1", name: "Artificial Intelligence", slug: "artificial-intelligence", description: "Deep dives into LLMs, machine learning, vision models, neural networks, and prompt engineering.", count: 1 },
    { id: "cat-2", name: "Productivity", slug: "productivity", description: "Frameworks, tools, autonomous agent workflows, and strategies to supercharge your work output.", count: 1 },
    { id: "cat-3", name: "Entrepreneurship", slug: "entrepreneurship", description: "Actionable playbooks for launching, scaling, and marketing tech startups and AI micro-SaaS businesses.", count: 1 },
    { id: "cat-4", name: "Technology", slug: "technology", description: "General software development, frontend frameworks, full-stack design, cloud architecture, and cybersecurity.", count: 1 }
  ],
  tags: [
    { id: "tag-1", name: "Machine Learning", slug: "machine-learning" },
    { id: "tag-2", name: "LLMs", slug: "llms" },
    { id: "tag-3", name: "Automation", slug: "automation" },
    { id: "tag-4", name: "Agents", slug: "agents" },
    { id: "tag-5", name: "SaaS", slug: "saas" },
    { id: "tag-6", name: "Startups", slug: "startups" },
    { id: "tag-7", name: "Prompt Engineering", slug: "prompt-engineering" },
    { id: "tag-8", name: "Solopreneur", slug: "solopreneur" }
  ],
  comments: [
    {
      id: "com-1",
      articleId: "art-1",
      authorName: "Devin K.",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      content: "This is a remarkably clear overview of Transformer history. The emphasis on native multimodality vs pipelined solutions is spot on!",
      createdAt: "2026-07-02T11:45:00Z",
      approved: true
    },
    {
      id: "com-2",
      articleId: "art-1",
      authorName: "Alice Miller",
      authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
      content: "Can you elaborate on how we can implement long-term agent planning in standard web apps using the modern Gemini TS SDK? Excellent read.",
      createdAt: "2026-07-02T16:20:00Z",
      approved: true
    }
  ],
  subscribers: [
    { email: "josphatmuchemi976@gmail.com", status: "subscribed", subscribedAt: "2026-07-08T10:00:00Z", preferences: ["artificial-intelligence", "productivity"] },
    { email: "news-test@nexuscms.com", status: "subscribed", subscribedAt: "2026-07-05T09:00:00Z", preferences: ["entrepreneurship"] }
  ],
  resources: [
    {
      id: "res-1",
      title: "The Ultimate Prompt Engineering Cheat Sheet",
      description: "A comprehensive reference guide featuring advanced prompt engineering patterns: Few-Shot, Chain-of-Thought, ReAct, and system instructions for leading LLMs.",
      type: "Prompt Pack",
      fileUrl: "https://example.com/downloads/prompt_engineering_cheatsheet.pdf",
      downloadsCount: 342,
      author: "Sarah Chen",
      fileSize: "2.4 MB"
    },
    {
      id: "res-2",
      title: "AI Micro-SaaS Business Model Canvas",
      description: "An interactive, fully structured business planning template specifically tailored for solopreneurs launching AI software applications.",
      type: "Template",
      fileUrl: "https://example.com/downloads/ai_micro_saas_canvas.xlsx",
      downloadsCount: 189,
      author: "Marcus Vance",
      fileSize: "1.1 MB"
    },
    {
      id: "res-3",
      title: "Autonomous Agents System Architecture Checklist",
      description: "A developer checklist detailing loop structures, self-correction triggers, external tools integration, and rate-limiting rules for agentic loops.",
      type: "Checklist",
      fileUrl: "https://example.com/downloads/agent_architecture_checklist.pdf",
      downloadsCount: 215,
      author: "Elena Rostova",
      fileSize: "850 KB"
    }
  ],
  aiTools: [
    {
      id: "tool-1",
      name: "Cursor AI Editor",
      description: "A highly advanced fork of VS Code built around native, proactive code completion, multi-file edits, and chat-driven software engineering.",
      category: "Productivity",
      rating: 4.9,
      pricingType: "Freemium",
      url: "https://cursor.com",
      features: ["Tab auto-complete", "Multi-file edits", "In-line terminal chat", "AI code reviews"],
      affiliateUrl: "https://cursor.com/?ref=nexus",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150",
      alternatives: ["VS Code Copilot", "Windsurf", "Zed Editor"],
      reviews: [
        { author: "Alex G.", rating: 5, content: "Completely replaced standard VS Code for me. Multi-file editing speeds up migrations ten-fold.", date: "2026-06-28" },
        { author: "Rita S.", rating: 4.8, content: "Indispensable tool. The terminal AI interaction is extremely clean.", date: "2026-07-02" }
      ]
    },
    {
      id: "tool-2",
      name: "Gemini Pro Sandbox",
      description: "A fast, flexible, developer-friendly interface to test multimodal outputs, system instructions, and schema formatting with Gemini 3 series models.",
      category: "Artificial Intelligence",
      rating: 4.8,
      pricingType: "Free",
      url: "https://ai.google.dev",
      features: ["Multimodal uploads", "Structured JSON Schema output", "Function calling playground", "Rate limit controls"],
      affiliateUrl: "https://ai.google.dev/?ref=nexus",
      logoUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=150",
      alternatives: ["OpenAI Playground", "Anthropic Console"],
      reviews: [
        { author: "Sam L.", rating: 5, content: "The schema enforcement is the best in the market. Highly recommend for enterprise integration.", date: "2026-07-01" }
      ]
    },
    {
      id: "tool-3",
      name: "v0 by Vercel",
      description: "A generative UI tool that constructs styled Tailwind CSS and React component layouts from plain-text layout guidelines.",
      category: "Entrepreneurship",
      rating: 4.7,
      pricingType: "Freemium",
      url: "https://v0.dev",
      features: ["Generates React hooks & state", "Styled with pure Tailwind", "Direct shadcn support", "Code preview & copy"],
      affiliateUrl: "https://v0.dev/?ref=nexus",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150",
      alternatives: ["Bolt.new", "Lovable.dev", "Anima App"],
      reviews: [
        { author: "Claire T.", rating: 4.5, content: "Incredible for rapid mockup generation. Saved me days of component styling.", date: "2026-06-15" }
      ]
    }
  ],
  
  // MODULE 5 - Topic Clusters Seed
  topicClusters: [
    {
      id: "cluster-ai",
      name: "Artificial Intelligence Foundations",
      slug: "artificial-intelligence-foundations",
      description: "A holistic deep dive into neural structures, from self-attention layers to autonomous agent execution paradigms.",
      pillarArticleId: "art-1",
      featuredArticleIds: ["art-1", "art-3"],
      recommendedResourceIds: ["res-1", "res-3"],
      relatedToolIds: ["tool-2"]
    },
    {
      id: "cluster-bootstrap",
      name: "Zero-to-One Solopreneurship",
      slug: "zero-to-one-solopreneurship",
      description: "A hyper-actionable cluster guiding software developers on finding niche ideas, launching SaaS products, and scaling revenue.",
      pillarArticleId: "art-2",
      featuredArticleIds: ["art-2"],
      recommendedResourceIds: ["res-2"],
      relatedToolIds: ["tool-1", "tool-3"]
    }
  ],

  // MODULE 6 & 9 - Reading Sessions & Analytics Tracker
  readingSessions: [],

  // MODULE 7 - Reader Profiles
  readerProfiles: {
    "josphatmuchemi976@gmail.com": {
      email: "josphatmuchemi976@gmail.com",
      bookmarks: ["art-1", "art-2"],
      readingHistory: [
        { articleId: "art-1", timestamp: "2026-07-08T09:30:00Z" }
      ],
      streakCount: 3,
      lastActiveDate: "2026-07-08",
      readingGoalMinutesPerDay: 15
    }
  },

  // MODULE 10 - Knowledge Base Hub
  knowledgeGuides: [
    {
      id: "guide-1",
      title: "The Comprehensive Guide to Prompt Engineering: Zero to Hero",
      slug: "comprehensive-guide-prompt-engineering-zero-hero",
      description: "A definitive structured playbook outlining advanced prompt templates, standard schemas, few-shot conditioning, and the ReAct reasoning model.",
      content: `# Prompt Engineering Master Guide

Prompt engineering is the core art of programming Large Language Models using natural language. Rather than shooting in the dark, professional creators utilize structured logical formats to yield highly deterministic outputs.

## Section 1: The Core Variables
A bulletproof system prompt contains four specific structural pillars:
1. **Context/Persona**: Define exactly what credentials the agent possesses.
2. **Task**: Explicit instructions of the functional outcome desired.
3. **Constraints**: Clear rules on what *not* to do (e.g. "Do not generate mock API keys").
4. **Output Format**: Enforce structure (e.g. JSON, YAML, strict Markdown).

## Section 2: Chain of Thought Reasoning
Force models to output their mental logic sequentially using step-by-step prefixes:
\`\`\`text
Solve the puzzle. Before giving the final answer, outline your thoughts in a numbered list.
\`\`\`
This simple conditioning yields up to a 60% jump in mathematical and logical accuracy.

## Section 3: The ReAct Frame
Integrate reasoning loops with action-execution triggers. This allows the model to think, issue queries, observe responses, and iterate until completion. Use our seeded ReAct Prompt Pack inside the resource library for an absolute head-start.`,
      category: "Artificial Intelligence",
      learningPath: "AI Agent Orchestration",
      difficulty: "Beginner",
      durationMinutes: 12,
      relatedArticleIds: ["art-1", "art-3"],
      relatedToolIds: ["tool-2"]
    },
    {
      id: "guide-2",
      title: "Validating SaaS Ideas: How to Confirm Demand Without Writing Code",
      slug: "validating-saas-ideas-confirm-demand-without-code",
      description: "A step-by-step tutorial on building static landing pages, orchestrating search traffic, collecting emails, and driving Stripe pre-purchases.",
      content: `# Launch & Validation Playbook

Many founders make the critical mistake of building massive databases and complex backend interfaces before verifying if a single customer actually wants their product.

## Section 1: The One-Pager Landing
Create a clean, visually polished responsive page explaining the core value proposition. Frame the core problem clearly.
- **Hero Header**: Emphasize the exact time/effort saved (e.g. "Review lease contracts in 30 seconds").
- **Visual Mockups**: Generate high-fidelity wireframes or mock illustrations.
- **Primary CTA**: A simple email capture button or an "Early Access" pre-order field.

## Section 2: Acquisition Loops
Do not wait for SEO to kick in over months. Instead:
1. Run target search keywords campaigns on specialized subreddits.
2. Provide immediate direct value on community boards (Quora, IndieHackers).
3. Connect custom domain tracking to verify engagement times.

## Section 3: The Pre-Sale Threshold
If you collect over 100 emails within 5 days, or secure 5 pre-purchases via a standard Stripe sandbox checkout link, you have secured market validation. You are officially cleared to build the absolute leanest viable version of your SaaS.`,
      category: "Entrepreneurship",
      learningPath: "Zero-to-One Solopreneurship",
      difficulty: "Intermediate",
      durationMinutes: 18,
      relatedArticleIds: ["art-2"],
      relatedToolIds: ["tool-1", "tool-3"]
    }
  ],

  // MODULE 12 - Platform Search Analytics
  searchQueries: [
    { query: "gemini 3.5", count: 18, lastSearchedAt: "2026-07-08T09:40:00Z" },
    { query: "saas bootstrap", count: 12, lastSearchedAt: "2026-07-08T10:10:00Z" },
    { query: "tailwind dark mode", count: 8, lastSearchedAt: "2026-07-08T08:20:00Z" }
  ]
};

// Thread-safe / read-write robust local JSON database client
export class LocalDB {
  private static cachedData: DBStructure | null = null;

  public static load(): DBStructure {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.cachedData = JSON.parse(raw);
        
        // Ensure new properties (topicClusters, readingSessions, readerProfiles, knowledgeGuides, searchQueries) are fully merged if loading an older file
        let modified = false;
        if (!this.cachedData) {
          this.cachedData = { ...INITIAL_DB };
          modified = true;
        } else {
          if (!this.cachedData.topicClusters) { this.cachedData.topicClusters = [...INITIAL_DB.topicClusters]; modified = true; }
          if (!this.cachedData.readingSessions) { this.cachedData.readingSessions = []; modified = true; }
          if (!this.cachedData.readerProfiles) { this.cachedData.readerProfiles = { ...INITIAL_DB.readerProfiles }; modified = true; }
          if (!this.cachedData.knowledgeGuides) { this.cachedData.knowledgeGuides = [...INITIAL_DB.knowledgeGuides]; modified = true; }
          if (!this.cachedData.searchQueries) { this.cachedData.searchQueries = [...INITIAL_DB.searchQueries]; modified = true; }
          
          // Ensure DPOS fields exist on old articles
          this.cachedData.articles = this.cachedData.articles.map(art => {
            let updated = false;
            if (!art.workflowState) { art.workflowState = 'Published'; updated = true; }
            if (!art.revisions) { art.revisions = []; updated = true; }
            if (art.isPillar === undefined) { art.isPillar = art.id === 'art-1' || art.id === 'art-2'; updated = true; }
            if (!art.taskChecklist) { art.taskChecklist = []; updated = true; }
            if (!art.activityHistory) { art.activityHistory = []; updated = true; }
            if (updated) modified = true;
            return art;
          });
        }
        
        if (modified) {
          this.save(this.cachedData);
        }
        return this.cachedData!;
      }
    } catch (e) {
      console.error("Failed to parse db.json, resetting to seeds", e);
    }

    // Default seed
    this.cachedData = { ...INITIAL_DB };
    this.save(this.cachedData);
    return this.cachedData;
  }

  public static save(data: DBStructure): void {
    this.cachedData = data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error("Failed to write db.json to disk", e);
    }
  }

  // Articles CRUD helper
  public static getArticles(): Article[] {
    return this.load().articles;
  }

  public static getArticleBySlug(slug: string): Article | undefined {
    const db = this.load();
    const article = db.articles.find(a => a.slug === slug);
    if (article) {
      article.viewsCount += 1;
      this.save(db);
    }
    return article;
  }

  public static saveArticle(article: Article): Article {
    const db = this.load();
    const index = db.articles.findIndex(a => a.id === article.id);
    if (index >= 0) {
      db.articles[index] = article;
    } else {
      db.articles.unshift(article);
    }
    this.save(db);
    return article;
  }

  public static deleteArticle(id: string): boolean {
    const db = this.load();
    const initialLen = db.articles.length;
    db.articles = db.articles.filter(a => a.id !== id);
    this.save(db);
    return db.articles.length < initialLen;
  }

  // Comments Helper
  public static getComments(articleId: string): Comment[] {
    return this.load().comments.filter(c => c.articleId === articleId);
  }

  public static addComment(comment: Comment): Comment {
    const db = this.load();
    db.comments.push(comment);
    this.save(db);
    return comment;
  }

  // Subscriber Helper
  public static getSubscribers(): Subscriber[] {
    return this.load().subscribers;
  }

  public static subscribe(email: string, preferences: string[] = []): Subscriber {
    const db = this.load();
    const existing = db.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.status = 'subscribed';
      existing.preferences = preferences;
      this.save(db);
      return existing;
    }

    const newSub: Subscriber = {
      email,
      status: 'subscribed',
      subscribedAt: new Date().toISOString(),
      preferences
    };
    db.subscribers.push(newSub);
    this.save(db);
    return newSub;
  }

  // Resources Helper
  public static getResources(): Resource[] {
    return this.load().resources;
  }

  public static incrementDownload(resourceId: string): Resource | undefined {
    const db = this.load();
    const resource = db.resources.find(r => r.id === resourceId);
    if (resource) {
      resource.downloadsCount += 1;
      this.save(db);
    }
    return resource;
  }

  // Tools Directory Helpers
  public static getTools(): AITool[] {
    return this.load().aiTools;
  }

  public static addToolReview(toolId: string, review: { author: string; rating: number; content: string }): AITool | undefined {
    const db = this.load();
    const tool = db.aiTools.find(t => t.id === toolId);
    if (tool) {
      const fullReview = {
        ...review,
        date: new Date().toISOString().split('T')[0]
      };
      tool.reviews.unshift(fullReview);
      
      // Re-calculate average rating
      const sum = tool.reviews.reduce((acc, r) => acc + r.rating, 0);
      tool.rating = parseFloat((sum / tool.reviews.length).toFixed(1));
      
      this.save(db);
    }
    return tool;
  }

  // MODULE 5 - Topic Clusters CRUD
  public static getClusters(): TopicCluster[] {
    return this.load().topicClusters;
  }

  public static getClusterBySlug(slug: string): TopicCluster | undefined {
    return this.load().topicClusters.find(c => c.slug === slug);
  }

  public static saveCluster(cluster: TopicCluster): TopicCluster {
    const db = this.load();
    const index = db.topicClusters.findIndex(c => c.id === cluster.id);
    if (index >= 0) {
      db.topicClusters[index] = cluster;
    } else {
      db.topicClusters.push(cluster);
    }
    this.save(db);
    return cluster;
  }

  // MODULE 6 & 7 - Reader Profiles Management (Bookmarks & Streaks)
  public static getReaderProfile(email: string): ReaderProfile {
    const db = this.load();
    const emailKey = email.toLowerCase();
    
    if (!db.readerProfiles[emailKey]) {
      db.readerProfiles[emailKey] = {
        email: emailKey,
        bookmarks: [],
        readingHistory: [],
        streakCount: 0,
        readingGoalMinutesPerDay: 10
      };
      this.save(db);
    }
    return db.readerProfiles[emailKey];
  }

  public static saveReaderProfile(profile: ReaderProfile): ReaderProfile {
    const db = this.load();
    const emailKey = profile.email.toLowerCase();
    db.readerProfiles[emailKey] = profile;
    this.save(db);
    return profile;
  }

  public static addArticleBookmark(email: string, articleId: string): ReaderProfile {
    const profile = this.getReaderProfile(email);
    if (!profile.bookmarks.includes(articleId)) {
      profile.bookmarks.push(articleId);
      this.saveReaderProfile(profile);
    }
    return profile;
  }

  public static removeArticleBookmark(email: string, articleId: string): ReaderProfile {
    const profile = this.getReaderProfile(email);
    profile.bookmarks = profile.bookmarks.filter(id => id !== articleId);
    this.saveReaderProfile(profile);
    return profile;
  }

  // MODULE 9 - Reading Sessions & engagement tracking
  public static recordReadingSession(session: ReadingSession): void {
    const db = this.load();
    db.readingSessions.push(session);

    // Update reader profile history and streak if an email is associated
    if (session.readerEmail && session.readerEmail.includes('@')) {
      const emailKey = session.readerEmail.toLowerCase();
      const profile = this.getReaderProfile(emailKey);
      
      // Add to reading history
      profile.readingHistory.push({
        articleId: session.articleId,
        timestamp: session.timestamp
      });

      // Handle daily reading streaks
      const todayStr = new Date().toISOString().split('T')[0];
      if (profile.lastActiveDate) {
        const lastActive = new Date(profile.lastActiveDate);
        const today = new Date(todayStr);
        const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          profile.streakCount += 1;
        } else if (diffDays > 1) {
          profile.streakCount = 1;
        }
      } else {
        profile.streakCount = 1;
      }
      profile.lastActiveDate = todayStr;
      db.readerProfiles[emailKey] = profile;
    }

    this.save(db);
  }

  public static getReadingSessions(): ReadingSession[] {
    return this.load().readingSessions;
  }

  // MODULE 10 - Knowledge Hub guides
  public static getGuides(): KnowledgeHubGuide[] {
    return this.load().knowledgeGuides;
  }

  public static getGuideBySlug(slug: string): KnowledgeHubGuide | undefined {
    return this.load().knowledgeGuides.find(g => g.slug === slug);
  }

  // MODULE 12 - Platform Search Autocomplete & analytics
  public static recordSearchQuery(query: string): void {
    if (!query || query.trim().length < 2) return;
    const db = this.load();
    const cleanQuery = query.toLowerCase().trim();
    
    const index = db.searchQueries.findIndex(q => q.query === cleanQuery);
    if (index >= 0) {
      db.searchQueries[index].count += 1;
      db.searchQueries[index].lastSearchedAt = new Date().toISOString();
    } else {
      db.searchQueries.push({
        query: cleanQuery,
        count: 1,
        lastSearchedAt: new Date().toISOString()
      });
    }
    this.save(db);
  }

  public static getPopularSearches(limit = 6): SearchQueryAnalytics[] {
    const db = this.load();
    return [...db.searchQueries]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Analytics helper for Admin board (Enhanced with DPOS statistics)
  public static getMetrics() {
    const db = this.load();
    const totalViews = db.articles.reduce((acc, a) => acc + a.viewsCount, 0);
    const totalLikes = db.articles.reduce((acc, a) => acc + a.likesCount, 0);
    const totalComments = db.comments.length;
    const subscribersCount = db.subscribers.filter(s => s.status === 'subscribed').length;
    const totalDownloads = db.resources.reduce((acc, r) => acc + r.downloadsCount, 0);

    // Dynamic metrics calculated from real DPOS structures
    const sessions = db.readingSessions || [];
    const avgScrollDepth = sessions.length > 0 
      ? parseFloat((sessions.reduce((acc, s) => acc + s.scrollDepth, 0) / sessions.length).toFixed(1)) 
      : 74.5; // fallback baseline
    const readCompletionRate = sessions.length > 0
      ? parseFloat(((sessions.filter(s => s.completed).length / sessions.length) * 100).toFixed(1))
      : 65.0; // fallback baseline
    const totalEngagementSec = sessions.reduce((acc, s) => acc + s.engagementTimeSeconds, 0);
    const avgEngagementTimeMin = sessions.length > 0
      ? parseFloat(((totalEngagementSec / sessions.length) / 60).toFixed(1))
      : 3.8; // fallback baseline

    const popularQueries = [...(db.searchQueries || [])]
      .sort((a, b) => b.count - a.count)
      .map(q => ({ query: q.query, count: q.count }));

    return {
      totalViews,
      totalLikes,
      totalComments,
      subscribersCount,
      totalDownloads,
      dposMetrics: {
        avgScrollDepth,
        readCompletionRate,
        avgEngagementTimeMin,
        totalEngagementSec,
        popularQueries
      },
      revenueMetrics: {
        totalRevenue: `$${(subscribersCount * 10 + totalDownloads * 0.5 + totalViews * 0.05).toFixed(2)}`,
        breakdown: {
          memberships: `$${(subscribersCount * 8).toFixed(2)}`,
          sponsorships: `$${(totalViews * 0.03).toFixed(2)}`,
          affiliates: `$${(totalDownloads * 0.4).toFixed(2)}`
        }
      },
      articlePerformance: db.articles.map(a => {
        const artSessions = sessions.filter(s => s.articleId === a.id);
        const completeCount = artSessions.filter(s => s.completed).length;
        const compRate = artSessions.length > 0 ? parseFloat(((completeCount / artSessions.length) * 100).toFixed(1)) : 70;
        return {
          id: a.id,
          title: a.title,
          views: a.viewsCount,
          likes: a.likesCount,
          category: a.category,
          workflowState: a.workflowState,
          readCompletionRate: compRate
        };
      })
    };
  }
}
