const aws = require("aws-sdk");
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env;
} else {
    secrets = require("./secrets");
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

exports.upload = (req, res, next) => {
    if (!req.file) {
        return res.sendStatus(500);
    }

    const { filename, mimetype, size, path } = req.file;

    const promise = s3
        .putObject({
            Bucket: "adoboimageboard2021",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise();

    promise
        .then(() => {
            console.log("amazon upload complete!");
            next();
            fs.unlink(path, () => {});
        })
        .catch((err) => {
            console.log(err);
        });
};

module.exports.deleteFromAWS = async (link) => {
    const filename = link.replace(
        "https://s3.amazonaws.com/adoboimageboard2021/",
        ""
    );
    const params = {
        Bucket: "adoboimageboard2021",
        Key: filename,
    };
    try {
        await s3.deleteObject(params).promise();
        console.log("image deleted");
        return { success: true };
    } catch (error) {
        console.log("AWS deletion error", error);
        return { success: false };
    }
};
