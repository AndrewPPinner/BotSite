const app = Vue.createApp({
    data() {
        return {
            loggedIn: false,
            profilePicture: '',
            email: '',
            response: {}
        }
    },
    methods: {
        //get token for authorization to use endpoint
        getToken(token) {
            axios
            .get("https://andrew-pinner.asuscomm.com/botsite/profile/ID")
            .then(response => {
                const token = response.data
                this.getStock(token)
            })
            .catch(e =>(console.log(e)))
        },

//get stock information from server
        getStock(token) {
            axios({method: 'get',
            url: 'https://andrew-pinner.asuscomm.com/botsite/stock',
            headers: { "authorization": "Bearer " + token}})
            .then(res => (this.response = res.data, console.log(res)))
            .catch(e => (console.log(e)))
        },

        updates(email) {
            axios
            .post()
            .then()
            .catch()
        }
    },

    mounted() {
        //check if logged in
        axios
        .get("https://andrew-pinner.asuscomm.com/botsite/loggedin")
        .then(res => (this.loggedIn = true))
        .catch(e => (this.loggedIn = false))

        //get profile picture
        axios
        ({method: 'get',
        url: 'https://andrew-pinner.asuscomm.com/botsite/profile/info'})
        .then(response => {
        this.profilePicture = "https://avatars.dicebear.com/api/bottts/" + response.data.nickname + ".svg"})
        .catch(e => (console.log(e)))
    }
    
})

app.mount('#app')
