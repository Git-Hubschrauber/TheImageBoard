const spicedPg = require("spiced-pg");

let images;
if (process.env.DATABASE_URL) {
    images = spicedPg(process.env.DATABASE_URL);
} else {
    images = spicedPg("postgres:postgres:postgres@localhost:5432/images");
}

module.exports.getAllInfos = () => {
    const q = `SELECT * FROM images`;
    return images.query(q);
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
