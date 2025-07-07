-- Initialize Lead Scraper Database
-- This script runs when the PostgreSQL container starts for the first time

-- Create database user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'scraper_user') THEN
      
      CREATE ROLE scraper_user LOGIN PASSWORD 'scraper_password';
   END IF;
END
$do$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE lead_scraper TO scraper_user;

-- Connect to the lead_scraper database
\c lead_scraper;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO scraper_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO scraper_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO scraper_user;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for performance (will be created by SQLAlchemy, but good to have)
-- These will be created after tables are created by the application