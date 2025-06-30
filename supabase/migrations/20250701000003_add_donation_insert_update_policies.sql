-- Allow users to create new donations and associate them with their user ID.
CREATE POLICY "Users can create their own donations"
ON public.donations
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own donations.
-- Also, allow admin users to update any donation.
CREATE POLICY "Users can update their own donations"
ON public.donations
FOR UPDATE
USING (
  auth.uid() = created_by
  OR (
    SELECT role
    FROM public.user_roles
    WHERE id = auth.uid()
  ) = 'admin'
)
WITH CHECK (
  auth.uid() = created_by
  OR (
    SELECT role
    FROM public.user_roles
    WHERE id = auth.uid()
  ) = 'admin'
);