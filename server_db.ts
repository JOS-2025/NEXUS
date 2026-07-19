import fs from 'fs';
import path from 'path';
import { 
  Article, 
  Category, 
  Tag, 
  Comment, 
  Subscriber, 
  Resource, 
  AITool, 
  TopicCluster, 
  ReadingSession, 
  ReaderProfile, 
  KnowledgeHubGuide, 
  SearchQueryAnalytics,
  DBStructure,
  TaskChecklistItem,
  ActivityHistoryItem,
  Revision
} from './src/types.js';

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
      content: `In the modern digital landscape, web typography and eye-strain-friendly color pairing have moved from nice-to-haves to absolute product requirements.\n\n### The Sophisticated Dark Aesthetic\nGone are the days of harsh absolute blacks (#000000) and aggressive contrasting neon accents. High-end modern publishing interfaces utilize a soft, ambient, layered hierarchy:\n- **Deep Base Canvas**: #050505 (pitch charcoal) or #0a0a0a\n- **Floating Cards**: #0f0f0f or #121212 styled with a subtle border of rgba(255, 255, 255, 0.08)\n- **Muted Accents**: Brand glowing accents like Molten Amber, Copper Orange (#F27D26), or Cosmic Slate. These colors direct focus without triggering visual fatigue.\n\nBy binding these properties directly into tailwindcss custom theme variables via CSS @theme rules, we can toggle entire color schemes dynamically and establish fluid transitions on hover states seamlessly.`,
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
      ],
      pros: [
        "Incredibly fluid multi-file editing with Agent mode",
        "Full support for VS Code extensions and settings out of the box",
        "Blazing fast local indexing of large repositories",
        "Intuitive in-line terminal chat and shell command suggestions"
      ],
      cons: [
        "Can become memory-intensive on very large workspace structures",
        "Requires active internet connection for advanced remote LLM queries",
        "Subscription model can be costly for solo developers"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"
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
      ],
      pros: [
        "Industry-leading 2M token context window support",
        "Flawless native JSON schema enforcement for structured outputs",
        "Very generous free tier rates for active developers",
        "Robust support for audio, video, and PDF multimodal inputs"
      ],
      cons: [
        "Console interface can occasionally feel overwhelming to non-technical users",
        "Latency might spike slightly during heavy system congestion",
        "Web search grounding features require specific consent setups"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
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
      ],
      pros: [
        "Outputs extremely clean, responsive Tailwind CSS utility layouts",
        "Integrated playground allows instantaneous direct previewing",
        "Generates interactive component logic with real React state hooks",
        "Exports seamlessly to standard shadcn/ui architectures"
      ],
      cons: [
        "Complex state management architectures might require manual post-cleanup",
        "Free tier limit is consumed relatively quickly during active iteration",
        "Sometimes hallucinating non-existent third-party module imports"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=800"
      ]
    },
    {
      id: "tool-4",
      name: "Claude 3.5 Sonnet",
      description: "Anthropic's state-of-the-art language model, renowned for exceptional code reasoning, high-nuance prose writing, and interactive visual Artifacts.",
      category: "Artificial Intelligence",
      rating: 4.9,
      pricingType: "Freemium",
      url: "https://anthropic.com",
      features: [
        "Artifacts live preview",
        "Advanced code reasoning",
        "High-nuance prose",
        "200k token context window"
      ],
      affiliateUrl: "https://anthropic.com/?ref=nexus",
      logoUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=150",
      alternatives: [
        "ChatGPT Plus",
        "Gemini Advanced",
        "DeepSeek Chat"
      ],
      reviews: [
        {
          author: "David K.",
          rating: 5,
          content: "The Artifacts interface changed the way I build rapid web prototypes. Absolute class.",
          date: "2026-07-05"
        }
      ],
      pros: [
        "Exceptional code-generation quality and logic troubleshooting",
        "Artifacts panel runs HTML/React outputs inline synchronously",
        "Conversational style is much less clinical and more collaborative",
        "Extremely powerful vision processing capabilities for diagrams"
      ],
      cons: [
        "Strict message usage caps during high system traffic hours",
        "Lacks native web search grounding in the standard console tier",
        "No voice synthesis interface comparable to GPT Advanced Voice"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"
      ]
    },
    {
      id: "tool-5",
      name: "Midjourney v6",
      description: "The premier generative image platform, offering unmatched photorealism, artistic style interpretation, text rendering, and advanced detail controls.",
      category: "Artificial Intelligence",
      rating: 4.8,
      pricingType: "Paid",
      url: "https://midjourney.com",
      features: [
        "Vast style parameters",
        "High-fidelity photorealism",
        "Inpainting and outpainting",
        "Fast GPU hour scaling"
      ],
      affiliateUrl: "https://midjourney.com/?ref=nexus",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150",
      alternatives: [
        "DALL-E 3",
        "Stable Diffusion XL",
        "Imagen 4"
      ],
      reviews: [
        {
          author: "Serena M.",
          rating: 4.8,
          content: "Unbelievable quality of cinematic realism. Hard to use anything else for conceptual artwork.",
          date: "2026-06-20"
        }
      ],
      pros: [
        "Flawless rendering of ambient lighting, skin textures, and macro detail",
        "Powerful direct control commands (--ar, --stylize, --chaos, --weird)",
        "Strong community gallery with thousands of copyable prompt styles",
        "Alpha web editor is extremely intuitive compared to Discord chat"
      ],
      cons: [
        "Completely lacks a direct free-to-use tier (paid subscription required)",
        "Interacting via Discord can feel disorganized for enterprise pipelines",
        "Copyright licensing conditions require pro tier plans for commercial use"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800"
      ]
    },
    {
      id: "tool-6",
      name: "Perplexity Pro",
      description: "An AI-powered conversational search engine providing cited real-time answers, comprehensive source outlines, and deep multi-step research agents.",
      category: "Productivity",
      rating: 4.9,
      pricingType: "Freemium",
      url: "https://perplexity.ai",
      features: [
        "Real-time search citation",
        "Copilot deep research agents",
        "File/URL context upload",
        "Model selection (Claude/GPT/Sonar)"
      ],
      affiliateUrl: "https://perplexity.ai/?ref=nexus",
      logoUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=150",
      alternatives: [
        "Google Search Grounding",
        "ChatGPT Search",
        "Phind"
      ],
      reviews: [
        {
          author: "Jordan F.",
          rating: 5,
          content: "Entirely replaced Google Search for my daily technical inquiries. The source listing is vital.",
          date: "2026-07-12"
        }
      ],
      pros: [
        "Extremely transparent source list citations for fact-verification",
        "Copilot agent guides searches sequentially through secondary questions",
        "Multi-model picker allows running Claude 3.5 Sonnet over query states",
        "Clean, collection-based thread organization with collaboration tools"
      ],
      cons: [
        "Can occasionally synthesize contradictory facts from low-tier SEO sites",
        "Deep research mode takes 1-2 minutes to construct large logs",
        "Free search tier has limited Copilot actions per 4 hours"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=800"
      ]
    },
    {
      id: "tool-7",
      name: "Make.com",
      description: "A visually immersive workflow automation platform that lets you design, build, and run complex multi-app pipelines with integrated AI logic.",
      category: "Entrepreneurship",
      rating: 4.7,
      pricingType: "Freemium",
      url: "https://make.com",
      features: [
        "Visual drag-and-drop builder",
        "Real-time error handling",
        "Complex router and branching logic",
        "Generative AI API integrations"
      ],
      affiliateUrl: "https://make.com/?ref=nexus",
      logoUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=150",
      alternatives: [
        "Zapier Central",
        "n8n.io",
        "Activepieces"
      ],
      reviews: [
        {
          author: "Toby W.",
          rating: 4.6,
          content: "Incredible visual flexibility. Much more cost-effective than Zapier for handling multi-step AI pipelines.",
          date: "2026-06-18"
        }
      ],
      pros: [
        "Infinite visual routing, mapping, and text-parsing flexibility",
        "Detailed historical logs with visual error debugging paths",
        "Significantly lower execution cost-per-operation than direct competitors",
        "Highly reliable webhooks interface with instant processing rates"
      ],
      cons: [
        "Slightly steeper learning curve for users who are not technical",
        "Advanced custom functions require specific Javascript-like syntax",
        "Free tier operations limit can expire quickly on high-frequency triggers"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
      ]
    },
    {
      id: "tool-8",
      name: "ElevenLabs",
      description: "The industry's most advanced, hyper-realistic voice synthesis, instant voice cloning, and audio content generation platform.",
      category: "Productivity",
      rating: 4.8,
      pricingType: "Freemium",
      url: "https://elevenlabs.io",
      features: [
        "Ultra-realistic voice synthesis",
        "Instant voice cloning",
        "Multilingual translation dubbing",
        "Sound effect generation"
      ],
      affiliateUrl: "https://elevenlabs.io/?ref=nexus",
      logoUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=150",
      alternatives: [
        "Play.ht",
        "Murf.ai",
        "OpenAI TTS"
      ],
      reviews: [
        {
          author: "Ethan H.",
          rating: 4.9,
          content: "The voice modulation is flawless. Clone quality is indistinguishable from my real speech.",
          date: "2026-07-10"
        }
      ],
      pros: [
        "Extraordinary capture of breath pauses, emotional tone, and inflections",
        "Clones voices using just 30-60 seconds of high-quality sample audio",
        "Excellent multi-dialect and pronunciation handling in over 29 languages",
        "Clean APIs allow scalable integration into games, readers, and video apps"
      ],
      cons: [
        "Character usage quotas on lower subscription tiers can be consumed fast",
        "Lacks integrated visual timeline editing for multi-track audio projects",
        "Requires strict verification checks to prevent malicious voice deepfakes"
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800"
      ]
    }
  ],
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
  readingSessions: [],
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
  knowledgeGuides: [
    {
      id: "guide-1",
      title: "The Comprehensive Guide to Prompt Engineering: Zero to Hero",
      slug: "comprehensive-guide-prompt-engineering-zero-hero",
      description: "A definitive structured playbook outlining advanced prompt templates, standard schemas, few-shot conditioning, and the ReAct reasoning model.",
      content: `# Prompt Engineering Master Guide\n\nPrompt engineering is the core art of programming Large Language Models using natural language. Rather than shooting in the dark, professional creators utilize structured logical formats to yield highly deterministic outputs.\n\n## Section 1: The Core Variables\nA bulletproof system prompt contains four specific structural pillars:\n1. **Context/Persona**: Define exactly what credentials the agent possesses.\n2. **Task**: Explicit instructions of the functional outcome desired.\n3. **Constraints**: Clear rules on what *not* to do (e.g. \"Do not generate mock API keys\").\n4. **Output Format**: Enforce structure (e.g. JSON, YAML, strict Markdown).\n\n## Section 2: Chain of Thought Reasoning\nForce models to output their mental logic sequentially using step-by-step prefixes:\n\`\`\`text\nSolve the puzzle. Before giving the final answer, outline your thoughts in a numbered list.\n\`\`\`\nThis simple conditioning yields up to a 60% jump in mathematical and logical accuracy.\n\n## Section 3: The ReAct Frame\nIntegrate reasoning loops with action-execution triggers. This allows the model to think, issue queries, observe responses, and iterate until completion. Use our seeded ReAct Prompt Pack inside the resource library for an absolute head-start.`,
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
      content: `# Launch & Validation Playbook\n\nMany founders make the critical mistake of building massive databases and complex backend interfaces before verifying if a single customer actually wants their product.\n\n## Section 1: The One-Pager Landing\nCreate a clean, visually polished responsive page explaining the core value proposition. Frame the core problem clearly.\n- **Hero Header**: Emphasize the exact time/effort saved (e.g. \"Review lease contracts in 30 seconds\").\n- **Visual Mockups**: Generate high-fidelity wireframes or mock illustrations.\n- **Primary CTA**: A simple email capture button or an \"Early Access\" pre-order field.\n\n## Section 2: Acquisition Loops\nDo not wait for SEO to kick in over months. Instead:\n1. Run target search keywords campaigns on specialized subreddits.\n2. Provide immediate direct value on community boards (Quora, IndieHackers).\n3. Connect custom domain tracking to verify engagement times.\n\n## Section 3: The Pre-Sale Threshold\nIf you collect over 100 emails within 5 days, or secure 5 pre-purchases via a standard Stripe sandbox checkout link, you have secured market validation. You are officially cleared to build the absolute leanest viable version of your SaaS.`,
      category: "Entrepreneurship",
      learningPath: "Zero-to-One Solopreneurship",
      difficulty: "Intermediate",
      durationMinutes: 18,
      relatedArticleIds: ["art-2"],
      relatedToolIds: ["tool-1", "tool-3"]
    }
  ],
  searchQueries: [
    { query: "gemini 3.5", count: 18, lastSearchedAt: "2026-07-08T09:40:00Z" },
    { query: "saas bootstrap", count: 12, lastSearchedAt: "2026-07-08T10:10:00Z" },
    { query: "tailwind dark mode", count: 8, lastSearchedAt: "2026-07-08T08:20:00Z" }
  ],
  cookieConsents: {}
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
          if (!this.cachedData.cookieConsents) { this.cachedData.cookieConsents = {}; modified = true; }
          
          if (!this.cachedData.notifications) { this.cachedData.notifications = []; modified = true; }
          if (!this.cachedData.notificationPreferences) { this.cachedData.notificationPreferences = {}; modified = true; }
          if (!this.cachedData.notificationTemplates || this.cachedData.notificationTemplates.length === 0) {
            this.cachedData.notificationTemplates = [
              {
                id: "tmpl-welcome",
                name: "Welcome Onboarding",
                subject: "Welcome to NeuraPulse, {{userName}}!",
                title: "Welcome to NeuraPulse! 🎉",
                body: "Hi {{userName}},\n\nThank you for joining NeuraPulse - your premier engine for AI, Technology, Productivity, and Entrepreneurship content. We're excited to have you on board!\n\nExplore our interactive hubs and customize your daily learning track.",
                category: "System",
                createdAt: new Date().toISOString()
              },
              {
                id: "tmpl-new-article",
                name: "New Article Alert",
                subject: "New Article: {{articleTitle}} by {{authorName}}",
                title: "New Post in {{category}} 🚀",
                body: "Hi {{userName}},\n\n{{authorName}} just published a brand-new article: \"{{articleTitle}}\".\n\nRead the full piece and join the professional discussion thread on our portal.",
                category: "Articles",
                createdAt: new Date().toISOString()
              },
              {
                id: "tmpl-breaking-news",
                name: "Breaking News Alert",
                subject: "🚨 Breaking: {{title}}",
                title: "🚨 Breaking Tech Alert",
                body: "Breaking update: \"{{title}}\". Click to read our analytical breakdown and industry impact coverage immediately.",
                category: "AI News",
                createdAt: new Date().toISOString()
              },
              {
                id: "tmpl-comment-reply",
                name: "Comment Reply",
                subject: "Someone replied to your discussion thread",
                title: "New Reply in Thread 💬",
                body: "Hi {{userName}},\n\nAnother reader has replied to your comment on \"{{articleTitle}}\". Click to check the thread.",
                category: "Replies",
                createdAt: new Date().toISOString()
              },
              {
                id: "tmpl-security-alert",
                name: "Security Notification",
                subject: "⚠️ NeuraPulse Security Alert",
                title: "⚠️ Security Event Alert",
                body: "Hello {{userName}},\n\nWe detected a security event or profile update ({{action}}) on your account at {{timestamp}}. If this wasn't you, please change your credentials immediately.",
                category: "Security",
                createdAt: new Date().toISOString()
              },
              {
                id: "tmpl-resource-release",
                name: "New Downloadable Resource",
                subject: "New Resource Released: {{resourceTitle}}",
                title: "New Resource Available! 🎁",
                body: "Hi {{userName}},\n\nWe just launched a new premium downloadable resource: \"{{resourceTitle}}\" ({{category}}).\n\nGet your copy now in the Knowledge Center.",
                category: "Resources",
                createdAt: new Date().toISOString()
              }
            ];
            modified = true;
          }
          if (!this.cachedData.notificationCampaigns) { this.cachedData.notificationCampaigns = []; modified = true; }
          if (!this.cachedData.notificationLogs) { this.cachedData.notificationLogs = []; modified = true; }
          if (!this.cachedData.notificationEvents) { this.cachedData.notificationEvents = []; modified = true; }
          if (!this.cachedData.notificationQueue) { this.cachedData.notificationQueue = []; modified = true; }
          if (!this.cachedData.pushSubscriptions) { this.cachedData.pushSubscriptions = []; modified = true; }
          if (!this.cachedData.emailSubscribers) { this.cachedData.emailSubscribers = []; modified = true; }
          if (!this.cachedData.automationRules || this.cachedData.automationRules.length === 0) {
            this.cachedData.automationRules = [
              { id: "rule-art-published", name: "On Article Published", triggerEvent: "article_published", templateId: "tmpl-new-article", isActive: true, delayMinutes: 0, createdAt: new Date().toISOString() },
              { id: "rule-comment-reply", name: "On Comment Reply", triggerEvent: "comment_reply", templateId: "tmpl-comment-reply", isActive: true, delayMinutes: 0, createdAt: new Date().toISOString() },
              { id: "rule-resource-added", name: "On Resource Added", triggerEvent: "resource_added", templateId: "tmpl-resource-release", isActive: true, delayMinutes: 0, createdAt: new Date().toISOString() },
              { id: "rule-security", name: "On Security Alert", triggerEvent: "security_event", templateId: "tmpl-security-alert", isActive: true, delayMinutes: 0, createdAt: new Date().toISOString() }
            ];
            modified = true;
          }
          if (!this.cachedData.campaignSegments || this.cachedData.campaignSegments.length === 0) {
            this.cachedData.campaignSegments = [
              { id: "seg-all", name: "All Registered Users", filters: {}, createdAt: new Date().toISOString() },
              { id: "seg-readers", name: "Only Registered Readers", filters: { userRoles: ["registered"] }, createdAt: new Date().toISOString() },
              { id: "seg-creators", name: "Content Creators (Authors & Editors)", filters: { userRoles: ["author", "editor"] }, createdAt: new Date().toISOString() },
              { id: "seg-ai-fans", name: "AI Interest Group", filters: { interestCategories: ["Artificial Intelligence"] }, createdAt: new Date().toISOString() },
              { id: "seg-entrepreneurs", name: "Entrepreneurship Group", filters: { interestCategories: ["Entrepreneurship"] }, createdAt: new Date().toISOString() }
            ];
            modified = true;
          }
          if (!this.cachedData.deliveryAttempts) { this.cachedData.deliveryAttempts = []; modified = true; }
          if (!this.cachedData.trackingEvents) { this.cachedData.trackingEvents = []; modified = true; }
          
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

  public static getComments(articleId: string): Comment[] {
    return this.load().comments.filter(c => c.articleId === articleId);
  }

  public static addComment(comment: Comment): Comment {
    const db = this.load();
    db.comments.push(comment);
    this.save(db);
    return comment;
  }

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
      const sum = tool.reviews.reduce((acc, r) => acc + r.rating, 0);
      tool.rating = parseFloat((sum / tool.reviews.length).toFixed(1));
      this.save(db);
    }
    return tool;
  }

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

  public static recordReadingSession(session: ReadingSession): void {
    const db = this.load();
    db.readingSessions.push(session);

    if (session.readerEmail && session.readerEmail.includes('@')) {
      const emailKey = session.readerEmail.toLowerCase();
      const profile = this.getReaderProfile(emailKey);
      
      profile.readingHistory.push({
        articleId: session.articleId,
        timestamp: session.timestamp
      });

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

  public static getGuides(): KnowledgeHubGuide[] {
    return this.load().knowledgeGuides;
  }

  public static getGuideBySlug(slug: string): KnowledgeHubGuide | undefined {
    return this.load().knowledgeGuides.find(g => g.slug === slug);
  }

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

  public static getMetrics() {
    const db = this.load();
    const totalViews = db.articles.reduce((acc, a) => acc + a.viewsCount, 0);
    const totalLikes = db.articles.reduce((acc, a) => acc + a.likesCount, 0);
    const totalComments = db.comments.length;
    const subscribersCount = db.subscribers.filter(s => s.status === 'subscribed').length;
    const totalDownloads = db.resources.reduce((acc, r) => acc + r.downloadsCount, 0);

    const sessions = db.readingSessions || [];
    const avgScrollDepth = sessions.length > 0 
      ? parseFloat((sessions.reduce((acc, s) => acc + s.scrollDepth, 0) / sessions.length).toFixed(1)) 
      : 74.5;
    const readCompletionRate = sessions.length > 0
      ? parseFloat(((sessions.filter(s => s.completed).length / sessions.length) * 100).toFixed(1))
      : 65.0;
    const totalEngagementSec = sessions.reduce((acc, s) => acc + s.engagementTimeSeconds, 0);
    const avgEngagementTimeMin = sessions.length > 0
      ? parseFloat(((totalEngagementSec / sessions.length) / 60).toFixed(1))
      : 3.8;

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

  public static getCookieConsent(email: string): any | null {
    const db = this.load();
    if (!db.cookieConsents) {
      db.cookieConsents = {};
    }
    const key = email.toLowerCase().trim();
    return db.cookieConsents[key] || null;
  }

  public static saveCookieConsent(email: string, consent: any): any {
    const db = this.load();
    if (!db.cookieConsents) {
      db.cookieConsents = {};
    }
    const key = email.toLowerCase().trim();
    const nowStr = new Date().toISOString();
    
    // Validate values to meet safety/validation requirements
    db.cookieConsents[key] = {
      userEmail: key,
      essential: true, // Always true
      analytics: !!consent.analytics,
      marketing: !!consent.marketing,
      functional: !!consent.functional,
      consentVersion: consent.consentVersion || "1.0.0",
      consentDate: consent.consentDate || nowStr,
      updatedAt: nowStr
    };
    
    this.save(db);
    return db.cookieConsents[key];
  }
}
