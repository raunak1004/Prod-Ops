-- Step 7: Drop old tables and rename new table
DROP TABLE public.employees CASCADE;
DROP TABLE public.profiles CASCADE;

-- Step 8: Rename the new table to employees
ALTER TABLE public.employees_new RENAME TO employees;