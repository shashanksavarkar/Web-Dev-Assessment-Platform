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
