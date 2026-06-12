import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configure PocketBase URL (default local port 8090)
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

async function migrate() {
  console.log('Starting migration from Pocketbase to PostgreSQL...');
  console.log(`Connecting to PocketBase at: ${POCKETBASE_URL}`);
  
  let pbChallenges = [];
  
  // 1. Fetch data from running PocketBase instance
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/challenges/records?perPage=500`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    pbChallenges = data.items || [];
    console.log(`Successfully fetched ${pbChallenges.length} challenges from PocketBase.`);
  } catch (error) {
    console.error('Error fetching from Pocketbase API. Make sure PocketBase is running on port 8090.');
    console.error('Error details:', error.message);
    process.exit(1);
  }

  if (pbChallenges.length === 0) {
    console.log('No challenges found in PocketBase to migrate.');
    process.exit(0);
  }

  // 2. Connect to PostgreSQL
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to PostgreSQL database.');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL. Check your DATABASE_URL in .env.');
    console.error('Error details:', error.message);
    process.exit(1);
  }

  // 3. Migrate each challenge
  let successCount = 0;
  let errorCount = 0;

  try {
    for (const q of pbChallenges) {
      console.log(`Migrating challenge: "${q.title}" (ID: ${q.id})...`);
      
      try {
        await client.query(
          `INSERT INTO challenges (
            id, env, title, difficulty, type, duration, topics, companies, 
            description, changes_to_be_done, hints, rules, 
            initial_html, initial_css, initial_js, 
            solution_html, solution_css, solution_js,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          ON CONFLICT (id) DO UPDATE SET
            env = EXCLUDED.env,
            title = EXCLUDED.title,
            difficulty = EXCLUDED.difficulty,
            type = EXCLUDED.type,
            duration = EXCLUDED.duration,
            topics = EXCLUDED.topics,
            companies = EXCLUDED.companies,
            description = EXCLUDED.description,
            changes_to_be_done = EXCLUDED.changes_to_be_done,
            hints = EXCLUDED.hints,
            rules = EXCLUDED.rules,
            initial_html = EXCLUDED.initial_html,
            initial_css = EXCLUDED.initial_css,
            initial_js = EXCLUDED.initial_js,
            solution_html = EXCLUDED.solution_html,
            solution_css = EXCLUDED.solution_css,
            solution_js = EXCLUDED.solution_js,
            updated_at = CURRENT_TIMESTAMP`,
          [
            q.id,
            q.env || 'web',
            q.title,
            q.difficulty,
            q.type,
            q.duration || null,
            JSON.stringify(q.topics || []),
            JSON.stringify(q.companies || []),
            q.description || '',
            JSON.stringify(q.changesToBeDone || []),
            JSON.stringify(q.hints || []),
            JSON.stringify(q.rules || []),
            q.initialHtml || '',
            q.initialCss || '',
            q.initialJs || '',
            q.solutionHtml || '',
            q.solutionCss || '',
            q.solutionJs || '',
            q.created ? new Date(q.created) : new Date(),
            q.updated ? new Date(q.updated) : new Date()
          ]
        );
        successCount++;
      } catch (err) {
        console.error(`Failed to insert challenge "${q.title}":`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\nMigration completed!`);
    console.log(`Successfully migrated: ${successCount} challenges.`);
    if (errorCount > 0) {
      console.log(`Failed to migrate: ${errorCount} challenges.`);
    }
  } catch (err) {
    console.error('Unexpected error during migration:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
