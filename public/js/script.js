console.log("hello");

(function () {
    Vue.component("first-component", {
        template: "#modal",
        data: function () {
            return {
                name: "Mario",
                count1: 0,
                count2: 0,
            };
        }, //end of data
        props: ["title", "description"],
        mounted: function () {
            console.log("component title: ", this.title);
            console.log("component description: ", this.description);
        },
        methods: {
            increaseCount: function () {
                this.count2++;
            },
            closeModal: function () {
                console.log("Close modal");
                this.$emit("close");
            },
        },
    });
    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            showButtons: false,
        }, //data ends

        mounted: function () {
            console.log("vue instance has mounted");
            // console.log("this outside axios", this);
            var self = this;
            axios.get("/images").then(function (response) {
                console.log("this inside axios", this);
                console.log("this/self inside axios", self);
                console.log("response from images: ", response.data);
                self.images = response.data;
                console.log("self image: ", self.images);
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
                        console.log("response: ", response);
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
            },
        },
    });
})();
