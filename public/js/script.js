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
            console.log("component mounted selected imageId: ", this.imageid);
            let id = this.imageid;
            var self = this;
            axios.get("/modal/" + id).then(function (response) {
                let res = response.data[0];
                console.log("response from component: ", res);
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
                url: "",
                username: "",
                title: "",
                description: "",
                date: "",
            };
        }, //end of data
        props: [""],
        mounted: function () {
            console.log("component2 mounted selected imageId");
        },
        methods: {
            // closeModal: function () {
            //     // console.log("Close modal");
            //     this.$emit("close");
            // },
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

            clickedImage: function (e) {
                let url = e.target.currentSrc;
                let that = this;
                console.log("image clicked: ", url);
                let selectedImage = that.images.filter((x) => {
                    if (x.url == url) {
                        return x;
                    }
                })[0].id;
                console.log("selected image-ID: ", selectedImage);
                return selectedImage;
            },
        },
    });
})();
