-- Add a house_number column to the donations table
ALTER TABLE public.donations
ADD COLUMN house_number TEXT;