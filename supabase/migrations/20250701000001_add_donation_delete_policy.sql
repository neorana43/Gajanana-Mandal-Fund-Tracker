-- Create a policy that allows users to delete their own donations.
-- Also allows users with the 'admin' role to delete any donation.
CREATE POLICY "Users can delete their own donations"
ON public.donations
FOR DELETE
USING (
  -- The user's ID must match the created_by on the donation record
  auth.uid() = created_by
  -- OR, the user must have the 'admin' role
  OR (
    SELECT role
    FROM public.user_roles
    WHERE id = auth.uid()
  ) = 'admin'
);