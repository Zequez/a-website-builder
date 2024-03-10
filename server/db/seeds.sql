BEGIN transaction;

INSERT INTO "members" (email, full_name, is_admin)
VALUES ('zequez@gmail.com', 'Ezequiel Schwartzman', TRUE);

INSERT INTO "sites" (name, local_name, domain_name, member_id)
VALUES ('Personal Website', 'ezequiel', 'ezequielschwartzman.org', 1);

INSERT INTO "files" (site_id, name, data, data_size)
VALUES (1, 'index.html', 'Hello World!', 11);

COMMIT;