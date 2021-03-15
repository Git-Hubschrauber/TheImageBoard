(function () {
    Vue.component("first-component", {
        template: "#modal",
        data: function () {
            return {
                url: "",
                username: "",
                title: "",
                description: "",
                date: "",
            };
        }, //end of data
        props: ["imageid"],
        mounted: function () {
            let id = this.imageid;
            var self = this;
            if (!Number.isInteger(+id)) {
                this.$emit("close");
            }
            axios
                .get("/modal/" + id)
                .then(function (response) {
                    let res = response.data[0];

                    self.url = res.url;
                    self.username = res.username;
                    self.title = res.title;
                    self.description = res.description;
                    var d = new Date(res.created_at);
                    self.date = d.toLocaleDateString("en-GB");
                })
                .catch((error) => {
                    console.log("error in modal-id: ", error);

                    this.$emit("close");
                });
        },

        watch: {
            imageid: function () {
                let id = this.imageid;
                var self = this;
                if (!Number.isInteger(+id)) {
                    this.$emit("close");
                }
                axios
                    .get("/modal/" + id)
                    .then(function (response) {
                        let res = response.data[0];
                        self.url = res.url;
                        self.username = res.username;
                        self.title = res.title;
                        self.description = res.description;
                        var d = new Date(res.created_at);
                        self.date = d.toLocaleDateString("en-GB");
                    })
                    .catch((error) => {
                        console.log("error in modal-id: ", error);
                        this.$emit("close");
                    });
            },
        },

        methods: {
            closeModal: function () {
                this.$emit("close");
            },
            deleteImage: function () {
                this.$emit("delete");
            },
            clicknext: function () {
                this.$emit("clicknext");
            },
            clickprevious: function () {
                this.$emit("clickprevious");
            },
        },
    }); // end of first component

    //
    //
    //
    Vue.component("second-component", {
        template: "#comment",
        data: function () {
            return {
                comments: [],
                comment: "",
                username: "",
            };
        }, //end of data
        props: ["imageid2"],
        mounted: function () {
            let id = this.imageid2;
            var self = this;
            axios.get("/comments/" + id).then(function (response) {
                self.comments = response.data;
            });
        },

        watch: {
            imageid2: function () {
                let id = this.imageid2;
                var self = this;
                axios.get("/comments/" + id).then(function (response) {
                    self.comments = response.data;
                });
            },
        },

        methods: {
            submitComment: function () {
                let fd = {};
                fd.comment = this.comment;
                fd.username = this.username;
                fd.imageId = this.imageid2;
                var self = this;
                axios
                    .post("/comment", fd)
                    .then(() => {
                        self.comments.unshift(fd);
                        self.comment = "";
                        self.username = "";
                    })
                    .catch((error) => console.log("error: ", error));
            },
        },
    }); // end of second component

    //
    //
    //
    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            selectedImage: location.hash.slice(1),
            showMoreButton: true,
            newImages: false,
        },

        mounted: function () {
            addEventListener("hashchange", () => {
                this.selectedImage = location.hash.slice(1);
            });

            var self = this;
            axios
                .get("/images")
                .then(function (response) {
                    self.images = response.data;
                    let res = response.data;
                    if (res[res.length - 1].id == res[0].lowestId) {
                        self.$data.showMoreButton = false;
                    }
                })
                .catch((error) =>
                    console.log("error in getting images:", error)
                );
        }, // end of mounted

        methods: {
            clickHandler: function () {
                const fd = new FormData();
                fd.append("title", this.title);
                fd.append("description", this.description);
                fd.append("username", this.username);
                fd.append("file", this.file);

                axios
                    .post("/upload", fd)
                    .then((response) => {
                        this.images.unshift(response.data[0]);
                    })
                    .catch((error) =>
                        console.log("error in clickhandler: ", error)
                    );
                this.title = "";
                this.description = "";
                this.username = "";
                this.file = "";
            },
            fileSelectHandler: function (e) {
                this.file = e.target.files[0];
            },
            closeMe: function () {
                location.hash = "";
                this.$data.selectedImage = null;
            },

            removeImage: function () {
                var self = this;
                let id = location.hash.slice(1);
                axios
                    .get("/delete/" + id)
                    .then(axios.get("/images"))
                    .then(function (response) {
                        self.images = response.data;
                        location.hash = "";
                        self.$data.selectedImage = null;
                        let res = response.data;
                        if (res[res.length - 1].id == res[0].lowestId) {
                            self.$data.showMoreButton = false;
                        }
                    })
                    .catch((error) =>
                        console.log(
                            "error in getting images after deleteImage:",
                            error
                        )
                    );
            },

            clickMore: function () {
                let lastId = this.$data.images[this.$data.images.length - 1].id;
                var self = this;
                axios.get("/more/" + lastId).then(function (response) {
                    let res = response.data;
                    res.forEach((element) => {
                        self.images.push(element);
                    });
                    if (res[res.length - 1].id == res[0].lowestId) {
                        self.$data.showMoreButton = false;
                    }
                });
            },

            displaynext: function () {
                let id = location.hash.slice(1);
                let self = this;
                axios.get("/next/" + id).then((response) => {
                    let nextId = response.data[0].id;
                    location.hash = Number(nextId);
                    self.$data.selectedImage = Number(nextId);
                });
            },
            displayprevious: function () {
                let id = location.hash.slice(1);
                let self = this;
                axios.get("/previous/" + id).then((response) => {
                    let previousId = response.data[0].id;
                    location.hash = Number(previousId);
                    self.$data.selectedImage = Number(previousId);
                });
            },

            checkForNewImages: function () {
                var self = this;
                var idNow = self.$data.images[0].id;

                setInterval(function myCallback() {
                    axios.get("/images").then(function (response) {
                        if (response.data[0].id > idNow) {
                            self.$data.newImages = true;
                        }
                    });
                }, 5000);
            },
        },
    });
})();
