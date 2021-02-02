const spicedPg = require("spiced-pg");

let images;
if (process.env.DATABASE_URL) {
    images = spicedPg(process.env.DATABASE_URL);
} else {
    images = spicedPg("postgres:postgres:postgres@localhost:5432/images");
}

module.exports.getAllInfos = () => {
    const q = `SELECT * FROM images ORDER BY created_at DESC`;
    return images.query(q);
};

module.exports.insertNewImageInfos = (url, username, title, description) => {
    const q = `INSERT INTO images (url, username, title, description) VALUES ($1,$2,$3, $4) RETURNING id`;
    const params = [url, username, title, description];
    return images.query(q, params);
};

module.exports.getNewImageInfo = (url) => {
    const q = `SELECT * FROM images WHERE url = ($1)`;
    const params = [url];
    return images.query(q, params);
};

module.exports.getUrl = () => {
    const q = `SELECT url FROM images`;
    return images.query(q);
};

module.exports.getUsername = () => {
    const q = `SELECT username FROM images`;
    return images.query(q);
};

module.exports.getTitle = () => {
    const q = `SELECT title FROM images`;
    return images.query(q);
};

module.exports.getDescription = () => {
    const q = `SELECT description FROM images`;
    return images.query(q);
};
