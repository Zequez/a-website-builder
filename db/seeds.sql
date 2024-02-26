INSERT INTO members (email, full_name, is_admin)
VALUES ('zequez@gmail.com', 'Ezequiel Schwartzman', TRUE)
ON CONFLICT (email) DO NOTHING;