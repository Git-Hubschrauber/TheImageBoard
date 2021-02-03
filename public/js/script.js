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
            console.log("component1 mounted selected imageId: ", this.imageid);
            let id = this.imageid;
            var self = this;
            axios.get("/modal/" + id).then(function (response) {
                let res = response.data[0];
                // console.log("response from component1: ", res);
                self.url = res.url;
                self.username = res.username;
                self.title = res.title;
                self.description = res.description;
                var d = new Date(res.created_at);
                self.date = d.toLocaleDateString("en-GB");
            });
        },
        methods: {
            closeModal: function () {
                // console.log("Close modal");
                this.$emit("close");
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
            console.log("component2 mounted");
            let id = this.imageid2;
            var self = this;
            axios.get("/comments/" + id).then(function (response) {
                // console.log("this inside axios", this);
                // console.log("this/self inside axios", self);
                console.log("response from comments: ", response.data);
                self.comments = response.data;
                // console.log("self images: ", self.images);
            });
        },
        methods: {
            submitComment: function () {
                console.log("comment submitted: ", this);
                let fd = {};
                fd.comment = this.comment;
                fd.username = this.username;
                fd.imageId = this.imageid2;

                console.log("comment fd: ", fd);
                var self = this;
                axios
                    .post("/comment", fd)
                    .then(() => {
                        console.log(
                            "response from component2 submitComment: ",
                            fd
                        );
                        self.comments.unshift(fd);
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
            selectedImage: null,
            showMoreButton: true,
        }, //data ends

        mounted: function () {
            console.log("vue instance has mounted");
            // console.log("this outside axios", this);
            var self = this;
            axios.get("/images").then(function (response) {
                // console.log("this inside axios", this);
                // console.log("this/self inside axios", self);
                // console.log("response from images: ", response.data);
                self.images = response.data;
                // console.log("self images: ", self.images);
            });
        },

        methods: {
            clickHandler: function () {
                // console.log("this in ClickHandler: ", this);
                const fd = new FormData();
                fd.append("title", this.title);
                fd.append("description", this.description);
                fd.append("username", this.username);
                fd.append("file", this.file);
                axios
                    .post("/upload", fd)
                    .then((response) => {
                        // console.log("response: ", response);
                        this.images.unshift(response.data[0]);
                    })
                    .catch((error) => console.log("error: ", error));
            },
            fileSelectHandler: function (e) {
                console.log("fileSelectHandler here");
                this.file = e.target.files[0];
            },
            closeMe: function () {
                console.log("Close me");
                this.$data.selectedImage = null;
            },
            clickMore: function () {
                console.log("clickMore triggered");
                let lastId = this.$data.images[this.$data.images.length - 1].id;
                console.log("lastId in clickMore", lastId);
                var self = this;
                axios.get("/more/" + lastId).then(function (response) {
                    let res = response.data;
                    console.log("response from clickmore: ", res);
                    // console.log("last added image id:", res[res.length - 1].id);
                    // console.log(
                    //     "last image in data:",
                    //     res[res.length - 1].lowestId
                    // );

                    res.forEach((element) => {
                        self.images.push(element);
                    });
                    if (res[res.length - 1].id == res[0].lowestId) {
                        console.log("hide moreButton");
                        console.log(self);
                        self.$data.showMoreButton = false;
                    }
                });
            },
            // clickedImage: function (e) {
            //     let url = e.target.currentSrc;
            //     let that = this;
            //     console.log("image clicked: ", url);
            //     let selectedImage = that.images.filter((x) => {
            //         if (x.url == url) {
            //             return x;
            //         }
            //     })[0].id;
            //     console.log("selected image-ID: ", selectedImage);
            //     return selectedImage;
            // },
        },
    });
})();
