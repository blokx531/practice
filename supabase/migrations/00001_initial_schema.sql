-- Initial Schema for UPSC PYQ Revision App

CREATE TYPE confidence_level AS ENUM ('confident', 'conflicted', 'blind_guess');

CREATE TABLE canonical_questions (
    question_id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- e.g., ["A. ...", "B. ...", "C. ...", "D. ..."]
    answer TEXT NOT NULL,   -- e.g., "A"
    subject TEXT NOT NULL,
    topic_tag TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE user_tests (
    test_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Assuming we link to Supabase Auth eventually, or just generic user strings for now
    test_type TEXT NOT NULL, -- 'simulation', 'custom', 'practice'
    configuration JSONB,
    score NUMERIC,
    accuracy NUMERIC,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    question_id TEXT REFERENCES canonical_questions(question_id),
    test_id UUID REFERENCES user_tests(test_id),
    selected_option TEXT,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER,
    confidence confidence_level,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE user_question_states (
    user_id UUID NOT NULL,
    question_id TEXT REFERENCES canonical_questions(question_id),
    attempt_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    average_time_seconds NUMERIC DEFAULT 0,
    confident_count INTEGER DEFAULT 0,
    conflicted_count INTEGER DEFAULT 0,
    blind_guess_count INTEGER DEFAULT 0,
    last_confidence confidence_level,
    is_bookmarked BOOLEAN DEFAULT false,
    latest_bookmark_date TIMESTAMP WITH TIME ZONE,
    last_attempted_at TIMESTAMP WITH TIME ZONE,
    last_wrong_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, question_id)
);

-- Indexes for performance
CREATE INDEX idx_canonical_questions_subject ON canonical_questions(subject);
CREATE INDEX idx_canonical_questions_year ON canonical_questions(year);
CREATE INDEX idx_user_attempts_user_id ON user_attempts(user_id);
CREATE INDEX idx_user_question_states_user_id ON user_question_states(user_id);
