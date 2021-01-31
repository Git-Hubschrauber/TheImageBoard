const express = require("express");
const app = express();
const imageData = require("./images");

app.use(express.static("public"));

app.get("/images", (req, res) => {
    imageData.getAllInfos().then((results) => {
        res.json(results.rows);
    });
});

app.listen(8080, () => {
    console.log("Server running ...");
});
