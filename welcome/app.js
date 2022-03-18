const app = Vue.createApp({
    data() {
        return {
            loggedIn: false,
            profilePicture: ''
        }
    },
    methods: {
        
    },
    mounted() {
        axios
        .get("https://andrew-pinner.asuscomm.com/botsite/loggedin")
        .then(res => (console.log(res), this.loggedIn = true))
        .catch(e => (this.loggedIn = false))
        
        axios({method: 'get',
        url: 'https://andrew-pinner.asuscomm.com/botsite/profile/info'  
    })
        .then(response => {
            this.profilePicture = "https://avatars.dicebear.com/api/bottts/" + response.data.nickname + ".svg"
        })
        .catch(e => (console.log(e)))
    }
    
})

app.mount('#app')
