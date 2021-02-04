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
        // console.log("getAllInfos: ", results.rows);
        res.json(results.rows);
    });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    // console.log("req.body in /upload: ", req.body);
    // console.log("req.file in /upload: ", req.file);

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
                        // console.log("new image data: ", data);
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

//
//
//

app.get("/modal/:id", (req, res) => {
    // console.log("req.params.id in /modal-get: ", req.params.id);
    let id = req.params.id;
    imageData
        .getImageInfoById(id)
        .then((results) => {
            //console.log("getImageInfoById in modal:", results.rows);
            res.json(results.rows);
        })
        .catch((error) => {
            console.log("error in getImageInfoById in modal:", error);
        });
});

//
//
//

app.get("/comments/:id", (req, res) => {
    // console.log("req.params.id in /comments-get: ", req.params.id);
    let imageId = req.params.id;
    imageData.getAllCommentInfoById(imageId).then((results) => {
        // console.log("getAllCommentInfoById results: ", results.rows);
        res.json(results.rows);
    });
});

app.post("/comment", (req, res) => {
    // console.log("req.body in/comments/upload: ", req.body);

    let imageId = req.body.imageId;

    imageData
        .insertNewComment(req.body.comment, req.body.username, req.body.imageId)
        .then(() => {
            // console.log("InsertNewComment done");
            if (req.body.comment) {
                imageData
                    .getNewCommentInfoById(imageId)
                    .then((results) => {
                        let data = results.rows;
                        // console.log("new comment data: ", data);
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

//
//
//

app.get("/more/:lastId", (req, res) => {
    let lastId = req.params.lastId;
    // console.log("more route lastId", lastId);
    imageData.getNextImages(lastId).then((results) => {
        // console.log("results.rows in more route: ", results.rows);
        res.json(results.rows);
    });
});

app.get("/delete/:id", (req, res) => {
    // console.log("req.params.id in /comments-get: ", req.params.id);
    let id = req.params.id;
    imageData
        .deleteImagefromComments(id)
        .then(() => imageData.deleteImagefromImages(id))
        .then(() => imageData.getAllInfos())
        .then((results) => {
            // console.log("deleted??: ", results);
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
            // console.log("nextimageId: ", results.rows);
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
            // console.log("previousimageId: ", results);
            res.json(results.rows);
        })
        .catch((error) => {
            console.log("error in previousImage: ", error);
        });
});

app.listen(8080, () => {
    console.log("Server running ...");
});
