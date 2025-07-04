-- Add owner_id to mandals
ALTER TABLE mandals ADD COLUMN owner_id uuid REFERENCES auth.users(id);

-- Create mandal_users table for per-mandal roles and invitations
CREATE TABLE mandal_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mandal_id uuid REFERENCES mandals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('admin', 'volunteer')) NOT NULL,
  status text CHECK (status IN ('invited', 'active')) NOT NULL DEFAULT 'invited',
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz
);

-- Unique constraint: a user can only have one role per mandal
CREATE UNIQUE INDEX mandal_users_unique ON mandal_users(mandal_id, user_id);