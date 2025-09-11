-- Add a nullable last_call_date column to projects
ALTER TABLE projects ADD COLUMN last_call_date date NULL; 