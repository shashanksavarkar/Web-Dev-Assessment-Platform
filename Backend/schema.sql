-- PostgreSQL Schema for challenges
CREATE TABLE IF NOT EXISTS challenges (
    id VARCHAR(255) PRIMARY KEY,
    env VARCHAR(50) DEFAULT 'web',
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    duration INTEGER,
    topics JSONB DEFAULT '[]'::jsonb,
    companies JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    changes_to_be_done JSONB DEFAULT '[]'::jsonb,
    hints JSONB DEFAULT '[]'::jsonb,
    rules JSONB DEFAULT '[]'::jsonb,
    initial_html TEXT DEFAULT '',
    initial_css TEXT DEFAULT '',
    initial_js TEXT DEFAULT '',
    solution_html TEXT DEFAULT '',
    solution_css TEXT DEFAULT '',
    solution_js TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching and sorting by creation time
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at);

-- Table for storing student submissions
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(255) DEFAULT 'default_student',
    challenge_id VARCHAR(255) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    html_code TEXT,
    css_code TEXT,
    js_code TEXT,
    success BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for submissions lookup optimization
CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id ON submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
