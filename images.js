const spicedPg = require("spiced-pg");

let images;
if (process.env.DATABASE_URL) {
    images = spicedPg(process.env.DATABASE_URL);
} else {
    images = spicedPg("postgres:postgres:postgres@localhost:5432/images");
}

module.exports.getAllInfos = () => {
    const q = `SELECT *, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS "lowestId" FROM images ORDER BY created_at DESC LIMIT 3`;
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

//
//
//

module.exports.getImageInfoById = (id) => {
    const q = `SELECT * FROM images WHERE id = ($1)`;
    const params = [id];
    return images.query(q, params);
};

//

module.exports.insertNewComment = (comment, username, imageId) => {
    const q = `INSERT INTO comments (comment, username, image_id) VALUES ($1,$2,$3)`;
    const params = [comment, username, imageId];
    return images.query(q, params);
};

module.exports.getAllCommentInfoById = (imageId) => {
    const q = `SELECT * FROM comments WHERE image_id = ($1) ORDER BY created_at DESC`;
    const params = [imageId];
    return images.query(q, params);
};

module.exports.getNewCommentInfoById = (imageId) => {
    const q = `SELECT * FROM comments WHERE image_id = ($1)`;
    const params = [imageId];
    return images.query(q, params);
};

//
//
//

module.exports.getNextImages = (lastId) => {
    const q = `SELECT url, title, id, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS "lowestId" FROM images
    WHERE id < ($1) ORDER BY id DESC LIMIT 3;`;
    const params = [lastId];
    return images.query(q, params);
};

module.exports.deleteImagefromComments = (id) => {
    const q = `DELETE FROM comments
    WHERE image_id = ($1);`;
    const params = [id];
    return images.query(q, params);
};

module.exports.deleteImagefromImages = (id) => {
    const q = `DELETE FROM images
    WHERE id = ($1);`;
    const params = [id];
    return images.query(q, params);
};

module.exports.nextImageId = (id) => {
    const q = `SELECT id, LAG(id, 1) OVER () AS next_image FROM images
    WHERE id > ($1);`;
    const params = [id];
    return images.query(q, params);
};

module.exports.previousImageId = (id) => {
    const q = `SELECT id, LEAD(id, 1) OVER () AS previous_image FROM images
    WHERE id < ($1) ORDER BY id DESC;`;
    const params = [id];
    return images.query(q, params);
};
