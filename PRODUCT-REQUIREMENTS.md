# DOCENT Platform - Product Requirements Document

**Version**: 1.0
**Date**: November 2025
**Status**: Vision / Strategic Planning

---

## Executive Summary

DOCENT is a platform that transforms how readers experience complex fantasy literature through AI-powered reading companions, community features, and creator-first tools. At its core is **Rowan**, an AI guide that makes epic fantasy accessible, comprehensible, and social—without spoilers.

### Vision Statement

**Make complex fantasy literature universally accessible while building sustainable infrastructure for authors, publishers, and fan communities.**

### Core Value Propositions

**For Fantasy Veterans:**
Rowan makes big fantasy less of a memory test and more of a guided journey—so you can dive into the deep, weird, wonderful stuff without getting lost.

**For Newcomers:**
Rowan is a calm, spoiler-safe guide that lets you finally start the big fantasy series everyone loves—without feeling confused, behind, or shut out of the conversation.

---

## Market Opportunity

### Problem Space

1. **Barrier to Entry**: Complex fantasy series (Sanderson, Martin, Jordan) intimidate new readers
2. **Memory Tax**: Long series with years between books create recall challenges
3. **Spoiler Minefield**: Googling questions or joining communities risks major spoilers
4. **Isolated Experience**: Reading is solitary; no safe way to discuss in real-time without spoilers
5. **Creator Disconnect**: Authors lack direct engagement tools during the reading experience
6. **Publisher Blindness**: Limited insights into how readers actually experience books

### Target Audiences

**Primary Users:**
- Fantasy readers (ages 18-45) reading or wanting to read complex series
- Book club organizers struggling with spoiler management
- Authors with existing series seeking deeper reader engagement
- Publishers wanting reading analytics and retention data

**Secondary Users:**
- Fantasy content creators (BookTube, BookTok, podcasters)
- Book retailers seeking value-add services
- Fan communities and Discord groups

### Market Size

- **Fantasy Publishing Market**: $590M+ annually (US alone)
- **Digital Reading Tools**: Growing segment of $26B ebook market
- **Target Series**: 50+ major fantasy series with 100K+ active readers each
- **Addressable Market**: 5M+ active epic fantasy readers in English-speaking markets

---

## Product Strategy

### Phased Rollout

**Phase 1: MVP - Rowan Solo (Current)**
- Single AI companion (Rowan)
- 3 pilot books with hand-crafted chapter notes
- Basic chat interface
- Feedback collection

**Phase 2: Creator Platform (Q1-Q2 2026)**
- Multiple guide personalities
- Creator guide marketplace
- Author-verified content
- Enhanced reading analytics

**Phase 3: Social Reading (Q2-Q3 2026)**
- Spoiler-safe reading circles
- Progress-synced discussions
- Community features

**Phase 4: Ecosystem (Q3 2026+)**
- Publisher partnerships
- Newsletter integration
- Digital asset marketplace
- Advanced analytics dashboard

---

## Feature Requirements

## 1. AI Reading Companions

### 1.1 Rowan (Core Companion)

**Description**: The foundational AI guide with a warm, scholarly personality designed for general fantasy reading.

**Requirements**:
- ✅ Spoiler-safe architecture (progress-aware responses)
- ✅ Chapter-by-chapter knowledge boundaries
- ✅ Warm, encouraging personality
- ✅ Handles: recaps, character explanations, world-building, confusion diagnosis
- 🔲 Multi-book series awareness (knowledge carries forward)
- 🔲 Reading history tracking across sessions
- 🔲 Proactive "check-in" prompts at key story moments

**Success Metrics**:
- User satisfaction rating >4.5/5
- <5% spoiler complaint rate
- Average session length >8 minutes
- 60%+ return rate within 7 days

---

### 1.2 Guide Personalities (Phase 2)

**Description**: Specialized AI companions with different reading styles and focuses.

**Planned Guide Types**:

#### 1.2.1 The Analyst
- **Personality**: Sharp, tactical, pattern-focused
- **Best For**: Readers who love foreshadowing, magic systems, plot mechanics
- **Voice**: "Notice how Sanderson set up that payoff 400 pages ago..."
- **Features**:
  - Highlights foreshadowing elements
  - Explains magic system rules
  - Tracks plot threads and mysteries
  - Pattern recognition across series

#### 1.2.2 The Character Guide
- **Personality**: Empathetic, relationship-focused, emotional
- **Best For**: Readers invested in character arcs and relationships
- **Voice**: "Let's talk about why Kaladin made that choice..."
- **Features**:
  - Character motivation analysis
  - Relationship dynamics tracking
  - Emotional arc explanations
  - Character development insights

#### 1.2.3 The Vibes Curator
- **Personality**: Atmospheric, aesthetic, immersive
- **Best For**: Readers who love world-building, atmosphere, sensory details
- **Voice**: "This chapter has such a haunted library energy..."
- **Features**:
  - Thematic connections
  - Aesthetic/mood highlights
  - World-building deep dives
  - Symbolism exploration

#### 1.2.4 The Loremaster
- **Personality**: Encyclopedic, detailed, wiki-like
- **Best For**: Readers who want comprehensive world knowledge
- **Voice**: "The history of this kingdom goes back 2000 years..."
- **Features**:
  - Extensive world history
  - Timeline management
  - Cultural context
  - Map and geography references

**Technical Requirements**:
- User can switch between guides mid-read
- Conversation history maintains context across guide switches
- Each guide accesses same knowledge base but filters/presents differently
- Personality consistency via prompt engineering + version control

**Success Metrics**:
- Users try 2+ guides within first month: >40%
- Guide preference distribution: no single guide >60% (proves variety works)
- Personality consistency rating: >4.2/5

---

## 2. Creator & Author Guides

### 2.1 Author-Created Guides

**Description**: Official guides created by authors to provide their intended reading experience.

**Use Cases**:
- Brandon Sanderson creates "Cosmere Connection Guide" highlighting Easter eggs
- Author provides "First-Time Reader" vs "Re-Reader" experiences
- Behind-the-scenes insights at specific chapter milestones
- Author answers FAQs at safe progress points

**Requirements**:
- 🔲 Author dashboard for guide creation
- 🔲 Chapter-by-chapter content editor
- 🔲 Preview/testing mode
- 🔲 Analytics on guide usage and reader questions
- 🔲 Verified author badge
- 🔲 Revenue share model for premium guides

**Creator Tools**:
- Markdown editor for chapter notes
- Spoiler boundary testing tools
- Question bank (seed common questions + answers)
- Media upload (maps, character art, diagrams)
- Analytics dashboard (what readers ask most)

**Monetization**:
- Free tier: Basic guide (included with book purchase verification)
- Premium tier: $2.99-9.99 for enhanced guides with exclusive content
- Revenue split: 70% creator / 30% platform

**Success Metrics**:
- 10+ author partnerships in Year 1
- 50K+ readers engage with author guides
- Average guide rating >4.3/5
- 20%+ conversion to premium guides

---

### 2.2 Creator Marketplace

**Description**: Third-party creators (BookTubers, podcasters, superfans) can create specialized guides.

**Examples**:
- "Stormlight Archive - Comedy Recap Guide" by popular BookTuber
- "Wheel of Time - Romance Focus Guide"
- "Malazan - Military Strategy Analysis"
- "First Law - Grimdark Survival Guide"

**Requirements**:
- 🔲 Creator application + vetting process
- 🔲 Quality standards and review process
- 🔲 Creator profile pages
- 🔲 Guide discovery (browse, search, recommendations)
- 🔲 User ratings and reviews
- 🔲 Revenue share model

**Quality Controls**:
- Manual review of first guide submission
- Community reporting for spoilers
- Automated spoiler detection (ML-based)
- Rating threshold for visibility (>3.5/5 to remain listed)

**Success Metrics**:
- 50+ vetted creators in Year 1
- 200+ unique guides across 20+ series
- Guide marketplace GMV: $100K+ in Year 1
- Creator satisfaction: >4.0/5

---

## 3. Spoiler-Safe Reading Circles

### 3.1 Core Concept

**Description**: Small groups (3-15 people) read together with progress-synced discussions powered by Rowan.

**Key Features**:
- Progress tracking: System knows where each member is
- Spoiler barriers: Cannot see messages from readers ahead of your progress
- Rowan moderation: AI checks messages for spoilers before posting
- Async + real-time: Works for different reading paces

### 3.2 User Flows

#### Creating a Circle:
1. User creates circle for specific book/series
2. Sets reading pace (chapters per week, dates)
3. Invites friends via link or email
4. Optional: Makes circle public/discoverable

#### Joining a Circle:
1. User browses public circles or receives invite
2. Declares current progress in book
3. Joins conversation at their level
4. Gets matched with others at similar progress

#### Reading Together:
1. Circle chat shows messages only from members at/behind your progress
2. Rowan can answer questions for the whole group
3. Milestone celebrations (everyone reaches Chapter 20!)
4. Optional reading pace reminders

### 3.3 Technical Requirements

**Spoiler Prevention**:
- 🔲 Progress-based message filtering
- 🔲 AI spoiler detection on user messages
- 🔲 Warning system for potential spoilers
- 🔲 Moderator tools (circle creator can manually hide messages)

**Circle Management**:
- 🔲 Reading pace scheduler
- 🔲 Progress tracking per member
- 🔲 Notifications (new messages, milestone reached)
- 🔲 Circle analytics (participation, completion rate)

**Rowan Integration**:
- 🔲 Rowan as group facilitator
- 🔲 Group questions ("Can Rowan explain this for everyone?")
- 🔲 Discussion prompts at key chapters
- 🔲 Recap generation for those who fall behind

### 3.4 Circle Types

**Private Circles**: Friends, book clubs, invite-only
**Public Circles**: Open to join, discoverable in app
**Event Circles**: Time-bound (30-day Stormlight readathon)
**Buddy Circles**: 1:1 reading partners

### 3.5 Success Metrics
- Circles created: 1,000+ in Year 1
- Active circle participation rate: >60%
- Messages per circle per week: >20
- Circle completion rate (finish book together): >40%
- NPS for circle members: >50

---

## 4. Reading Analytics & Publisher Insights

### 4.1 Reader-Facing Analytics

**Description**: Personal reading dashboard showing insights into reading habits.

**Features**:
- 🔲 Reading pace tracking (pages/day, chapters/week)
- 🔲 Series progress visualization
- 🔲 Time spent reading (via app engagement)
- 🔲 Questions asked (what confused you most)
- 🔲 Favorite characters/themes (inferred from conversations)
- 🔲 Reading streaks and milestones
- 🔲 Year in review (Spotify Wrapped style)

**Privacy**:
- User controls what data is collected
- Opt-in for sharing with authors/publishers
- Anonymous aggregation for platform insights

---

### 4.2 Author/Publisher Dashboard

**Description**: Aggregate insights into how readers experience books.

**Key Metrics**:

**Engagement Metrics**:
- Active readers per book/series
- Chapter-by-chapter drop-off rates
- Average reading pace
- Re-read rate
- Series completion rate

**Comprehension Metrics**:
- Most confusing chapters (high question volume)
- Most asked questions by chapter
- Character confusion rates
- World-building clarity scores

**Emotional Metrics**:
- Reader sentiment by chapter (inferred from questions/feedback)
- Favorite moments (high engagement spikes)
- Controversial moments (mixed sentiment)

**Community Metrics**:
- Reading circle formation rate
- Social sharing rate
- Guide engagement rate
- Fan content creation

**Example Insights**:
- "Chapter 23 has 3x higher confusion rate than average - consider adding glossary"
- "68% of readers ask about magic system in Chapter 5 - opportunity for clearer explanation"
- "Readers who finish Book 1 have 78% series completion rate"
- "Character X has highest question volume - potential spin-off interest"

### 4.3 Use Cases

**For Authors**:
- Improve future books based on reader confusion patterns
- Identify spin-off opportunities
- Understand what resonates emotionally
- Validate world-building complexity

**For Publishers**:
- Predict series success based on Book 1 completion rates
- Optimize marketing based on favorite moments
- Identify struggling readers for retention campaigns
- Data-driven acquisition decisions

**For Retailers**:
- Personalized recommendations based on reading patterns
- Targeted promotions for series continuations
- Bundle opportunities (readers who loved X also need Y)

### 4.4 Technical Requirements

- 🔲 Privacy-first data architecture (GDPR/CCPA compliant)
- 🔲 Aggregate anonymization pipeline
- 🔲 Real-time dashboard for authors/publishers
- 🔲 Export capabilities (CSV, API access)
- 🔲 Benchmark comparisons (how does my book compare to similar titles)

### 4.5 Monetization

**Pricing Tiers**:
- **Free**: Basic metrics (active readers, completion rate)
- **Pro** ($99/month): Full analytics suite, export, API access
- **Enterprise** (Custom): White-label, advanced segmentation, dedicated support

**Success Metrics**:
- Publisher partnerships: 5+ major publishers in Year 1
- Author dashboard users: 100+ in Year 1
- Enterprise contracts: 2+ in Year 1
- Analytics ARR: $50K+ in Year 1

---

## 5. Newsletter Integration

### 5.1 Concept

**Description**: Authors and creators can send spoiler-safe newsletters to readers based on their progress.

**Use Cases**:
- Author sends "Just finished Chapter 15?" email with behind-the-scenes
- Creator shares weekly discussion prompts for reading circle
- Publisher sends "You're 60% through - here's what other readers loved"

### 5.2 Features

**Progress-Triggered Emails**:
- 🔲 Author configures emails by chapter milestone
- 🔲 Readers auto-receive when they hit that progress
- 🔲 Spoiler boundaries enforced (can't send future content)

**Newsletter Types**:
- Author commentary
- Bonus content unlocks
- Community highlights
- Reading circle recaps
- Merchandise/event announcements

**User Controls**:
- 🔲 Opt-in/opt-out per author
- 🔲 Frequency preferences
- 🔲 Newsletter archive in app

### 5.3 Technical Requirements

- 🔲 Email service integration (SendGrid, Mailchimp)
- 🔲 Progress-based trigger system
- 🔲 Newsletter builder for creators
- 🔲 Analytics (open rate, click rate, unsubscribe rate)
- 🔲 Spoiler detection on newsletter content

### 5.4 Success Metrics

- Authors using newsletters: 20+ in Year 1
- Newsletters sent: 50K+ in Year 1
- Average open rate: >35%
- Unsubscribe rate: <5%

---

## 6. Digital Assets Marketplace

### 6.1 Concept

**Description**: Curated marketplace for fantasy art, maps, companion materials unlocked by reading progress.

**Asset Types**:

**Official Content**:
- Character art (official)
- Maps and geography
- Magic system diagrams
- Timeline visualizations
- Audio snippets (author readings)
- Deleted scenes
- Character playlists

**Fan Content**:
- Fan art (vetted)
- Cosplay guides
- Recipes (Stormlight stew!)
- Crafts and DIY
- Music and playlists

### 6.2 Spoiler-Safe Unlocks

**Progress Gating**:
- Assets tagged with spoiler level (safe through Chapter X)
- Users can only access assets at/behind their progress
- "You've unlocked 5 new art pieces!" notifications

**Discovery**:
- Browse by book/series
- Filter by type (art, maps, audio)
- Curated collections ("Essential Stormlight Maps")

### 6.3 Monetization

**Revenue Models**:
- Free tier: Basic maps, character reference
- Premium: $0.99-4.99 per asset or $9.99/month subscription
- Creator revenue share: 70/30 split

**Bundles**:
- "Complete Stormlight Art Pack" - $19.99
- "Author's Favorites Collection" - $14.99

### 6.4 Technical Requirements

- 🔲 Asset upload and management system
- 🔲 Spoiler tagging and enforcement
- 🔲 Payment processing (Stripe)
- 🔲 DRM/watermarking for purchased assets
- 🔲 Creator payout system
- 🔲 Mobile-optimized asset viewer

### 6.5 Success Metrics

- Assets in marketplace: 500+ in Year 1
- Monthly active buyers: 2,000+
- Marketplace GMV: $50K+ in Year 1
- Creator satisfaction: >4.2/5

---

## Technical Architecture

### System Components

**Frontend**:
- Web app (React/Next.js) - current focus
- iOS app (React Native) - Phase 2
- Android app (React Native) - Phase 2
- Browser extension (future consideration)

**Backend**:
- Node.js/Express API
- PostgreSQL (user data, progress, circles)
- Vector database (chapter embeddings, semantic search)
- Redis (caching, sessions)

**AI/ML Layer**:
- OpenAI GPT-4o-mini (primary)
- Custom fine-tuned models (future)
- Embeddings for chapter search
- Spoiler detection ML model

**Third-Party Integrations**:
- Stripe (payments)
- SendGrid (email)
- Google Sheets (temp logging - migrate to proper DB)
- Cloud storage (S3 for assets)
- Analytics (Mixpanel/Amplitude)

### Scalability Considerations

**Current MVP** (< 1K users):
- Single server deployment
- Vercel hosting
- Google Sheets logging

**Phase 2** (1K-10K users):
- Migrate to proper database
- Implement caching layer
- Queue system for async tasks
- CDN for static assets

**Phase 3** (10K-100K users):
- Microservices architecture
- Load balancing
- Database sharding
- Real-time infrastructure (WebSockets)

### Data Architecture

**User Data**:
- User profile (preferences, settings)
- Reading progress (per book/series)
- Conversation history (last 10 messages cached)
- Circle memberships
- Analytics events

**Content Data**:
- Book metadata
- Chapter notes (author-created + hand-crafted)
- Guide personalities
- Asset metadata
- Creator profiles

**Privacy & Security**:
- End-to-end encryption for private circles
- GDPR/CCPA compliance
- Data retention policies
- User data export/deletion

---

## Business Model

### Revenue Streams

**1. Consumer Subscriptions** (Primary)
- **Free Tier**: 10 questions/month, basic Rowan, no circles
- **Individual** ($9.99/month): Unlimited questions, all guides, 3 circles
- **Enthusiast** ($19.99/month): Premium guides, unlimited circles, early access
- **Annual Discount**: 20% off (2 months free)

**2. Creator Monetization** (Platform Fee Model)
- Premium guides: 30% platform fee
- Digital assets: 30% platform fee
- Newsletter sponsorships: 20% platform fee

**3. B2B (Publishers/Authors)**
- Analytics Dashboard: $99-499/month
- White-label solutions: Custom pricing
- API access: $299/month

**4. Partnerships**
- Book retailer referrals (Amazon, Bookshop.org): 3-5% affiliate fee
- Publisher content partnerships: Custom deals

### Unit Economics (Year 1 Projections)

**Assumptions**:
- 10,000 registered users by end of Year 1
- 20% conversion to paid (2,000 paid users)
- Average subscription: $12/month (mix of monthly/annual)
- 5% monthly churn

**Revenue**:
- Subscription ARR: $288K (2,000 users × $12 × 12 months)
- Creator marketplace GMV: $100K (platform take: $30K)
- B2B revenue: $50K
- **Total ARR**: ~$368K

**Costs**:
- AI/API costs: $40K (estimated $2/user/month for heavy users)
- Infrastructure: $20K
- Content creation: $60K (chapter notes, guides)
- **Gross Margin**: ~70%

---

## Go-to-Market Strategy

### Phase 1: MVP Launch (Current - Q1 2026)

**Goals**:
- Validate core value prop with 3 books
- Gather user feedback on Rowan personality
- Test spoiler-safety architecture
- Build case studies for author outreach

**Tactics**:
- Private beta with 50-100 hand-picked users
- Reddit (r/Fantasy, r/Stormlight_Archive, etc.)
- Fantasy BookTube/BookTok influencer partnerships
- Direct outreach to book clubs

**Success Criteria**:
- 100+ active beta users
- >4.5/5 satisfaction rating
- <5% spoiler incidents
- 50+ detailed feedback responses

---

### Phase 2: Creator Platform (Q1-Q2 2026)

**Goals**:
- Sign 10+ authors/creators
- Launch guide marketplace
- Expand to 15+ books/series
- Prove monetization model

**Tactics**:
- Author outreach (target: Sanderson, Rothfuss, Abercrombie communities)
- Creator partnerships (BookTubers with 50K+ followers)
- Press coverage (TechCrunch, Publisher's Weekly)
- Fantasy convention presence (WorldCon, JordanCon)

**Success Criteria**:
- 2,000+ registered users
- 400+ paying subscribers
- 10+ creator guides live
- 1+ major author partnership

---

### Phase 3: Social & Analytics (Q2-Q3 2026)

**Goals**:
- Launch reading circles
- Publisher analytics dashboard
- Mobile apps (iOS/Android)
- Scale to 50+ supported books

**Tactics**:
- Book club partnerships
- Publisher B2B sales (Tor, DAW, Orbit)
- PR campaign around "social reading"
- App Store featuring push

**Success Criteria**:
- 10,000+ registered users
- 2,000+ paid subscribers
- 500+ active reading circles
- 3+ publisher partnerships

---

### Phase 4: Ecosystem (Q3 2026+)

**Goals**:
- Digital asset marketplace
- Newsletter platform
- International expansion
- Platform API for third parties

**Tactics**:
- Fan artist partnerships
- International book publisher deals
- Developer ecosystem (API partners)
- Major marketing campaign

**Success Criteria**:
- 50,000+ registered users
- 10,000+ paid subscribers
- $1M+ ARR
- Profitability

---

## Success Metrics & KPIs

### North Star Metric
**Active Reading Sessions per Week**: Measures true engagement with core product

### Primary KPIs

**Engagement**:
- Monthly Active Users (MAU)
- Average session length
- Questions asked per user per month
- Return rate (7-day, 30-day)

**Growth**:
- New user registrations per month
- Paid conversion rate
- Monthly Recurring Revenue (MRR)
- Churn rate

**Quality**:
- User satisfaction (NPS)
- Spoiler incident rate
- Guide quality rating
- Response accuracy (user feedback)

**Community**:
- Active reading circles
- Circle completion rate
- Messages per circle per week
- Creator guide adoption

### Secondary KPIs

**Creator Platform**:
- Active creators
- Guides published per month
- Average guide rating
- Creator revenue (total)

**B2B**:
- Publisher partnerships
- Analytics dashboard MAU
- Enterprise contract value

**Monetization**:
- Average Revenue Per User (ARPU)
- Lifetime Value (LTV)
- Customer Acquisition Cost (CAC)
- LTV:CAC ratio

---

## Risks & Mitigation

### Risk 1: Spoiler Incidents
**Impact**: High - core value prop failure
**Likelihood**: Medium
**Mitigation**:
- Multi-layer spoiler detection (AI + human review)
- User reporting system
- Immediate content takedown process
- Insurance/refund policy

### Risk 2: Author/Publisher Resistance
**Impact**: High - limits content library
**Likelihood**: Medium
**Mitigation**:
- Position as marketing/retention tool, not piracy
- Revenue share model
- Start with independent/self-published authors
- Data shows increased book sales

### Risk 3: AI Hallucinations/Errors
**Impact**: Medium - damages trust
**Likelihood**: Medium
**Mitigation**:
- Human-verified chapter notes as source of truth
- Confidence scoring on AI responses
- User correction feedback loop
- "I'm not sure" fallback responses

### Risk 4: Scaling Costs (AI API)
**Impact**: High - unit economics break
**Likelihood**: Medium
**Mitigation**:
- Tiered pricing (question limits)
- Optimize prompts for token efficiency
- Self-hosted models for common queries
- Aggressive caching

### Risk 5: Narrow Appeal (Fantasy Only)
**Impact**: Medium - limits TAM
**Likelihood**: Low
**Mitigation**:
- Fantasy is large enough market for validation
- Expand to sci-fi, mystery, literary fiction later
- Platform architecture is genre-agnostic

### Risk 6: User-Generated Spoilers in Circles
**Impact**: High - community feature failure
**Likelihood**: Medium
**Mitigation**:
- AI moderation before message posting
- Progress-based filtering
- Circle moderator tools
- Warning/ban system for repeat offenders

---

## Open Questions & Future Exploration

1. **Should we build our own LLM or continue using OpenAI?**
   - Tradeoff: Control/cost vs. speed to market
   - Decision point: 10K+ users or $50K/month in API costs

2. **How do we handle series that aren't complete?**
   - Example: Rothfuss hasn't finished Kingkiller
   - Do we support ongoing series differently?

3. **International expansion strategy?**
   - Non-English fantasy markets (Japan, France, Germany)
   - Translation challenges for chapter notes
   - Local author partnerships

4. **Audiobook integration?**
   - Many users listen vs. read
   - Timestamp-based progress tracking
   - Partnerships with Audible, Libro.fm

5. **Educational applications?**
   - High school/college literature courses
   - B2B2C model with schools
   - Curriculum-aligned guides

6. **Gaming/transmedia opportunities?**
   - Guides for complex game narratives (Elden Ring lore)
   - Movie/TV companion mode
   - Tabletop RPG integration

---

## Appendix A: Competitive Landscape

### Direct Competitors
**None** - No direct AI reading companion for spoiler-safe book guidance

### Adjacent Competitors

**Goodreads**:
- Strength: Network effects, Amazon integration
- Weakness: No spoiler protection, passive not active
- Our Advantage: Active guidance, spoiler-safe by design

**SparkNotes/CliffsNotes**:
- Strength: Comprehensive summaries
- Weakness: Assumes you've read everything, not interactive
- Our Advantage: Chapter-level guidance, conversational

**Discord/Reddit Communities**:
- Strength: Real discussion with real fans
- Weakness: Spoiler minefield, quality varies
- Our Advantage: Controlled spoilers, consistent quality

**ChatGPT (General)**:
- Strength: Powerful, accessible
- Weakness: No spoiler awareness, hallucinates, impersonal
- Our Advantage: Purpose-built, progress-aware, curated knowledge

---

## Appendix B: User Personas

### Persona 1: "The Intimidated Newcomer"
**Name**: Sarah, 28, Marketing Manager
**Goal**: Finally read Stormlight Archive her friends keep recommending
**Pain Point**: "It's so long and everyone says it's confusing"
**How Rowan Helps**: Gentle onboarding, validates confusion, makes it approachable
**Quote**: "I always felt like fantasy wasn't for me, but Rowan makes me feel smart"

### Persona 2: "The Returning Veteran"
**Name**: Marcus, 35, Software Engineer
**Goal**: Finish Wheel of Time after 5-year break
**Pain Point**: "I forgot everything and don't want to re-read 14 books"
**How Rowan Helps**: Quick recaps, character refreshers, picks up where he left off
**Quote**: "It's like having a friend who remembers everything about the series"

### Persona 3: "The Book Club Organizer"
**Name**: Jen, 42, Teacher
**Goal**: Lead engaging discussions without spoiling ahead-readers
**Pain Point**: "Half the club is on Chapter 5, half finished the whole book"
**How Rowan Helps**: Progress-synced circles, discussion prompts, spoiler management
**Quote**: "Finally, a way to keep everyone engaged without ruining it for anyone"

### Persona 4: "The Creator"
**Name**: Alex, 25, BookTube (50K subscribers)
**Goal**: Engage audience with unique Sanderson content
**Pain Point**: "How do I add value beyond what's on Reddit?"
**How Rowan Helps**: Create premium guides, monetize expertise, build community
**Quote**: "This lets me turn my knowledge into something my viewers actually want to pay for"

### Persona 5: "The Author"
**Name**: Published fantasy author with 3-book series
**Goal**: Understand reader experience, reduce drop-off between books
**Pain Point**: "I don't know why readers stop at Book 1"
**How Rowan Helps**: Analytics on confusion points, direct reader engagement, retention tools
**Quote**: "The data showed me exactly where I lost readers - now I can fix it in Book 4"

---

## Appendix C: Feature Prioritization Matrix

**High Impact, Low Effort** (Do First):
- Guide personality variations
- Basic reading circles (MVP)
- Author dashboard (basic analytics)
- Newsletter triggers (simple version)

**High Impact, High Effort** (Strategic Bets):
- Full circle platform with spoiler detection
- Creator marketplace with payments
- Mobile apps (iOS/Android)
- Advanced analytics suite

**Low Impact, Low Effort** (Quick Wins):
- Reading streaks/gamification
- Social sharing features
- Progress visualization
- Year in review

**Low Impact, High Effort** (Avoid for Now):
- Custom LLM training
- White-label enterprise solutions
- International translation
- VR/AR reading experiences

---

## Document Control

**Version History**:
- v1.0 (2025-11-30): Initial draft - Strategic vision for DOCENT platform

**Contributors**:
- Product Vision: User
- Documentation: Claude (Rowan AI)

**Next Steps**:
1. Validate MVP assumptions with beta users
2. Secure initial author/creator partnerships
3. Build financial model for fundraising
4. Design technical architecture for Phase 2
5. Create detailed feature specs for prioritized items

---

**END OF DOCUMENT**
