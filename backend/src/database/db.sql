-- =========================================
-- Extensions
-- =========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- Users
-- =========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    user_name TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    password TEXT NOT NULL,
    avatar_url TEXT NULL,
    last_connexion TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- =========================================
-- Onboarding Questions
-- =========================================

CREATE TABLE onboarding_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    domain TEXT NOT NULL,
    order_index INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- Onboarding Answers
-- =========================================

CREATE TABLE onboarding_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES onboarding_questions(id) ON DELETE CASCADE,
    label TEXT,
    min_value FLOAT,
    max_value FLOAT,
    co2_value FLOAT
);

-- =========================================
-- Onboarding Results
-- =========================================

CREATE TABLE onboarding_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_co2 FLOAT,
    transport_co2 FLOAT,
    food_co2 FLOAT,
    energy_co2 FLOAT,
    consumption_co2 FLOAT,
    flexibility_domains TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- Consumption Entries
-- =========================================

CREATE TABLE consumption_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    domain TEXT,
    value FLOAT,
    co2_emission FLOAT,
    date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- User Goals
-- =========================================

CREATE TABLE user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_co2 FLOAT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- Challenges
-- =========================================

CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT,
    domain TEXT,
    frequency TEXT,
    points INT
);

-- =========================================
-- User Challenges
-- =========================================

CREATE TABLE user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP
);

-- =========================================
-- User Stats
-- =========================================

CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_points INT DEFAULT 0,
    streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    trees_planted INT DEFAULT 0,
    challenge_batch_offset INT DEFAULT 0
);

-- =========================================
-- Friends
-- =========================================

CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- =========================================
-- Notifications
-- =========================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- Indexes
-- =========================================

CREATE INDEX idx_consumption_user 
ON consumption_entries(user_id);

CREATE INDEX idx_challenges_user 
ON user_challenges(user_id);

CREATE INDEX idx_friends_user 
ON friends(user_id);

CREATE INDEX idx_notifications_user 
ON notifications(user_id);

CREATE INDEX idx_onboarding_results_user 
ON onboarding_results(user_id);

CREATE INDEX idx_user_goals_user 
ON user_goals(user_id);

-- =========================================
-- Updated_at trigger
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- =========================================
-- Achievements
-- =========================================

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);