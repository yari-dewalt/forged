import { supabase } from './lib/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Simple migration runner for the onboarding_completed column
 * Run this with: node -r ts-node/register run_migration.ts
 */
async function runMigration() {
  try {
    console.log('Running migration: add_onboarding_completed_column.sql');
    
    // Read the migration file
    const migrationPath = join(__dirname, 'database_migrations', 'add_onboarding_completed_column.sql');
    const migrationSql = readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      console.log('Executing:', statement.split('\n')[0] + '...');
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error('Error executing statement:', error);
        throw error;
      }
    }
    
    console.log('Migration completed successfully!');
    console.log('Existing users with username and weight_unit have been marked as onboarding_completed = true');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
