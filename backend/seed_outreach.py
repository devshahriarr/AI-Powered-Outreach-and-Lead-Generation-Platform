"""
Seed script: Inserts test outreach messages into the database for Phase 4 verification.
Run from backend dir: .venv\Scripts\python.exe seed_outreach.py
"""
import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:admin@localhost:5432/catering_outreach"

# Use the actual qualified lead IDs: 252 (NIOFIX) and 251 (Getweb Ltd.)
SEED_MESSAGES = [
    {
        "lead_id": 252,
        "campaign_id": 1,
        "message_type": "cold_outreach",
        "subject": "Elevate NIOFIX Team Lunches with Premium Catering",
        "body": "Hi there,\n\nI noticed NIOFIX has been growing rapidly as a trusted design partner in Dhaka. As your team expands, keeping everyone energized with quality meals becomes even more important.\n\nWe specialize in corporate catering designed for busy creative teams — fresh, diverse menus delivered right to your office. Our clients report improved team satisfaction and productivity after switching to our service.\n\nWould you be open to a quick 10-minute call this week to explore how we can support your team?",
        "cta": "Book a free consultation call this Thursday or Friday",
        "generated_by": "openai",
        "model_name": "gpt-4o",
        "status": "generated",
        "review_notes": None,
    },
    {
        "lead_id": 252,
        "campaign_id": 1,
        "message_type": "followup_1",
        "subject": "Quick follow-up: Catering for the NIOFIX team",
        "body": "Hi,\n\nJust following up on my previous email about catering services for your NIOFIX team. I understand things get busy!\n\nMany design agencies like yours have found that regular team lunches boost collaboration and morale. We offer flexible weekly plans that can be customized to your team's preferences and dietary needs.\n\nNo commitment required — I'd love to send you a sample menu to review at your convenience.",
        "cta": "Reply to receive a free sample menu and pricing",
        "generated_by": "openai",
        "model_name": "gpt-4o",
        "status": "generated",
        "review_notes": None,
    },
    {
        "lead_id": 251,
        "campaign_id": 1,
        "message_type": "cold_outreach",
        "subject": "Fresh Catering Solutions for Getweb Ltd.",
        "body": "Hello,\n\nI came across Getweb Ltd. and was impressed by your web development portfolio. Growing tech teams deserve great food to fuel their creativity.\n\nOur corporate catering service delivers chef-prepared meals directly to your office — no hassle, no cleanup. We work with over 50 businesses in Dhaka and offer customizable menus for every dietary preference.\n\nWould you be interested in a complimentary tasting session for your team?",
        "cta": "Schedule a free tasting session for your team",
        "generated_by": "openai",
        "model_name": "gpt-4o",
        "status": "draft",
        "review_notes": None,
    },
    {
        "lead_id": 252,
        "campaign_id": 2,
        "message_type": "cold_outreach",
        "subject": "Exclusive 15% Off Your First Office Catering Order",
        "body": "Hi NIOFIX team,\n\nWe're reaching out to select businesses in Banani to offer an exclusive deal: 15% off your first office catering booking with us.\n\nAs a leading design partner, your team deserves meals that match your standards of excellence. Our Austin-inspired menu features fresh, locally-sourced ingredients prepared by professional chefs.\n\nThis offer is limited to the first 20 businesses that sign up this month.",
        "cta": "Claim your 15% discount — reply or book online today",
        "generated_by": "openai",
        "model_name": "gpt-4o",
        "status": "edited",
        "review_notes": "Tweaked the discount language to be more compelling",
    },
    {
        "lead_id": 251,
        "campaign_id": 2,
        "message_type": "cold_outreach",
        "subject": "Fuel Your Dev Team with Premium Office Catering",
        "body": "Hello Getweb team,\n\nLong coding sessions need great fuel! We provide premium office catering for tech companies across Dhaka — featuring healthy, energizing meals that keep your developers focused and happy.\n\nOur service includes:\n- Weekly rotating menus\n- Dietary accommodation (vegetarian, vegan, halal)\n- Zero cleanup — we handle everything\n- Flexible scheduling\n\nJoin 50+ companies already enjoying better workday meals.",
        "cta": "Get started with a free trial lunch for your team",
        "generated_by": "openai",
        "model_name": "gpt-4o",
        "status": "approved",
        "review_notes": "Approved - great copy, ready to send",
    },
    {
        "lead_id": 252,
        "campaign_id": 1,
        "message_type": "followup_2",
        "subject": "Last chance: Special catering offer for NIOFIX",
        "body": "Hi,\n\nI wanted to reach out one more time about our catering services. I know your team at NIOFIX is busy creating amazing designs, and the last thing you need is to worry about lunch logistics.\n\nWe've helped companies like yours save an average of 3 hours per week on meal planning and ordering. Our all-inclusive service means you just tell us your preferences, and we handle the rest.\n\nThis is my last follow-up, but the offer for a free consultation stands whenever you're ready.",
        "cta": "Book your free consultation anytime at our website",
        "generated_by": "openai",
        "model_name": "gpt-4o",
        "status": "sent",
        "review_notes": "Sent on 2026-06-01",
    },
    {
        "lead_id": 251,
        "campaign_id": 1,
        "message_type": "followup_1",
        "subject": "Following up: Catering for Getweb's growing team",
        "body": "Hi there,\n\nJust checking in about our catering services for Getweb Ltd. As your team grows, having reliable, delicious meals can make a real difference in daily productivity and team bonding.\n\nWe currently serve several tech companies in your area and have received excellent feedback on our diverse menu options.\n\nWould a brief 5-minute call work to discuss your team's needs?",
        "cta": "Reply with your availability for a quick chat",
        "generated_by": "openai",
        "model_name": "gpt-4o",
        "status": "generated",
        "review_notes": None,
    },
    {
        "lead_id": 251,
        "campaign_id": 2,
        "message_type": "followup_1",
        "subject": "Your 15% discount is still available, Getweb!",
        "body": "Hello,\n\nJust a friendly reminder that your exclusive 15% discount on first-time office catering is still available. Several companies in your area have already signed up.\n\nOur most popular plan for tech teams includes daily lunch service with a rotating menu of international cuisines — perfect for diverse teams with different taste preferences.\n\nThe discount expires at the end of this month.",
        "cta": "Lock in your discount — book before month end",
        "generated_by": "openai",
        "model_name": "gpt-4o",
        "status": "failed",
        "review_notes": "Email delivery failed - invalid recipient address",
    },
]


async def seed():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check if we already have outreach messages
        result = await session.execute(text("SELECT COUNT(*) FROM lead_outreach_message"))
        count = result.scalar()
        if count and count > 0:
            print(f"Already have {count} outreach messages. Skipping seed.")
            await engine.dispose()
            return

        now = datetime.now(timezone.utc)
        for i, msg in enumerate(SEED_MESSAGES):
            # Stagger created_at times so they sort distinctly
            created = now - timedelta(hours=len(SEED_MESSAGES) - i)
            await session.execute(
                text("""
                    INSERT INTO lead_outreach_message 
                    (lead_id, campaign_id, message_type, subject, body, cta, 
                     generated_by, model_name, status, review_notes, created_at, updated_at)
                    VALUES 
                    (:lead_id, :campaign_id, :message_type, :subject, :body, :cta,
                     :generated_by, :model_name, :status, :review_notes, :created_at, :updated_at)
                """),
                {**msg, "created_at": created, "updated_at": now},
            )

        await session.commit()
        print(f"Seeded {len(SEED_MESSAGES)} outreach messages successfully!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
