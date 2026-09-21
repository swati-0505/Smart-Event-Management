"""create initial tables

Revision ID: 800ff740ca57
Revises:
Create Date: 2026-09-12 17:04:12.070852

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '800ff740ca57'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('users',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('password_hash', sa.String(), nullable=False),
    sa.Column('role', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_table('venues',
    sa.Column('venue_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('address', sa.String(), nullable=False),
    sa.Column('city', sa.String(), nullable=False),
    sa.Column('capacity', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('venue_id')
    )
    op.create_table('events',
    sa.Column('event_id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('category', sa.String(), nullable=False),
    sa.Column('venue_id', sa.UUID(), nullable=False),
    sa.Column('event_date', sa.DateTime(timezone=True), nullable=False),
    sa.Column('registration_deadline', sa.DateTime(timezone=True), nullable=True),
    sa.Column('capacity', sa.Integer(), nullable=False),
    sa.Column('available_seats', sa.Integer(), nullable=False),
    sa.Column('created_by', sa.UUID(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
    sa.ForeignKeyConstraint(['venue_id'], ['venues.venue_id'], ),
    sa.PrimaryKeyConstraint('event_id')
    )
    op.create_table('feedback',
    sa.Column('feedback_id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('event_id', sa.UUID(), nullable=False),
    sa.Column('rating', sa.Integer(), nullable=False),
    sa.Column('comment', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.CheckConstraint('rating >= 1 AND rating <= 5', name='ck_feedback_rating_range'),
    sa.ForeignKeyConstraint(['event_id'], ['events.event_id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('feedback_id'),
    sa.UniqueConstraint('user_id', 'event_id', name='uq_user_event_feedback')
    )
    op.create_table('payments',
    sa.Column('payment_id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('event_id', sa.UUID(), nullable=False),
    sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('currency', sa.String(), nullable=True),
    sa.Column('payment_status', sa.String(), nullable=True),
    sa.Column('transaction_id', sa.String(), nullable=True),
    sa.Column('payment_date', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['event_id'], ['events.event_id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('payment_id'),
    sa.UniqueConstraint('transaction_id')
    )
    op.create_table('registrations',
    sa.Column('registration_id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('event_id', sa.UUID(), nullable=False),
    sa.Column('registration_date', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['event_id'], ['events.event_id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('registration_id'),
    sa.UniqueConstraint('user_id', 'event_id', name='uq_user_event_registration')
    )


def downgrade() -> None:
    op.drop_table('registrations')
    op.drop_table('payments')
    op.drop_table('feedback')
    op.drop_table('events')
    op.drop_table('venues')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
