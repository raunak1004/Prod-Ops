-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'employee',
  department TEXT,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  progress INTEGER DEFAULT 0,
  manager_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE,
  department TEXT,
  position TEXT,
  salary DECIMAL(10,2),
  hire_date DATE,
  status TEXT DEFAULT 'active',
  skills TEXT[],
  utilization_rate INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seats table
CREATE TABLE public.seats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  floor TEXT,
  section TEXT,
  seat_number TEXT NOT NULL,
  type TEXT DEFAULT 'desk',
  status TEXT DEFAULT 'available',
  assigned_to UUID REFERENCES public.employees(id),
  assigned_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID REFERENCES public.employees(id),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issues table
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  reported_by UUID REFERENCES public.employees(id),
  assigned_to UUID REFERENCES public.employees(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deliverables table
CREATE TABLE public.deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  completed_date DATE,
  responsible_employee UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for now, can be tightened later)
CREATE POLICY "Allow all operations on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on seats" ON public.seats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on issues" ON public.issues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on deliverables" ON public.deliverables FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seats_updated_at BEFORE UPDATE ON public.seats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON public.deliverables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert placeholder data

-- Profiles
INSERT INTO public.profiles (full_name, email, role, department, position) VALUES
('John Smith', 'john.smith@company.com', 'manager', 'Engineering', 'Team Lead'),
('Sarah Johnson', 'sarah.johnson@company.com', 'employee', 'Design', 'Senior Designer'),
('Mike Wilson', 'mike.wilson@company.com', 'employee', 'Engineering', 'Frontend Developer'),
('Emily Davis', 'emily.davis@company.com', 'manager', 'Marketing', 'Marketing Manager'),
('Alex Brown', 'alex.brown@company.com', 'employee', 'Engineering', 'Backend Developer'),
('Lisa Garcia', 'lisa.garcia@company.com', 'employee', 'HR', 'HR Specialist');

-- Projects
INSERT INTO public.projects (name, description, status, priority, start_date, end_date, budget, progress, manager_id) VALUES
('Website Redesign', 'Complete overhaul of company website', 'active', 'high', '2024-01-15', '2024-06-30', 85000.00, 65, (SELECT id FROM public.profiles WHERE full_name = 'John Smith')),
('Mobile App Development', 'Native mobile app for iOS and Android', 'active', 'high', '2024-02-01', '2024-08-15', 120000.00, 40, (SELECT id FROM public.profiles WHERE full_name = 'John Smith')),
('Marketing Campaign Q2', 'Spring marketing campaign launch', 'planning', 'medium', '2024-03-01', '2024-05-31', 45000.00, 20, (SELECT id FROM public.profiles WHERE full_name = 'Emily Davis')),
('Infrastructure Upgrade', 'Server and database optimization', 'completed', 'high', '2023-11-01', '2024-01-31', 75000.00, 100, (SELECT id FROM public.profiles WHERE full_name = 'Alex Brown'));

-- Employees
INSERT INTO public.employees (profile_id, employee_id, department, position, salary, hire_date, skills, utilization_rate) VALUES
((SELECT id FROM public.profiles WHERE full_name = 'John Smith'), 'EMP001', 'Engineering', 'Team Lead', 95000.00, '2022-03-15', ARRAY['JavaScript', 'React', 'Node.js', 'Leadership'], 85),
((SELECT id FROM public.profiles WHERE full_name = 'Sarah Johnson'), 'EMP002', 'Design', 'Senior Designer', 75000.00, '2023-01-20', ARRAY['Figma', 'Adobe Creative Suite', 'UI/UX'], 90),
((SELECT id FROM public.profiles WHERE full_name = 'Mike Wilson'), 'EMP003', 'Engineering', 'Frontend Developer', 70000.00, '2023-06-10', ARRAY['React', 'TypeScript', 'CSS'], 75),
((SELECT id FROM public.profiles WHERE full_name = 'Emily Davis'), 'EMP004', 'Marketing', 'Marketing Manager', 80000.00, '2022-08-05', ARRAY['Digital Marketing', 'Analytics', 'Content Strategy'], 80),
((SELECT id FROM public.profiles WHERE full_name = 'Alex Brown'), 'EMP005', 'Engineering', 'Backend Developer', 72000.00, '2023-04-12', ARRAY['Python', 'PostgreSQL', 'Docker'], 88),
((SELECT id FROM public.profiles WHERE full_name = 'Lisa Garcia'), 'EMP006', 'HR', 'HR Specialist', 60000.00, '2023-09-01', ARRAY['Recruitment', 'Employee Relations', 'HR Systems'], 70);

-- Seats
INSERT INTO public.seats (location, floor, section, seat_number, type, status, assigned_to) VALUES
('Building A', '2nd Floor', 'East Wing', 'A2-01', 'desk', 'occupied', (SELECT id FROM public.employees WHERE employee_id = 'EMP001')),
('Building A', '2nd Floor', 'East Wing', 'A2-02', 'desk', 'occupied', (SELECT id FROM public.employees WHERE employee_id = 'EMP002')),
('Building A', '2nd Floor', 'East Wing', 'A2-03', 'desk', 'available', NULL),
('Building A', '2nd Floor', 'West Wing', 'A2-04', 'desk', 'occupied', (SELECT id FROM public.employees WHERE employee_id = 'EMP003')),
('Building A', '3rd Floor', 'North Wing', 'A3-01', 'office', 'occupied', (SELECT id FROM public.employees WHERE employee_id = 'EMP004')),
('Building B', '1st Floor', 'Central', 'B1-01', 'desk', 'occupied', (SELECT id FROM public.employees WHERE employee_id = 'EMP005')),
('Building B', '1st Floor', 'Central', 'B1-02', 'desk', 'maintenance', NULL),
('Building B', '1st Floor', 'Central', 'B1-03', 'desk', 'available', NULL);

-- Tasks
INSERT INTO public.tasks (project_id, title, description, status, priority, assigned_to, due_date) VALUES
((SELECT id FROM public.projects WHERE name = 'Website Redesign'), 'Design Homepage Mockup', 'Create initial homepage design mockup', 'completed', 'high', (SELECT id FROM public.employees WHERE employee_id = 'EMP002'), '2024-02-15'),
((SELECT id FROM public.projects WHERE name = 'Website Redesign'), 'Implement Frontend Components', 'Build reusable React components', 'in_progress', 'high', (SELECT id FROM public.employees WHERE employee_id = 'EMP003'), '2024-03-20'),
((SELECT id FROM public.projects WHERE name = 'Mobile App Development'), 'API Integration', 'Connect mobile app to backend APIs', 'pending', 'medium', (SELECT id FROM public.employees WHERE employee_id = 'EMP005'), '2024-04-10'),
((SELECT id FROM public.projects WHERE name = 'Marketing Campaign Q2'), 'Content Strategy Planning', 'Plan content calendar for Q2', 'in_progress', 'medium', (SELECT id FROM public.employees WHERE employee_id = 'EMP004'), '2024-03-15');

-- Issues
INSERT INTO public.issues (project_id, title, description, severity, status, reported_by, assigned_to) VALUES
((SELECT id FROM public.projects WHERE name = 'Website Redesign'), 'Performance Issues on Mobile', 'Website loads slowly on mobile devices', 'high', 'open', (SELECT id FROM public.employees WHERE employee_id = 'EMP002'), (SELECT id FROM public.employees WHERE employee_id = 'EMP003')),
((SELECT id FROM public.projects WHERE name = 'Mobile App Development'), 'Authentication Bug', 'Users unable to login after app update', 'critical', 'in_progress', (SELECT id FROM public.employees WHERE employee_id = 'EMP001'), (SELECT id FROM public.employees WHERE employee_id = 'EMP005')),
(NULL, 'Office WiFi Connectivity', 'Intermittent WiFi issues in Building B', 'medium', 'open', (SELECT id FROM public.employees WHERE employee_id = 'EMP006'), NULL);

-- Deliverables
INSERT INTO public.deliverables (project_id, name, description, type, status, due_date, responsible_employee) VALUES
((SELECT id FROM public.projects WHERE name = 'Website Redesign'), 'Final Design System', 'Complete design system documentation', 'documentation', 'completed', '2024-02-28', (SELECT id FROM public.employees WHERE employee_id = 'EMP002')),
((SELECT id FROM public.projects WHERE name = 'Website Redesign'), 'Production Deployment', 'Deploy website to production servers', 'deployment', 'pending', '2024-06-15', (SELECT id FROM public.employees WHERE employee_id = 'EMP001')),
((SELECT id FROM public.projects WHERE name = 'Mobile App Development'), 'Beta Release', 'Release beta version to test users', 'release', 'pending', '2024-05-30', (SELECT id FROM public.employees WHERE employee_id = 'EMP005')),
((SELECT id FROM public.projects WHERE name = 'Marketing Campaign Q2'), 'Campaign Launch', 'Official campaign launch', 'milestone', 'pending', '2024-04-01', (SELECT id FROM public.employees WHERE employee_id = 'EMP004'));