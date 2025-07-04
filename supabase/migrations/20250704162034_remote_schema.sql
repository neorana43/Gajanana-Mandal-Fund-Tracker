create table "public"."allocation_logs" (
    "id" uuid not null default gen_random_uuid(),
    "allocation_id" uuid,
    "user_id" uuid,
    "admin_id" uuid,
    "action" text,
    "previous_amount" numeric,
    "new_amount" numeric,
    "timestamp" timestamp with time zone default now(),
    "mandal_id" uuid not null
);


alter table "public"."allocation_logs" enable row level security;

create table "public"."donations" (
    "id" uuid not null default gen_random_uuid(),
    "donor_name" text not null,
    "contact" text,
    "amount" numeric not null,
    "is_recurring" boolean default false,
    "created_at" timestamp without time zone default now(),
    "created_by" uuid,
    "house_number" text,
    "mandal_id" uuid not null
);


alter table "public"."donations" enable row level security;

create table "public"."expenses" (
    "id" uuid not null default gen_random_uuid(),
    "category" text not null,
    "description" text,
    "amount" numeric not null,
    "date" date not null default CURRENT_DATE,
    "receipt_url" text,
    "created_by" uuid,
    "created_at" timestamp without time zone default now(),
    "bill_url" text,
    "note" text,
    "user_id" uuid,
    "mandal_id" uuid not null
);


alter table "public"."expenses" enable row level security;

create table "public"."mandal_invites" (
    "id" uuid not null default uuid_generate_v4(),
    "mandal_id" uuid,
    "email" text not null,
    "role" text not null,
    "token" text not null,
    "created_at" timestamp without time zone default now(),
    "accepted" boolean default false
);


create table "public"."mandal_users" (
    "id" uuid not null default gen_random_uuid(),
    "mandal_id" uuid,
    "user_id" uuid,
    "role" text not null,
    "invited_by" uuid,
    "status" text not null default 'active'::text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "invited_at" timestamp with time zone default now(),
    "accepted_at" timestamp with time zone
);


alter table "public"."mandal_users" enable row level security;

create table "public"."mandals" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "logo_url" text,
    "created_by" uuid not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "logo" text,
    "address" text,
    "description" text,
    "owner_id" uuid
);


alter table "public"."mandals" enable row level security;

create table "public"."secret_sponsors" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "amount" numeric not null,
    "created_at" timestamp with time zone default now(),
    "mandal_id" uuid not null
);


alter table "public"."secret_sponsors" enable row level security;

create table "public"."sponsors" (
    "id" uuid not null default gen_random_uuid(),
    "sponsor_name" text not null,
    "category" text not null,
    "description" text,
    "amount" numeric not null,
    "is_full" boolean default false,
    "created_by" uuid,
    "created_at" timestamp without time zone default now(),
    "mandal_id" uuid not null
);


alter table "public"."sponsors" enable row level security;

create table "public"."user_allocations" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "amount" numeric not null,
    "created_at" timestamp without time zone default now(),
    "admin_id" uuid,
    "mandal_id" uuid not null
);


alter table "public"."user_allocations" enable row level security;

create table "public"."user_roles" (
    "id" uuid not null,
    "role" text not null
);


alter table "public"."user_roles" enable row level security;

CREATE UNIQUE INDEX allocation_logs_pkey ON public.allocation_logs USING btree (id);

CREATE UNIQUE INDEX donations_pkey ON public.donations USING btree (id);

CREATE UNIQUE INDEX expenses_pkey ON public.expenses USING btree (id);

CREATE INDEX idx_mandal_invites_email ON public.mandal_invites USING btree (email);

CREATE INDEX idx_mandal_users_user_id ON public.mandal_users USING btree (user_id);

CREATE UNIQUE INDEX mandal_invites_pkey ON public.mandal_invites USING btree (id);

CREATE UNIQUE INDEX mandal_users_mandal_id_user_id_key ON public.mandal_users USING btree (mandal_id, user_id);

CREATE UNIQUE INDEX mandal_users_pkey ON public.mandal_users USING btree (id);

CREATE UNIQUE INDEX mandal_users_unique ON public.mandal_users USING btree (mandal_id, user_id);

CREATE UNIQUE INDEX mandals_pkey ON public.mandals USING btree (id);

CREATE UNIQUE INDEX mandals_slug_key ON public.mandals USING btree (slug);

CREATE UNIQUE INDEX secret_sponsors_pkey ON public.secret_sponsors USING btree (id);

CREATE UNIQUE INDEX sponsors_pkey ON public.sponsors USING btree (id);

CREATE UNIQUE INDEX user_allocations_pkey ON public.user_allocations USING btree (id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

alter table "public"."allocation_logs" add constraint "allocation_logs_pkey" PRIMARY KEY using index "allocation_logs_pkey";

alter table "public"."donations" add constraint "donations_pkey" PRIMARY KEY using index "donations_pkey";

alter table "public"."expenses" add constraint "expenses_pkey" PRIMARY KEY using index "expenses_pkey";

alter table "public"."mandal_invites" add constraint "mandal_invites_pkey" PRIMARY KEY using index "mandal_invites_pkey";

alter table "public"."mandal_users" add constraint "mandal_users_pkey" PRIMARY KEY using index "mandal_users_pkey";

alter table "public"."mandals" add constraint "mandals_pkey" PRIMARY KEY using index "mandals_pkey";

alter table "public"."secret_sponsors" add constraint "secret_sponsors_pkey" PRIMARY KEY using index "secret_sponsors_pkey";

alter table "public"."sponsors" add constraint "sponsors_pkey" PRIMARY KEY using index "sponsors_pkey";

alter table "public"."user_allocations" add constraint "user_allocations_pkey" PRIMARY KEY using index "user_allocations_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."allocation_logs" add constraint "allocation_logs_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES auth.users(id) not valid;

alter table "public"."allocation_logs" validate constraint "allocation_logs_admin_id_fkey";

alter table "public"."allocation_logs" add constraint "allocation_logs_mandal_id_fkey" FOREIGN KEY (mandal_id) REFERENCES mandals(id) not valid;

alter table "public"."allocation_logs" validate constraint "allocation_logs_mandal_id_fkey";

alter table "public"."donations" add constraint "donations_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."donations" validate constraint "donations_created_by_fkey";

alter table "public"."donations" add constraint "donations_mandal_id_fkey" FOREIGN KEY (mandal_id) REFERENCES mandals(id) not valid;

alter table "public"."donations" validate constraint "donations_mandal_id_fkey";

alter table "public"."expenses" add constraint "expenses_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."expenses" validate constraint "expenses_created_by_fkey";

alter table "public"."expenses" add constraint "expenses_mandal_id_fkey" FOREIGN KEY (mandal_id) REFERENCES mandals(id) not valid;

alter table "public"."expenses" validate constraint "expenses_mandal_id_fkey";

alter table "public"."expenses" add constraint "expenses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."expenses" validate constraint "expenses_user_id_fkey";

alter table "public"."mandal_invites" add constraint "mandal_invites_mandal_id_fkey" FOREIGN KEY (mandal_id) REFERENCES mandals(id) not valid;

alter table "public"."mandal_invites" validate constraint "mandal_invites_mandal_id_fkey";

alter table "public"."mandal_users" add constraint "mandal_users_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES auth.users(id) not valid;

alter table "public"."mandal_users" validate constraint "mandal_users_invited_by_fkey";

alter table "public"."mandal_users" add constraint "mandal_users_mandal_id_fkey" FOREIGN KEY (mandal_id) REFERENCES mandals(id) ON DELETE CASCADE not valid;

alter table "public"."mandal_users" validate constraint "mandal_users_mandal_id_fkey";

alter table "public"."mandal_users" add constraint "mandal_users_mandal_id_user_id_key" UNIQUE using index "mandal_users_mandal_id_user_id_key";

alter table "public"."mandal_users" add constraint "mandal_users_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'volunteer'::text]))) not valid;

alter table "public"."mandal_users" validate constraint "mandal_users_role_check";

alter table "public"."mandal_users" add constraint "mandal_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mandal_users" validate constraint "mandal_users_user_id_fkey";

alter table "public"."mandals" add constraint "mandals_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."mandals" validate constraint "mandals_created_by_fkey";

alter table "public"."mandals" add constraint "mandals_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) not valid;

alter table "public"."mandals" validate constraint "mandals_owner_id_fkey";

alter table "public"."mandals" add constraint "mandals_slug_key" UNIQUE using index "mandals_slug_key";

alter table "public"."secret_sponsors" add constraint "secret_sponsors_mandal_id_fkey" FOREIGN KEY (mandal_id) REFERENCES mandals(id) not valid;

alter table "public"."secret_sponsors" validate constraint "secret_sponsors_mandal_id_fkey";

alter table "public"."sponsors" add constraint "sponsors_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."sponsors" validate constraint "sponsors_created_by_fkey";

alter table "public"."sponsors" add constraint "sponsors_mandal_id_fkey" FOREIGN KEY (mandal_id) REFERENCES mandals(id) not valid;

alter table "public"."sponsors" validate constraint "sponsors_mandal_id_fkey";

alter table "public"."user_allocations" add constraint "user_allocations_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_allocations" validate constraint "user_allocations_admin_id_fkey";

alter table "public"."user_allocations" add constraint "user_allocations_mandal_id_fkey" FOREIGN KEY (mandal_id) REFERENCES mandals(id) not valid;

alter table "public"."user_allocations" validate constraint "user_allocations_mandal_id_fkey";

alter table "public"."user_allocations" add constraint "user_allocations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_allocations" validate constraint "user_allocations_user_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."user_roles" validate constraint "user_roles_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'volunteer'::text]))) not valid;

alter table "public"."user_roles" validate constraint "user_roles_role_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_allocations_with_emails()
 RETURNS TABLE(id uuid, created_at timestamp without time zone, amount numeric, user_id uuid, admin_id uuid, user_email text, admin_email text, user_display_name text, admin_display_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        ua.id,
        ua.created_at,
        ua.amount,
        ua.user_id,
        ua.admin_id,
        u.email::text AS user_email,
        a.email::text AS admin_email,
        u.raw_user_meta_data->>'display_name' AS user_display_name,
        a.raw_user_meta_data->>'display_name' AS admin_display_name
    FROM
        public.user_allocations AS ua
    LEFT JOIN
        auth.users AS u ON ua.user_id = u.id
    LEFT JOIN
        auth.users AS a ON ua.admin_id = a.id
    ORDER BY
        ua.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_allocations_with_emails(mandal_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp without time zone, amount numeric, user_id uuid, admin_id uuid, user_email text, admin_email text, user_display_name text, admin_display_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        ua.id,
        ua.created_at,
        ua.amount,
        ua.user_id,
        ua.admin_id,
        u.email::text AS user_email,
        a.email::text AS admin_email,
        u.raw_user_meta_data->>'display_name' AS user_display_name,
        a.raw_user_meta_data->>'display_name' AS admin_display_name
    FROM
        public.user_allocations AS ua
    LEFT JOIN
        auth.users AS u ON ua.user_id = u.id
    LEFT JOIN
        auth.users AS a ON ua.admin_id = a.id
    WHERE
        ua.mandal_id = get_allocations_with_emails.mandal_id
    ORDER BY
        ua.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_expenses_with_user_names()
 RETURNS TABLE(id bigint, created_at timestamp with time zone, amount real, description text, bill_url text, note text, user_id uuid, user_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
    BEGIN
      RETURN QUERY
      SELECT
        e.id,
        e.created_at,
        e.amount,
        e.description,
        e.bill_url,
        e.note,
        e.user_id,
        u.raw_user_meta_data->>'display_name' as user_name
      FROM
        public.expenses AS e
      LEFT JOIN
        auth.users AS u ON e.user_id = u.id
      ORDER BY
        e.created_at DESC;
    END;
    $function$
;

grant delete on table "public"."allocation_logs" to "anon";

grant insert on table "public"."allocation_logs" to "anon";

grant references on table "public"."allocation_logs" to "anon";

grant select on table "public"."allocation_logs" to "anon";

grant trigger on table "public"."allocation_logs" to "anon";

grant truncate on table "public"."allocation_logs" to "anon";

grant update on table "public"."allocation_logs" to "anon";

grant delete on table "public"."allocation_logs" to "authenticated";

grant insert on table "public"."allocation_logs" to "authenticated";

grant references on table "public"."allocation_logs" to "authenticated";

grant select on table "public"."allocation_logs" to "authenticated";

grant trigger on table "public"."allocation_logs" to "authenticated";

grant truncate on table "public"."allocation_logs" to "authenticated";

grant update on table "public"."allocation_logs" to "authenticated";

grant delete on table "public"."allocation_logs" to "service_role";

grant insert on table "public"."allocation_logs" to "service_role";

grant references on table "public"."allocation_logs" to "service_role";

grant select on table "public"."allocation_logs" to "service_role";

grant trigger on table "public"."allocation_logs" to "service_role";

grant truncate on table "public"."allocation_logs" to "service_role";

grant update on table "public"."allocation_logs" to "service_role";

grant delete on table "public"."donations" to "anon";

grant insert on table "public"."donations" to "anon";

grant references on table "public"."donations" to "anon";

grant select on table "public"."donations" to "anon";

grant trigger on table "public"."donations" to "anon";

grant truncate on table "public"."donations" to "anon";

grant update on table "public"."donations" to "anon";

grant delete on table "public"."donations" to "authenticated";

grant insert on table "public"."donations" to "authenticated";

grant references on table "public"."donations" to "authenticated";

grant select on table "public"."donations" to "authenticated";

grant trigger on table "public"."donations" to "authenticated";

grant truncate on table "public"."donations" to "authenticated";

grant update on table "public"."donations" to "authenticated";

grant delete on table "public"."donations" to "service_role";

grant insert on table "public"."donations" to "service_role";

grant references on table "public"."donations" to "service_role";

grant select on table "public"."donations" to "service_role";

grant trigger on table "public"."donations" to "service_role";

grant truncate on table "public"."donations" to "service_role";

grant update on table "public"."donations" to "service_role";

grant delete on table "public"."expenses" to "anon";

grant insert on table "public"."expenses" to "anon";

grant references on table "public"."expenses" to "anon";

grant select on table "public"."expenses" to "anon";

grant trigger on table "public"."expenses" to "anon";

grant truncate on table "public"."expenses" to "anon";

grant update on table "public"."expenses" to "anon";

grant delete on table "public"."expenses" to "authenticated";

grant insert on table "public"."expenses" to "authenticated";

grant references on table "public"."expenses" to "authenticated";

grant select on table "public"."expenses" to "authenticated";

grant trigger on table "public"."expenses" to "authenticated";

grant truncate on table "public"."expenses" to "authenticated";

grant update on table "public"."expenses" to "authenticated";

grant delete on table "public"."expenses" to "service_role";

grant insert on table "public"."expenses" to "service_role";

grant references on table "public"."expenses" to "service_role";

grant select on table "public"."expenses" to "service_role";

grant trigger on table "public"."expenses" to "service_role";

grant truncate on table "public"."expenses" to "service_role";

grant update on table "public"."expenses" to "service_role";

grant delete on table "public"."mandal_invites" to "anon";

grant insert on table "public"."mandal_invites" to "anon";

grant references on table "public"."mandal_invites" to "anon";

grant select on table "public"."mandal_invites" to "anon";

grant trigger on table "public"."mandal_invites" to "anon";

grant truncate on table "public"."mandal_invites" to "anon";

grant update on table "public"."mandal_invites" to "anon";

grant delete on table "public"."mandal_invites" to "authenticated";

grant insert on table "public"."mandal_invites" to "authenticated";

grant references on table "public"."mandal_invites" to "authenticated";

grant select on table "public"."mandal_invites" to "authenticated";

grant trigger on table "public"."mandal_invites" to "authenticated";

grant truncate on table "public"."mandal_invites" to "authenticated";

grant update on table "public"."mandal_invites" to "authenticated";

grant delete on table "public"."mandal_invites" to "service_role";

grant insert on table "public"."mandal_invites" to "service_role";

grant references on table "public"."mandal_invites" to "service_role";

grant select on table "public"."mandal_invites" to "service_role";

grant trigger on table "public"."mandal_invites" to "service_role";

grant truncate on table "public"."mandal_invites" to "service_role";

grant update on table "public"."mandal_invites" to "service_role";

grant delete on table "public"."mandal_users" to "anon";

grant insert on table "public"."mandal_users" to "anon";

grant references on table "public"."mandal_users" to "anon";

grant select on table "public"."mandal_users" to "anon";

grant trigger on table "public"."mandal_users" to "anon";

grant truncate on table "public"."mandal_users" to "anon";

grant update on table "public"."mandal_users" to "anon";

grant delete on table "public"."mandal_users" to "authenticated";

grant insert on table "public"."mandal_users" to "authenticated";

grant references on table "public"."mandal_users" to "authenticated";

grant select on table "public"."mandal_users" to "authenticated";

grant trigger on table "public"."mandal_users" to "authenticated";

grant truncate on table "public"."mandal_users" to "authenticated";

grant update on table "public"."mandal_users" to "authenticated";

grant delete on table "public"."mandal_users" to "service_role";

grant insert on table "public"."mandal_users" to "service_role";

grant references on table "public"."mandal_users" to "service_role";

grant select on table "public"."mandal_users" to "service_role";

grant trigger on table "public"."mandal_users" to "service_role";

grant truncate on table "public"."mandal_users" to "service_role";

grant update on table "public"."mandal_users" to "service_role";

grant delete on table "public"."mandals" to "anon";

grant insert on table "public"."mandals" to "anon";

grant references on table "public"."mandals" to "anon";

grant select on table "public"."mandals" to "anon";

grant trigger on table "public"."mandals" to "anon";

grant truncate on table "public"."mandals" to "anon";

grant update on table "public"."mandals" to "anon";

grant delete on table "public"."mandals" to "authenticated";

grant insert on table "public"."mandals" to "authenticated";

grant references on table "public"."mandals" to "authenticated";

grant select on table "public"."mandals" to "authenticated";

grant trigger on table "public"."mandals" to "authenticated";

grant truncate on table "public"."mandals" to "authenticated";

grant update on table "public"."mandals" to "authenticated";

grant delete on table "public"."mandals" to "service_role";

grant insert on table "public"."mandals" to "service_role";

grant references on table "public"."mandals" to "service_role";

grant select on table "public"."mandals" to "service_role";

grant trigger on table "public"."mandals" to "service_role";

grant truncate on table "public"."mandals" to "service_role";

grant update on table "public"."mandals" to "service_role";

grant delete on table "public"."secret_sponsors" to "anon";

grant insert on table "public"."secret_sponsors" to "anon";

grant references on table "public"."secret_sponsors" to "anon";

grant select on table "public"."secret_sponsors" to "anon";

grant trigger on table "public"."secret_sponsors" to "anon";

grant truncate on table "public"."secret_sponsors" to "anon";

grant update on table "public"."secret_sponsors" to "anon";

grant delete on table "public"."secret_sponsors" to "authenticated";

grant insert on table "public"."secret_sponsors" to "authenticated";

grant references on table "public"."secret_sponsors" to "authenticated";

grant select on table "public"."secret_sponsors" to "authenticated";

grant trigger on table "public"."secret_sponsors" to "authenticated";

grant truncate on table "public"."secret_sponsors" to "authenticated";

grant update on table "public"."secret_sponsors" to "authenticated";

grant delete on table "public"."secret_sponsors" to "service_role";

grant insert on table "public"."secret_sponsors" to "service_role";

grant references on table "public"."secret_sponsors" to "service_role";

grant select on table "public"."secret_sponsors" to "service_role";

grant trigger on table "public"."secret_sponsors" to "service_role";

grant truncate on table "public"."secret_sponsors" to "service_role";

grant update on table "public"."secret_sponsors" to "service_role";

grant delete on table "public"."sponsors" to "anon";

grant insert on table "public"."sponsors" to "anon";

grant references on table "public"."sponsors" to "anon";

grant select on table "public"."sponsors" to "anon";

grant trigger on table "public"."sponsors" to "anon";

grant truncate on table "public"."sponsors" to "anon";

grant update on table "public"."sponsors" to "anon";

grant delete on table "public"."sponsors" to "authenticated";

grant insert on table "public"."sponsors" to "authenticated";

grant references on table "public"."sponsors" to "authenticated";

grant select on table "public"."sponsors" to "authenticated";

grant trigger on table "public"."sponsors" to "authenticated";

grant truncate on table "public"."sponsors" to "authenticated";

grant update on table "public"."sponsors" to "authenticated";

grant delete on table "public"."sponsors" to "service_role";

grant insert on table "public"."sponsors" to "service_role";

grant references on table "public"."sponsors" to "service_role";

grant select on table "public"."sponsors" to "service_role";

grant trigger on table "public"."sponsors" to "service_role";

grant truncate on table "public"."sponsors" to "service_role";

grant update on table "public"."sponsors" to "service_role";

grant delete on table "public"."user_allocations" to "anon";

grant insert on table "public"."user_allocations" to "anon";

grant references on table "public"."user_allocations" to "anon";

grant select on table "public"."user_allocations" to "anon";

grant trigger on table "public"."user_allocations" to "anon";

grant truncate on table "public"."user_allocations" to "anon";

grant update on table "public"."user_allocations" to "anon";

grant delete on table "public"."user_allocations" to "authenticated";

grant insert on table "public"."user_allocations" to "authenticated";

grant references on table "public"."user_allocations" to "authenticated";

grant select on table "public"."user_allocations" to "authenticated";

grant trigger on table "public"."user_allocations" to "authenticated";

grant truncate on table "public"."user_allocations" to "authenticated";

grant update on table "public"."user_allocations" to "authenticated";

grant delete on table "public"."user_allocations" to "service_role";

grant insert on table "public"."user_allocations" to "service_role";

grant references on table "public"."user_allocations" to "service_role";

grant select on table "public"."user_allocations" to "service_role";

grant trigger on table "public"."user_allocations" to "service_role";

grant truncate on table "public"."user_allocations" to "service_role";

grant update on table "public"."user_allocations" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

create policy "Allow insert for authenticated"
on "public"."donations"
as permissive
for insert
to authenticated
with check ((auth.uid() IS NOT NULL));


create policy "Allow read"
on "public"."donations"
as permissive
for select
to authenticated
using ((auth.uid() IS NOT NULL));


create policy "Only admins can delete donations"
on "public"."donations"
as permissive
for delete
to public
using ((mandal_id IN ( SELECT mandal_users.mandal_id
   FROM mandal_users
  WHERE ((mandal_users.user_id = auth.uid()) AND (mandal_users.role = 'admin'::text) AND (mandal_users.status = 'active'::text)))));


create policy "Only admins can insert donations"
on "public"."donations"
as permissive
for insert
to public
with check ((mandal_id IN ( SELECT mandal_users.mandal_id
   FROM mandal_users
  WHERE ((mandal_users.user_id = auth.uid()) AND (mandal_users.role = 'admin'::text) AND (mandal_users.status = 'active'::text)))));


create policy "Only admins can update donations"
on "public"."donations"
as permissive
for update
to public
using ((mandal_id IN ( SELECT mandal_users.mandal_id
   FROM mandal_users
  WHERE ((mandal_users.user_id = auth.uid()) AND (mandal_users.role = 'admin'::text) AND (mandal_users.status = 'active'::text)))));


create policy "Public read"
on "public"."donations"
as permissive
for select
to public
using (true);


create policy "Users can access donations for their mandals"
on "public"."donations"
as permissive
for select
to public
using ((mandal_id IN ( SELECT mandal_users.mandal_id
   FROM mandal_users
  WHERE ((mandal_users.user_id = auth.uid()) AND (mandal_users.status = 'active'::text)))));


create policy "Users can create their own donations"
on "public"."donations"
as permissive
for insert
to public
with check ((auth.uid() = created_by));


create policy "Users can delete their own donations"
on "public"."donations"
as permissive
for delete
to public
using (((auth.uid() = created_by) OR (( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text)));


create policy "Users can update their own donations"
on "public"."donations"
as permissive
for update
to public
using (((auth.uid() = created_by) OR (( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text)))
with check (((auth.uid() = created_by) OR (( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text)));


create policy "Users can view donations for their mandals"
on "public"."donations"
as permissive
for select
to public
using ((mandal_id IN ( SELECT mandal_users.mandal_id
   FROM mandal_users
  WHERE ((mandal_users.user_id = auth.uid()) AND (mandal_users.status = 'active'::text)))));


create policy "Admins and volunteers can insert expenses"
on "public"."expenses"
as permissive
for insert
to public
with check ((mandal_id IN ( SELECT mandal_users.mandal_id
   FROM mandal_users
  WHERE ((mandal_users.user_id = auth.uid()) AND (mandal_users.role = ANY (ARRAY['admin'::text, 'volunteer'::text])) AND (mandal_users.status = 'active'::text)))));


create policy "Allow authenticated users to read expenses"
on "public"."expenses"
as permissive
for select
to authenticated
using ((auth.role() = 'authenticated'::text));


create policy "Allow insert for authenticated"
on "public"."expenses"
as permissive
for insert
to authenticated
with check ((auth.uid() IS NOT NULL));


create policy "Allow read"
on "public"."expenses"
as permissive
for select
to authenticated
using ((auth.uid() IS NOT NULL));


create policy "Public read"
on "public"."expenses"
as permissive
for select
to public
using (true);


create policy "Users can delete their own expenses"
on "public"."expenses"
as permissive
for delete
to public
using (((auth.uid() = user_id) OR (( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text)));


create policy "Admins can delete memberships in their mandal"
on "public"."mandal_users"
as permissive
for delete
to public
using ((mandal_id IN ( SELECT mandal_users_1.mandal_id
   FROM mandal_users mandal_users_1
  WHERE ((mandal_users_1.user_id = auth.uid()) AND (mandal_users_1.role = 'admin'::text) AND (mandal_users_1.status = 'active'::text)))));


create policy "Admins can manage memberships in their mandal"
on "public"."mandal_users"
as permissive
for insert
to public
with check ((mandal_id IN ( SELECT mandal_users_1.mandal_id
   FROM mandal_users mandal_users_1
  WHERE ((mandal_users_1.user_id = auth.uid()) AND (mandal_users_1.role = 'admin'::text) AND (mandal_users_1.status = 'active'::text)))));


create policy "Admins can update memberships in their mandal"
on "public"."mandal_users"
as permissive
for update
to public
using ((mandal_id IN ( SELECT mandal_users_1.mandal_id
   FROM mandal_users mandal_users_1
  WHERE ((mandal_users_1.user_id = auth.uid()) AND (mandal_users_1.role = 'admin'::text) AND (mandal_users_1.status = 'active'::text)))));


create policy "Users can view their own mandal memberships"
on "public"."mandal_users"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Creator can update their mandal"
on "public"."mandals"
as permissive
for update
to public
using ((created_by = auth.uid()));


create policy "Users can view mandals they belong to"
on "public"."mandals"
as permissive
for select
to public
using ((id IN ( SELECT mandal_users.mandal_id
   FROM mandal_users
  WHERE ((mandal_users.user_id = auth.uid()) AND (mandal_users.status = 'active'::text)))));


create policy "Allow read access"
on "public"."secret_sponsors"
as permissive
for select
to public
using (true);


create policy "Allow insert for authenticated"
on "public"."sponsors"
as permissive
for insert
to authenticated
with check ((auth.uid() IS NOT NULL));


create policy "Allow read"
on "public"."sponsors"
as permissive
for select
to authenticated
using ((auth.uid() IS NOT NULL));


create policy "Users can create their own sponsors"
on "public"."sponsors"
as permissive
for insert
to public
with check ((auth.uid() = created_by));


create policy "Users can delete their own sponsors"
on "public"."sponsors"
as permissive
for delete
to public
using (((auth.uid() = created_by) OR (( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text)));


create policy "Users can update their own sponsors"
on "public"."sponsors"
as permissive
for update
to public
using (((auth.uid() = created_by) OR (( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text)))
with check (((auth.uid() = created_by) OR (( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text)));


create policy "Admin can allocate funds"
on "public"."user_allocations"
as permissive
for insert
to authenticated
with check ((auth.role() = 'authenticated'::text));


create policy "Admins can read all allocations"
on "public"."user_allocations"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


create policy "Allow admins to create allocations"
on "public"."user_allocations"
as permissive
for insert
to authenticated
with check ((( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text));


create policy "Allow admins to delete allocations"
on "public"."user_allocations"
as permissive
for delete
to authenticated
using ((( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text));


create policy "Allow admins to read all allocations"
on "public"."user_allocations"
as permissive
for select
to authenticated
using ((( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text));


create policy "Allow admins to update allocations"
on "public"."user_allocations"
as permissive
for update
to authenticated
using ((( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text))
with check ((( SELECT user_roles.role
   FROM user_roles
  WHERE (user_roles.id = auth.uid())) = 'admin'::text));


create policy "Allow read"
on "public"."user_allocations"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Only admin can insert allocations"
on "public"."user_allocations"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


create policy "Users can read own allocation"
on "public"."user_allocations"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Allow role fetch"
on "public"."user_roles"
as permissive
for select
to authenticated
using ((auth.uid() = id));



