const app = Vue.createApp({
    data() {
        return {
            profilePicture: ""
        }
    },
    methods: {
    },
    mounted() {
        axios({method: 'get',
        url: 'https://andrew-pinner.asuscomm.com/botsite/profile/info'  
    })
        .then(response => {
            this.profilePicture = "https://avatars.dicebear.com/api/bottts/" + response.data.nickname + ".svg"
        })
        .catch(e => (console.log(e)))
    }
})


app.mount("#app")
