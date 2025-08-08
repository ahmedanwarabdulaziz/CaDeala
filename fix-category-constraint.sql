-- Fix category constraint issue
-- Make created_by field nullable to avoid foreign key constraint issues

-- Drop the existing foreign key constraint if it exists
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_created_by_fkey;

-- Make the created_by column nullable (this should work even if it's already nullable)
ALTER TABLE categories ALTER COLUMN created_by DROP NOT NULL;

-- Add the foreign key constraint back with ON DELETE SET NULL
ALTER TABLE categories ADD CONSTRAINT categories_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Verify the constraint was created properly
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='categories' 
    AND kcu.column_name='created_by';
