create table "public"."deliverables" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid,
    "name" text not null,
    "description" text,
    "type" text,
    "status" text default 'pending'::text,
    "due_date" date,
    "completed_date" date,
    "responsible_employee" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "assignee_name" text
);


alter table "public"."deliverables" enable row level security;

create table "public"."employees" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" text,
    "full_name" text not null,
    "email" text,
    "avatar_url" text,
    "department" text,
    "position" text,
    "salary" numeric,
    "hire_date" date,
    "status" text default 'active'::text,
    "skills" text[],
    "utilization_rate" integer default 0,
    "role" text default 'employee'::text,
    "user_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."employees" enable row level security;

create table "public"."issues" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid,
    "title" text not null,
    "description" text,
    "severity" text default 'medium'::text,
    "status" text default 'open'::text,
    "reported_by" uuid,
    "assigned_to" uuid,
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."issues" enable row level security;

create table "public"."projects" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "status" text default 'active'::text,
    "priority" text default 'medium'::text,
    "start_date" date,
    "end_date" date,
    "budget" numeric(12,2),
    "progress" integer default 0,
    "manager_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "pm_status" text default 'not-started'::text,
    "ops_status" text default 'not-started'::text
);


alter table "public"."projects" enable row level security;

create table "public"."seats" (
    "id" uuid not null default gen_random_uuid(),
    "location" text not null,
    "floor" text,
    "section" text,
    "seat_number" text not null,
    "type" text default 'desk'::text,
    "status" text default 'available'::text,
    "assigned_to" uuid,
    "assigned_date" date,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."seats" enable row level security;

create table "public"."tasks" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid,
    "title" text not null,
    "description" text,
    "status" text default 'pending'::text,
    "priority" text default 'medium'::text,
    "assigned_to" uuid,
    "due_date" date,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."tasks" enable row level security;

create table "public"."weekly_status" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "week" character varying(10) not null,
    "status" text not null default 'green'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."weekly_status" enable row level security;

CREATE UNIQUE INDEX deliverables_pkey ON public.deliverables USING btree (id);

CREATE UNIQUE INDEX employees_new_employee_id_key ON public.employees USING btree (employee_id);

CREATE UNIQUE INDEX employees_new_pkey ON public.employees USING btree (id);

CREATE UNIQUE INDEX issues_pkey ON public.issues USING btree (id);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX seats_pkey ON public.seats USING btree (id);

CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id);

CREATE UNIQUE INDEX weekly_status_pkey ON public.weekly_status USING btree (id);

CREATE UNIQUE INDEX weekly_status_project_id_week_key ON public.weekly_status USING btree (project_id, week);

alter table "public"."deliverables" add constraint "deliverables_pkey" PRIMARY KEY using index "deliverables_pkey";

alter table "public"."employees" add constraint "employees_new_pkey" PRIMARY KEY using index "employees_new_pkey";

alter table "public"."issues" add constraint "issues_pkey" PRIMARY KEY using index "issues_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."seats" add constraint "seats_pkey" PRIMARY KEY using index "seats_pkey";

alter table "public"."tasks" add constraint "tasks_pkey" PRIMARY KEY using index "tasks_pkey";

alter table "public"."weekly_status" add constraint "weekly_status_pkey" PRIMARY KEY using index "weekly_status_pkey";

alter table "public"."deliverables" add constraint "deliverables_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."deliverables" validate constraint "deliverables_project_id_fkey";

alter table "public"."employees" add constraint "employees_new_employee_id_key" UNIQUE using index "employees_new_employee_id_key";

alter table "public"."employees" add constraint "employees_new_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."employees" validate constraint "employees_new_user_id_fkey";

alter table "public"."issues" add constraint "issues_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) not valid;

alter table "public"."issues" validate constraint "issues_project_id_fkey";

alter table "public"."tasks" add constraint "tasks_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_project_id_fkey";

alter table "public"."weekly_status" add constraint "weekly_status_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."weekly_status" validate constraint "weekly_status_project_id_fkey";

alter table "public"."weekly_status" add constraint "weekly_status_project_id_week_key" UNIQUE using index "weekly_status_project_id_week_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."deliverables" to "anon";

grant insert on table "public"."deliverables" to "anon";

grant references on table "public"."deliverables" to "anon";

grant select on table "public"."deliverables" to "anon";

grant trigger on table "public"."deliverables" to "anon";

grant truncate on table "public"."deliverables" to "anon";

grant update on table "public"."deliverables" to "anon";

grant delete on table "public"."deliverables" to "authenticated";

grant insert on table "public"."deliverables" to "authenticated";

grant references on table "public"."deliverables" to "authenticated";

grant select on table "public"."deliverables" to "authenticated";

grant trigger on table "public"."deliverables" to "authenticated";

grant truncate on table "public"."deliverables" to "authenticated";

grant update on table "public"."deliverables" to "authenticated";

grant delete on table "public"."deliverables" to "service_role";

grant insert on table "public"."deliverables" to "service_role";

grant references on table "public"."deliverables" to "service_role";

grant select on table "public"."deliverables" to "service_role";

grant trigger on table "public"."deliverables" to "service_role";

grant truncate on table "public"."deliverables" to "service_role";

grant update on table "public"."deliverables" to "service_role";

grant delete on table "public"."employees" to "anon";

grant insert on table "public"."employees" to "anon";

grant references on table "public"."employees" to "anon";

grant select on table "public"."employees" to "anon";

grant trigger on table "public"."employees" to "anon";

grant truncate on table "public"."employees" to "anon";

grant update on table "public"."employees" to "anon";

grant delete on table "public"."employees" to "authenticated";

grant insert on table "public"."employees" to "authenticated";

grant references on table "public"."employees" to "authenticated";

grant select on table "public"."employees" to "authenticated";

grant trigger on table "public"."employees" to "authenticated";

grant truncate on table "public"."employees" to "authenticated";

grant update on table "public"."employees" to "authenticated";

grant delete on table "public"."employees" to "service_role";

grant insert on table "public"."employees" to "service_role";

grant references on table "public"."employees" to "service_role";

grant select on table "public"."employees" to "service_role";

grant trigger on table "public"."employees" to "service_role";

grant truncate on table "public"."employees" to "service_role";

grant update on table "public"."employees" to "service_role";

grant delete on table "public"."issues" to "anon";

grant insert on table "public"."issues" to "anon";

grant references on table "public"."issues" to "anon";

grant select on table "public"."issues" to "anon";

grant trigger on table "public"."issues" to "anon";

grant truncate on table "public"."issues" to "anon";

grant update on table "public"."issues" to "anon";

grant delete on table "public"."issues" to "authenticated";

grant insert on table "public"."issues" to "authenticated";

grant references on table "public"."issues" to "authenticated";

grant select on table "public"."issues" to "authenticated";

grant trigger on table "public"."issues" to "authenticated";

grant truncate on table "public"."issues" to "authenticated";

grant update on table "public"."issues" to "authenticated";

grant delete on table "public"."issues" to "service_role";

grant insert on table "public"."issues" to "service_role";

grant references on table "public"."issues" to "service_role";

grant select on table "public"."issues" to "service_role";

grant trigger on table "public"."issues" to "service_role";

grant truncate on table "public"."issues" to "service_role";

grant update on table "public"."issues" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."seats" to "anon";

grant insert on table "public"."seats" to "anon";

grant references on table "public"."seats" to "anon";

grant select on table "public"."seats" to "anon";

grant trigger on table "public"."seats" to "anon";

grant truncate on table "public"."seats" to "anon";

grant update on table "public"."seats" to "anon";

grant delete on table "public"."seats" to "authenticated";

grant insert on table "public"."seats" to "authenticated";

grant references on table "public"."seats" to "authenticated";

grant select on table "public"."seats" to "authenticated";

grant trigger on table "public"."seats" to "authenticated";

grant truncate on table "public"."seats" to "authenticated";

grant update on table "public"."seats" to "authenticated";

grant delete on table "public"."seats" to "service_role";

grant insert on table "public"."seats" to "service_role";

grant references on table "public"."seats" to "service_role";

grant select on table "public"."seats" to "service_role";

grant trigger on table "public"."seats" to "service_role";

grant truncate on table "public"."seats" to "service_role";

grant update on table "public"."seats" to "service_role";

grant delete on table "public"."tasks" to "anon";

grant insert on table "public"."tasks" to "anon";

grant references on table "public"."tasks" to "anon";

grant select on table "public"."tasks" to "anon";

grant trigger on table "public"."tasks" to "anon";

grant truncate on table "public"."tasks" to "anon";

grant update on table "public"."tasks" to "anon";

grant delete on table "public"."tasks" to "authenticated";

grant insert on table "public"."tasks" to "authenticated";

grant references on table "public"."tasks" to "authenticated";

grant select on table "public"."tasks" to "authenticated";

grant trigger on table "public"."tasks" to "authenticated";

grant truncate on table "public"."tasks" to "authenticated";

grant update on table "public"."tasks" to "authenticated";

grant delete on table "public"."tasks" to "service_role";

grant insert on table "public"."tasks" to "service_role";

grant references on table "public"."tasks" to "service_role";

grant select on table "public"."tasks" to "service_role";

grant trigger on table "public"."tasks" to "service_role";

grant truncate on table "public"."tasks" to "service_role";

grant update on table "public"."tasks" to "service_role";

grant delete on table "public"."weekly_status" to "anon";

grant insert on table "public"."weekly_status" to "anon";

grant references on table "public"."weekly_status" to "anon";

grant select on table "public"."weekly_status" to "anon";

grant trigger on table "public"."weekly_status" to "anon";

grant truncate on table "public"."weekly_status" to "anon";

grant update on table "public"."weekly_status" to "anon";

grant delete on table "public"."weekly_status" to "authenticated";

grant insert on table "public"."weekly_status" to "authenticated";

grant references on table "public"."weekly_status" to "authenticated";

grant select on table "public"."weekly_status" to "authenticated";

grant trigger on table "public"."weekly_status" to "authenticated";

grant truncate on table "public"."weekly_status" to "authenticated";

grant update on table "public"."weekly_status" to "authenticated";

grant delete on table "public"."weekly_status" to "service_role";

grant insert on table "public"."weekly_status" to "service_role";

grant references on table "public"."weekly_status" to "service_role";

grant select on table "public"."weekly_status" to "service_role";

grant trigger on table "public"."weekly_status" to "service_role";

grant truncate on table "public"."weekly_status" to "service_role";

grant update on table "public"."weekly_status" to "service_role";

create policy "Allow all operations on deliverables"
on "public"."deliverables"
as permissive
for all
to public
using (true)
with check (true);


create policy "Allow all operations on employees_new"
on "public"."employees"
as permissive
for all
to public
using (true)
with check (true);


create policy "Allow all operations on issues"
on "public"."issues"
as permissive
for all
to public
using (true)
with check (true);


create policy "Allow all operations on projects"
on "public"."projects"
as permissive
for all
to public
using (true)
with check (true);


create policy "Allow all operations on seats"
on "public"."seats"
as permissive
for all
to public
using (true)
with check (true);


create policy "Allow all operations on tasks"
on "public"."tasks"
as permissive
for all
to public
using (true)
with check (true);


create policy "Allow all operations on weekly_status"
on "public"."weekly_status"
as permissive
for all
to public
using (true)
with check (true);


CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON public.deliverables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_new_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seats_updated_at BEFORE UPDATE ON public.seats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_status_updated_at BEFORE UPDATE ON public.weekly_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


