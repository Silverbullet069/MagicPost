
-- CREATE TABLE IF NOT EXISTS test (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL
-- );

-- INSERT INTO test (name)
-- VALUES ('VH');

-- INSERT INTO user_credentials (username, password)
-- VALUES ('admin', 'scrypt:32768:8:1$usvyyO8TZ7oz8Bqf$ce368d4bd17abb8d0efbce1bd40b6b73e0be23dc2bd445b7b8d22afdced644b4cbd85d33ee0927549c823bc52c0702736dab0006f7d50fc7f0abe6007937bfb3') -- Password=123456

INSERT INTO users (name, credential_id, role_id) 
VALUES ('VH', 1, 1)
