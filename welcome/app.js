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
        .get("http://192.168.50.74:3000/loggedin")
        .then(res => (console.log(res), this.loggedIn = true))
        .catch(e => (this.loggedIn = false))
    }
    
})

app.mount('#app')
