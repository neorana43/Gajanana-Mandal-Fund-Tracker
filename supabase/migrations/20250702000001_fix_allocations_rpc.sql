-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.get_allocations_with_emails();

-- Create RPC function to get allocations with emails
CREATE OR REPLACE FUNCTION get_allocations_with_emails () RETURNS TABLE (
  id uuid,
  created_at timestamp,
  amount numeric,
  user_id uuid,
  admin_id uuid,
  user_email text,
  admin_email text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ua.id,
        ua.created_at,
        ua.amount,
        ua.user_id,
        ua.admin_id,
        u.email::text AS user_email,
        a.email::text AS admin_email
    FROM
        public.user_allocations AS ua
    LEFT JOIN
        auth.users AS u ON ua.user_id = u.id
    LEFT JOIN
        auth.users AS a ON ua.admin_id = a.id
    ORDER BY
        ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;