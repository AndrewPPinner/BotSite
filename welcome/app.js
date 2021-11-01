const app = Vue.createApp({
    data() {
        return {
            loggedIn: false
        }
    },
    methods: {
        
    },
    mounted() {
        axios
        .get("http://localhost:3000/profile/info")
        .then(res => (console.log(res), this.loggedIn = true))
        .catch(e => (console.log(e), this.loggedIn = false))
    }
    
})

app.mount('#app')