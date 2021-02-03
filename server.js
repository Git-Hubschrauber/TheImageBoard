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
    imageData.getAllInfos().then((results) => {
        res.json(results.rows);
    });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("req.body in /upload: ", req.body);
    console.log("req.file in /upload: ", req.file);

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
                        console.log("new image data: ", data);
                        res.json(data);
                    })
                    .catch((error) =>
                        console.log("error in getNewImageInfo: ", error)
                    );
            } else {
                return res.json({ success: false });
            }
        });
});

app.get("/modal/:id", (req, res) => {
    console.log("req.params.id in /modal-get: ", req.params.id);
    let id = req.params.id;
    imageData.getImageInfoById(id).then((results) => {
        console.log(results.rows);
        res.json(results.rows);
    });
});

app.listen(8080, () => {
    console.log("Server running ...");
});
