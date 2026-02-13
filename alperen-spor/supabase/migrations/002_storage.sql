-- Create table for storing files in Supabase storage
CREATE TABLE storage_files (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries on file_name
CREATE INDEX idx_file_name ON storage_files(file_name);

-- Create index for faster queries on file_path
CREATE INDEX idx_file_path ON storage_files(file_path);