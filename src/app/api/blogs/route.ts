import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Blog } from '@/lib/models';

export const mockBlogs = [
  {
    _id: 'mock-1',
    title: 'The AI Moat Illusion: Why Models Aren’t Defensible Products',
    slug: 'the-ai-moat-illusion-why-models-arent-defensible-products',
    excerpt: 'Many founders think custom models will protect their startups. Here is why the actual defense is distribution, proprietary workflows, and exceptional user experience.',
    content: `
      <h2>The Mirage of the Proprietary Model</h2>
      <p>Over the last three years, billions of dollars have flowed into startups whose core value proposition is "we trained a custom LLM." However, as frontier models from OpenAI, Anthropic, and Google converge in capabilities and decline in cost, the defensibility of custom-trained model wrappers is rapidly approaching zero.</p>
      
      <blockquote>"The hard truth is that if your startup's only defense is the model itself, you are building on shifting sand."</blockquote>

      <h2>Defensibility Shifting to Workflows</h2>
      <p>True defensibility in the AI era is not about the weights of your model; it is about the workflow integrations. Modern products must embed themselves so deeply into user day-to-day operations that changing providers would cost weeks of disruption. Products like Linear, Stripe, and Notion did not win through unique math—they won through superior UX, speed, and workflow lock-in.</p>

      <h2>Distribution is the Kingmaker</h2>
      <p>If you don't have a unique distribution channel, you are paying rent to the platform layers. Building loops where every new customer helps refine your workflow or aggregates proprietary, non-public data is the single best way to survive the AI consolidation wave.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    category: 'AI',
    tags: ['AI', 'Startups', 'Product Strategy'],
    featured: true,
    published: true,
    isTrending: true,
    trendingRank: 1,
    featuredTrending: true,
    views: 1542,
    readingTime: 4,
    aiSummaryEnabled: true,
    audioEnabled: true,
    aiSummary: `Key Takeaways
• Proprietary models are losing their defensive moats as frontier LLMs commoditize.
• True AI startup defensibility lies in deep, integrated user workflows rather than algorithms.
• Exceptional UX and distribution are critical kingmakers for modern AI products.
• Proprietary data loops remain the most reliable way to maintain product advantages.
• Startups must avoid model wrapper traps by focusing on sticky, user-first interfaces.`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    seoTitle: 'The AI Moat Illusion - Defensibility in AI Startups',
    seoDescription: 'Why model training isn\'t a moat and how distribution and UX are the actual barriers to entry.',
    ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date('2026-06-18T10:00:00Z'),
    updatedAt: new Date('2026-06-18T10:00:00Z')
  },
  {
    _id: 'mock-2',
    title: 'How Linear Built a $100M Product Without a Sales Team',
    slug: 'how-linear-built-a-100m-product-without-a-sales-team',
    excerpt: 'Linear\'s growth strategy relies heavily on product-led growth (PLG) and relentless attention to detail. Let\'s analyze their design and performance choices.',
    content: `
      <h2>The Cult of Product Excellence</h2>
      <p>Linear has become the gold standard for modern issue trackers, but what is more impressive is how they did it. With almost zero traditional enterprise outbound sales, they built a developer community that actively advocates for their product inside Fortune 500 companies.</p>

      <h2>Speed as a Feature</h2>
      <p>In software, speed is not just a performance metric—it is the core user experience. Linear loads instantly. Every action takes under 100ms. By maintaining local-first databases on the client and syncing in the background, they created an interface that feels like a desktop application.</p>

      <h2>Opinionated Design</h2>
      <p>Most SaaS applications build configuration pages for everything. Linear took the opposite approach: they built an opinionated tool that implements a specific, optimal way of working. Instead of matching every competitor's feature, they simplified workflows to keep teams focused on writing code.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&w=1200&q=80',
    category: 'Startups',
    tags: ['Startups', 'Product-Led Growth', 'SaaS'],
    featured: false,
    published: true,
    isTrending: true,
    trendingRank: 2,
    featuredTrending: false,
    views: 1251,
    readingTime: 5,
    aiSummaryEnabled: true,
    audioEnabled: true,
    aiSummary: `Key Takeaways
• Linear built a massive SaaS audience by focusing on product quality over sales reps.
• Client-side speed and instant sub-100ms interactions are primary product values.
• An opinionated design path reduces cognitive friction compared to highly configurable tools.
• Product-led growth (PLG) relies on turning active users into community advocates.
• Optimizing core workflows is more valuable than checking off random feature requests.`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    seoTitle: 'How Linear Scale without Sales - Product Led Growth Case Study',
    seoDescription: 'Decoding Linear\'s design decisions, performance tactics, and product-led growth strategy.',
    ogImage: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date('2026-06-19T08:30:00Z'),
    updatedAt: new Date('2026-06-19T08:30:00Z')
  },
  {
    _id: 'mock-3',
    title: 'The Stripe Engine: Decoding the Developer Growth Flywheel',
    slug: 'the-stripe-engine-decoding-the-developer-growth-flywheel',
    excerpt: 'How Stripe conquered online payments by prioritizing developers, creating world-class documentation, and building a self-reinforcing developer loop.',
    content: `
      <h2>Solving a Hard Technical Problem with 7 Lines of Code</h2>
      <p>Stripe revolutionized online payments by replacing weeks of merchant account approvals and bank integrations with seven lines of clean copy-pasteable JavaScript code. They focused on the developer, a user persona that was previously ignored by conservative payment institutions.</p>

      <h2>Documentation as Marketing</h2>
      <p>Stripe’s documentation is famous for its visual layout, keyboard shortcuts, and interactive inline code playgrounds. By treating documentation as a tier-1 product rather than a chore, they created a standard that developers fell in love with.</p>

      <h2>The API Defensibility</h2>
      <p>By building a clean API structure, Stripe integrated itself into millions of applications. The cost of switching away from an embedded checkout, billing logic, and sub-merchant flow is incredibly high. Defensibility was achieved through APIs.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    category: 'Growth',
    tags: ['Growth', 'APIs', 'Developer Experience'],
    featured: false,
    published: true,
    isTrending: true,
    trendingRank: 3,
    featuredTrending: false,
    views: 984,
    readingTime: 6,
    aiSummaryEnabled: true,
    audioEnabled: true,
    aiSummary: `Key Takeaways
• Stripe grew rapidly by transforming complex banking systems into simple lines of code.
• Interactive, developer-first documentation served as a highly effective marketing engine.
• API integration acts as a powerful barrier to entry by increasing customer switching costs.
• Providing developers with clean, reliable tooling creates immediate product advocates.
• Modern growth relies on making technical implementation steps frictionless.`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    seoTitle: 'Stripe\'s Developer Experience & Growth Strategy',
    seoDescription: 'Learn how Stripe used developer marketing, clean APIs, and premium documentation to rule online payments.',
    ogImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date('2026-06-20T12:00:00Z'),
    updatedAt: new Date('2026-06-20T12:00:00Z')
  },
  {
    _id: 'mock-4',
    title: 'The Pre-Seed Survival Guide: Raising Capital in 2026',
    slug: 'the-pre-seed-survival-guide-raising-capital-in-2026',
    excerpt: 'Valuations are tightening, and milestones are shifting. Here is what VCs are looking for in pre-seed pitches, metrics, and founder profiles today.',
    content: `
      <h2>The Shift in Capital Markets</h2>
      <p>The days of raising a $3M pre-seed round on a slide deck and a dream are gone. In 2026, venture capital firms have raised their requirements. Founders need more than an idea; they need initial proof of traction, mockups that work, and a clear path to early revenue.</p>

      <h2>What VCs Look For Now</h2>
      <p>1. Founder-Market Fit: VCs want to know why you are uniquely qualified to solve this problem.<br/>2. Customer Discovery Insights: Proof that you have talked to 100+ target users and have deep insight into their problems.<br/>3. Speed of Execution: Evidence of how fast you build and ship.</p>

      <h2>The Ideal Pre-Seed Pitch</h2>
      <p>Focus on the problem size, your proprietary insights, and what milestones the funding will unlock. Aim to prove that with $1M, you can build a stable product and cross the $20k MRR threshold to qualify for seed funding.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    category: 'Fundraising',
    tags: ['Fundraising', 'Venture Capital', 'Pitching'],
    featured: false,
    published: true,
    isTrending: true,
    trendingRank: 4,
    featuredTrending: false,
    views: 871,
    readingTime: 5,
    aiSummaryEnabled: true,
    audioEnabled: true,
    aiSummary: `Key Takeaways
• Raising early venture capital now requires initial customer validation and working mockups.
• VCs focus heavily on Founder-Market Fit and customer discovery interviews.
• Pitch decks should clearly define what product milestones will be unlocked by the funding.
• Demonstrating speed of execution is critical for early-stage teams seeking capital.
• Capital efficiency and clear paths to early MRR are preferred over growth at all costs.`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    seoTitle: 'Pre-Seed Fundraising Guide 2026 - Venture Capital Tips',
    seoDescription: 'Step-by-step advice for early stage founders raising pre-seed capital in a tight macroeconomic climate.',
    ogImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date('2026-06-21T09:00:00Z'),
    updatedAt: new Date('2026-06-21T09:00:00Z')
  },
  {
    _id: 'mock-5',
    title: 'Notion’s Scaling Blueprint: Managing 50M+ Users with a Small Team',
    slug: 'notions-scaling-blueprint-managing-50m-users-with-a-small-team',
    excerpt: 'Behind Notion\'s lightweight operations setup, system designs, and community champions program that enabled massive global scale.',
    content: `
      <h2>Lean Operations at Scale</h2>
      <p>For a long time, Notion had less than 100 employees while serving tens of millions of active users. They avoided bloating their headcount by creating a highly leveraged community model and using automated customer service workflows.</p>

      <h2>The Power of Notion Champions</h2>
      <p>Notion did not just build a tool; they fostered a movement. Their "Notion Champions" program turned power users into content creators, template builders, and trainers. This viral word-of-mouth distribution offset millions in marketing spend.</p>

      <h2>System Design for Flexibility</h2>
      <p>Notion's block model allows users to build their own tools. This customization reduces the demand for custom feature requests, as users can construct CRM databases, wikis, and project planners themselves using building blocks.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    category: 'Operations',
    tags: ['Operations', 'Scaling', 'Community'],
    featured: false,
    published: true,
    isTrending: true,
    trendingRank: 5,
    featuredTrending: false,
    views: 765,
    readingTime: 7,
    aiSummaryEnabled: true,
    audioEnabled: true,
    aiSummary: `Key Takeaways
• Notion scaled to 50M+ users with a small team using leveraged operational strategies.
• The "Notion Champions" community program served as a major marketing and support engine.
• Flexible block-based system architecture lets users customize their own software solutions.
• Providing template-building capabilities turns customers into active product distributors.
• Automation and self-serve documentation offset headcount scaling requirements.`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    seoTitle: 'Notion Operations Blueprint - Scaling a Small Team',
    seoDescription: 'Case study on Notion\'s lean organizational structure, community growth, and block model architecture.',
    ogImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date('2026-06-21T11:15:00Z'),
    updatedAt: new Date('2026-06-21T11:15:00Z')
  },
  {
    _id: 'mock-6',
    title: 'The Morning Brew Growth Playbook: Landing 4M+ Subscribers',
    slug: 'the-morning-brew-growth-playbook-landing-4m-subscribers',
    excerpt: 'From college newsletters to a $75M exit. The exact viral referral loops, content strategies, and cross-channel flywheels Morning Brew used.',
    content: `
      <h2>The Referral Engine</h2>
      <p>Morning Brew grew from a university newsletter into a dominant business media brand. The heart of their growth was a customized, gamified email referral engine. Readers earned swag, premium Sunday editions, and access to exclusive communities by inviting friends.</p>

      <h2>Relatable Editorial Voice</h2>
      <p>Before Morning Brew, business newsletters were dry and formal. By writing in a conversational, witty, and engaging tone—like a smart friend explaining the news—they built intense subscriber loyalty.</p>

      <h2>Optimizing for Inbox Placement</h2>
      <p>Inbox delivery is critical. Morning Brew optimized their deliverability by pruning inactive subscribers and keeping code structures minimal, ensuring they always landed in the primary tab.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    category: 'Marketing',
    tags: ['Marketing', 'Newsletters', 'Referrals'],
    featured: false,
    published: true,
    isTrending: false,
    trendingRank: 0,
    featuredTrending: false,
    views: 630,
    readingTime: 5,
    aiSummaryEnabled: true,
    audioEnabled: false,
    aiSummary: `Key Takeaways
• Morning Brew catalyzed subscriber growth via a gamified referral rewards structure.
• Conversational and witty copywriting established unique, high-engagement loyalty.
• Relentless list-hygiene and minimal email sizing protected inbox deliverability.
• Providing daily business briefings in 5 minutes catered to busy young professionals.
• Cross-promotion and clear visual headers maximized open-rate retention.`,
    audioUrl: '',
    seoTitle: 'Morning Brew Growth Referral Loop Breakdown',
    seoDescription: 'How Morning Brew built a custom newsletter referral engine and sold for $75 million.',
    ogImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date('2026-06-21T12:00:00Z'),
    updatedAt: new Date('2026-06-21T12:00:00Z')
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    try {
      await connectDB();
      const query: any = { published: true };
      
      if (category && category !== 'All') {
        // Find category slug or name matching
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      let sortQuery: any = { createdAt: -1 };
      if (sort === 'views') {
        sortQuery = { views: -1 };
      } else if (sort === 'trending') {
        sortQuery = { isTrending: -1, trendingRank: 1, createdAt: -1 };
      }

      const total = await Blog.countDocuments(query);
      const blogs = await Blog.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

      return NextResponse.json({ blogs, total, page, totalPages: Math.ceil(total / limit) });
    } catch (dbError) {
      console.warn('Database error in GET /api/blogs, falling back to mock data', dbError);
      
      let filtered = mockBlogs.filter(b => b.published);

      if (category && category !== 'All') {
        filtered = filtered.filter(b => b.category.toLowerCase() === category.toLowerCase());
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(b => 
          b.title.toLowerCase().includes(s) || 
          b.excerpt.toLowerCase().includes(s) || 
          b.content.toLowerCase().includes(s)
        );
      }

      if (sort === 'views') {
        filtered = filtered.sort((a, b) => b.views - a.views);
      } else if (sort === 'trending') {
        filtered = filtered.sort((a, b) => {
          if (a.isTrending && !b.isTrending) return -1;
          if (!a.isTrending && b.isTrending) return 1;
          return a.trendingRank - b.trendingRank;
        });
      } else {
        // default latest
        filtered = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      const paginated = filtered.slice(skip, skip + limit);
      return NextResponse.json({
        blogs: paginated,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit)
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    try {
      await connectDB();
      const blog = await Blog.create(body);
      return NextResponse.json(blog, { status: 201 });
    } catch (dbError) {
      console.warn('DB create failed, creating mock in memory');
      const newBlog = {
        _id: String(Date.now()),
        ...body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockBlogs.push(newBlog);
      return NextResponse.json(newBlog, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
