const app = Vue.createApp({
    data() {
        return {
            loggedIn: false,
            profilePicture: '',
            number: ''
        }
    },
    methods: {
        getStock() {
            axios
            .get("https://gpubots.asuscomm.com/stock")
            .then(res => (console.log(res)))
            .catch()
        },
        updates(number) {
            axios
            .post()
            .then()
            .catch()
        }
    },
    mounted() {
        axios
        .get("https://gpubots.asuscomm.com/loggedin")
        .then(res => (console.log(res), this.loggedIn = true))
        .catch(e => (this.loggedIn = false))
        
        axios({method: 'get',
        url: 'https://gpubots.asuscomm.com/profile/info'  
    })
        .then(response => {
            this.profilePicture = "https://avatars.dicebear.com/api/bottts/" + response.data.nickname + ".svg"
        })
        .catch(e => (console.log(e)))
    }
    
})

app.mount('#app')
