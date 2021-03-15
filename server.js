const express = require("express");
const app = express();
const imageData = require("./images");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.use(express.static("public"));
app.use(express.json());

app.get("/images", (req, res) => {
    imageData
        .getAllInfos()
        .then((results) => {
            res.json(results.rows);
        })
        .catch((err) => console.log("error in getAllInfos", err));
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    let url =
        "https://s3.amazonaws.com/adoboimageboard2021/" + req.file.filename;
    imageData
        .insertNewImageInfos(
            url,
            req.body.username,
            req.body.title,
            req.body.description
        )
        .then(() => {
            if (req.file) {
                imageData
                    .getNewImageInfo(url)
                    .then((results) => {
                        let data = results.rows;
                        res.json(data);
                    })
                    .catch((error) =>
                        console.log("error in getNewImageInfo2: ", error)
                    );
            } else {
                return res.json({ success: false });
            }
        })
        .catch((error) => {
            console.log("error in getNewImageInfo1: ", error);
        });
});

app.get("/modal/:id", (req, res) => {
    let id = req.params.id;
    imageData
        .getImageInfoById(id)
        .then((results) => {
            res.json(results.rows);
        })
        .catch((error) => {
            console.log("error in getImageInfoById in modal:", error);
        });
});

app.get("/comments/:id", (req, res) => {
    let imageId = req.params.id;
    imageData
        .getAllCommentInfoById(imageId)
        .then((results) => {
            res.json(results.rows);
        })
        .catch((err) => console.log("error in getAllCommentInfoById", err));
});

app.post("/comment", (req, res) => {
    let imageId = req.body.imageId;
    imageData
        .insertNewComment(req.body.comment, req.body.username, req.body.imageId)
        .then(() => {
            if (req.body.comment) {
                imageData
                    .getNewCommentInfoById(imageId)
                    .then((results) => {
                        let data = results.rows;
                        res.json(data);
                    })
                    .catch((error) =>
                        console.log("error in getNewCommentInfo: ", error)
                    );
            } else {
                return res.json({ success: false });
            }
        });
});

app.get("/more/:lastId", (req, res) => {
    let lastId = req.params.lastId;
    imageData
        .getNextImages(lastId)
        .then((results) => {
            res.json(results.rows);
        })
        .catch((err) => console.log("error in getNextImages", err));
});

app.get("/delete/:id", async (req, res) => {
    let id = req.params.id;
    let result = await imageData.getImageInfoById(id);
    console.log("req delete: ", result.rows[0].url);
    await s3.deleteFromAWS(result.rows[0].url);
    imageData
        .deleteImagefromComments(id)
        .then(() => imageData.deleteImagefromImages(id))
        .then(() => imageData.getAllInfos())
        .then((results) => {
            res.json(results.rows);
        })
        .catch((error) => {
            console.log("error in deleteImage: ", error);
        });
});

app.get("/next/:id", (req, res) => {
    let id = req.params.id;
    imageData
        .nextImageId(id)
        .then((results) => {
            res.json(results.rows);
        })
        .catch((error) => {
            console.log("error in nextImage: ", error);
        });
});

app.get("/previous/:id", (req, res) => {
    let id = req.params.id;
    imageData
        .previousImageId(id)
        .then((results) => {
            res.json(results.rows);
        })
        .catch((error) => {
            console.log("error in previousImage: ", error);
        });
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Server running ...");
});
