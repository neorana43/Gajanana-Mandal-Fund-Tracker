-- Allow users to create new sponsors and associate them with their user ID.
CREATE POLICY "Users can create their own sponsors"
ON public.sponsors
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own sponsors.
-- Also, allow admin users to update any sponsor.
CREATE POLICY "Users can update their own sponsors"
ON public.sponsors
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

-- Allow users to delete their own sponsors.
-- Also, allow admin users to delete any sponsor.
CREATE POLICY "Users can delete their own sponsors"
ON public.sponsors
FOR DELETE
USING (
  auth.uid() = created_by
  OR (
    SELECT role
    FROM public.user_roles
    WHERE id = auth.uid()
  ) = 'admin'
);