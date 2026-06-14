import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize PostgreSQL Pool
const { Pool } = pg;
const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

// Check database connection and run schema.sql if table doesn't exist
const initializeDb = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully.');
    
    // Read schema.sql and execute it
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('Database schema checked/applied successfully.');
    }
    
    client.release();
    
    // Run auto-seeding check
    await seedIfEmpty();
  } catch (error) {
    console.error('Failed to initialize PostgreSQL database:', error.message);
  }
};

// Map DB row to Frontend Challenge object
function mapDbToChallenge(row) {
  if (!row) return null;
  return {
    id: row.id,
    dbId: row.id,
    env: row.env || 'web',
    title: row.title,
    difficulty: row.difficulty,
    type: row.type,
    duration: row.duration,
    topics: row.topics || [],
    companies: row.companies || [],
    description: row.description || '',
    changesToBeDone: row.changes_to_be_done || [],
    hints: row.hints || [],
    rules: row.rules || [],
    initialHtml: row.initial_html || '',
    initialCss: row.initial_css || '',
    initialJs: row.initial_js || '',
    solutionHtml: row.solution_html || '',
    solutionCss: row.solution_css || '',
    solutionJs: row.solution_js || '',
  };
}

// Read default questions from Frontend
const getDefaultQuestions = () => {
  try {
    const filePath = path.join(__dirname, '../Frontend/src/constants/challenges.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error("Failed to read default questions:", err.message);
  }
  return [];
};

// Seed database if challenges table is empty
const seedIfEmpty = async () => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM challenges');
    const count = parseInt(rows[0].count, 10);
    
    if (count === 0) {
      const defaults = getDefaultQuestions();
      if (defaults.length > 0) {
        console.log(`Challenges table is empty. Seeding ${defaults.length} default questions...`);
        for (const q of defaults) {
          // Fallback ID generation matching Pocketbase alphanumeric style (15 chars)
          const id = q.id || Math.random().toString(36).substring(2, 17);
          
          await pool.query(
            `INSERT INTO challenges (
              id, env, title, difficulty, type, duration, topics, companies, 
              description, changes_to_be_done, hints, rules, 
              initial_html, initial_css, initial_js, 
              solution_html, solution_css, solution_js
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
            [
              id,
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
              q.solutionJs || ''
            ]
          );
        }
        console.log('Database seeding completed successfully.');
      } else {
        console.warn('No default questions found to seed.');
      }
    }
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: error.message });
  }
});

// Get all challenges
app.get('/api/challenges', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM challenges ORDER BY created_at ASC');
    res.json(rows.map(mapDbToChallenge));
  } catch (error) {
    console.error('Error fetching challenges:', error.message);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// Create or Update challenge (Upsert)
app.post('/api/challenges', async (req, res) => {
  try {
    const q = req.body;
    const id = q.id || Math.random().toString(36).substring(2, 17);
    
    const query = `
      INSERT INTO challenges (
        id, env, title, difficulty, type, duration, topics, companies, 
        description, changes_to_be_done, hints, rules, 
        initial_html, initial_css, initial_js, 
        solution_html, solution_css, solution_js
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [
      id,
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
      q.solutionJs || ''
    ]);
    
    res.status(200).json(mapDbToChallenge(rows[0]));
  } catch (error) {
    console.error('Error saving challenge:', error.message);
    res.status(500).json({ error: 'Failed to save challenge' });
  }
});

// Delete challenge
app.delete('/api/challenges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM challenges WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting challenge:', error.message);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

// Submit student solution
app.post('/api/submissions', async (req, res) => {
  try {
    const { studentId, challengeId, htmlCode, cssCode, jsCode, success, attempts, timeSpent } = req.body;
    
    if (!challengeId) {
      return res.status(400).json({ error: 'challengeId is required' });
    }
    
    const query = `
      INSERT INTO submissions (
        student_id, challenge_id, html_code, css_code, js_code, success, attempts, time_spent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [
      studentId || 'default_student',
      challengeId,
      htmlCode || '',
      cssCode || '',
      jsCode || '',
      !!success,
      attempts || 0,
      timeSpent || 0
    ]);
    
    const saved = rows[0];
    res.status(201).json({
      id: saved.id,
      studentId: saved.student_id,
      challengeId: saved.challenge_id,
      htmlCode: saved.html_code,
      cssCode: saved.css_code,
      jsCode: saved.js_code,
      success: saved.success,
      attempts: saved.attempts,
      timeSpent: saved.time_spent,
      submittedAt: saved.submitted_at
    });
  } catch (error) {
    console.error('Error saving submission:', error.message);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// Fetch all submissions
app.get('/api/submissions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM submissions ORDER BY submitted_at DESC');
    res.json(rows.map(s => ({
      id: s.id,
      studentId: s.student_id,
      challengeId: s.challenge_id,
      htmlCode: s.html_code,
      cssCode: s.css_code,
      jsCode: s.js_code,
      success: s.success,
      attempts: s.attempts,
      timeSpent: s.time_spent,
      submittedAt: s.submitted_at
    })));
  } catch (error) {
    console.error('Error fetching submissions:', error.message);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Express API Server running on port ${PORT}`);
  initializeDb();
});
