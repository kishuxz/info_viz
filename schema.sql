-- NetworkMap PostgreSQL Schema
-- Relational equivalent of the MongoDB schema used in production

-- ============================================================
-- USERS (Admin accounts)
-- ============================================================
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,          -- bcrypt hash
    role        VARCHAR(50) DEFAULT 'admin',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- FORMS (Event forms created by admins)
-- ============================================================
CREATE TABLE forms (
    id           SERIAL PRIMARY KEY,
    admin_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_name   VARCHAR(255) NOT NULL,
    event_date   DATE,
    description  TEXT,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forms_admin_id ON forms(admin_id);
CREATE INDEX idx_forms_is_active ON forms(is_active);

-- ============================================================
-- FORM FIELDS (Custom fields per form)
-- ============================================================
CREATE TABLE form_fields (
    id           SERIAL PRIMARY KEY,
    form_id      INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    field_name   VARCHAR(255) NOT NULL,
    field_type   VARCHAR(50) NOT NULL,          -- text, email, dropdown, etc.
    is_required  BOOLEAN DEFAULT FALSE,
    field_order  INTEGER DEFAULT 0,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);

-- ============================================================
-- RESPONSES (Participant submissions)
-- ============================================================
CREATE TABLE responses (
    id             SERIAL PRIMARY KEY,
    form_id        INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    full_name      VARCHAR(255),
    email          VARCHAR(255),
    organization   VARCHAR(255),
    country        VARCHAR(100),
    state          VARCHAR(100),
    city           VARCHAR(100),
    submitted_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_responses_form_id ON responses(form_id);
CREATE INDEX idx_responses_submitted_at ON responses(submitted_at);

-- ============================================================
-- CONNECTIONS (Organizational connections per response)
-- ============================================================
CREATE TABLE connections (
    id              SERIAL PRIMARY KEY,
    response_id     INTEGER NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    connected_org   VARCHAR(255) NOT NULL,
    connection_type VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_connections_response_id ON connections(response_id);

-- ============================================================
-- TOKEN BLACKLIST (Invalidated JWT tokens on logout)
-- ============================================================
CREATE TABLE token_blacklist (
    id           SERIAL PRIMARY KEY,
    token        TEXT NOT NULL,
    blacklisted_at TIMESTAMP DEFAULT NOW(),
    expires_at   TIMESTAMP
);

CREATE INDEX idx_token_blacklist_token ON token_blacklist(token);

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- Get all responses with connection count for a form
-- SELECT r.*, COUNT(c.id) as connection_count
-- FROM responses r
-- LEFT JOIN connections c ON c.response_id = r.id
-- WHERE r.form_id = $1
-- GROUP BY r.id
-- ORDER BY r.submitted_at DESC;

-- Get network edges (pairs of organizations) for a form
-- SELECT r.organization as source, c.connected_org as target, COUNT(*) as weight
-- FROM responses r
-- JOIN connections c ON c.response_id = r.id
-- WHERE r.form_id = $1
-- GROUP BY r.organization, c.connected_org
-- ORDER BY weight DESC;
