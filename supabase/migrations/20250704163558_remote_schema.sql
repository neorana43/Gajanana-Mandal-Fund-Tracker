create policy "Admins can write to mandal-logos"
on "storage"."objects"
as permissive
for all
to public
using (((bucket_id = 'mandal-logos'::text) AND (auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.id = auth.uid()) AND (user_roles.role = 'admin'::text))))));


create policy "Allow authenticated uploads"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'receipts'::text));


create policy "Public receipt access"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'receipts'::text));



