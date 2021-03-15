DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS images;

CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    url VARCHAR NOT NULL CHECK (url != ''),
    username VARCHAR NOT NULL CHECK (username != ''),
    title VARCHAR NOT NULL CHECK (title != ''),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    comment VARCHAR NOT NULL CHECK (comment != ''),
    username VARCHAR NOT NULL CHECK (username != ''),
    image_id INTEGER NOT NULL REFERENCES images(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




