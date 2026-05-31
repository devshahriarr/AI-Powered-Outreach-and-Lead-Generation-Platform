"""Initial lead schema

Revision ID: 2026_05_31_initial
Revises: 
Create Date: 2026-05-31 05:33:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '2026_05_31_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create target lead table
    op.create_table(
        'lead',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('google_place_id', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('business_type', sa.String(length=100), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('phone_number', sa.String(length=100), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('user_ratings_total', sa.Integer(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Establish robust database indexes
    op.create_index(op.f('ix_lead_google_place_id'), 'lead', ['google_place_id'], unique=True)
    op.create_index(op.f('ix_lead_business_type'), 'lead', ['business_type'], unique=False)
    op.create_index(op.f('ix_lead_email'), 'lead', ['email'], unique=False)
    op.create_index(op.f('ix_lead_status'), 'lead', ['status'], unique=False)
    op.create_index(op.f('ix_lead_id'), 'lead', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_lead_id'), table_name='lead')
    op.drop_index(op.f('ix_lead_status'), table_name='lead')
    op.drop_index(op.f('ix_lead_email'), table_name='lead')
    op.drop_index(op.f('ix_lead_business_type'), table_name='lead')
    op.drop_index(op.f('ix_lead_google_place_id'), table_name='lead')
    op.drop_table('lead')
