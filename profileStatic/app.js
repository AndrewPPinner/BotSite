const app = Vue.createApp({
    data() {
        return {
            username: '',
            profilePicture: ""
        }
    },
    methods: {
    },
    mounted() {
        axios({method: 'get',
        url: 'https://gpuforpeople.asuscomm.com/profile/info'  
    })
        .then(response => {
            this.username = response.data.nickname
            this.profilePicture = "https://avatars.dicebear.com/api/bottts/" + response.data.nickname + ".svg"
        })
        .catch(e => (console.log(e)))
    }
})


app.mount("#app")
