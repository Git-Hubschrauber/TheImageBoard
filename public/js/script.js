console.log("hello");

(function () {
    new Vue({
        el: "#main",
        data: {
            name: "Adobo0",
            seen: "true",
            images: [],
        }, //data ends

        mounted: function () {
            console.log("vue instance has mounted");
            console.log("this outside axios", this);
            var self = this;
            axios.get("/images").then(function (response) {
                console.log("this inside axios", this);
                console.log("this/self inside axios", self);
                console.log("response from images: ", response);
                self.images = response.data;
            });
        },

        methods: {
            myFunction: function () {
                console.log("myfunction is running!!");
            },
        },
    });
})();
