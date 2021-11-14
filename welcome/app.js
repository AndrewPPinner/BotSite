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
        .get("http://173.89.66.162:3000/loggedin")
        .then(res => (console.log(res), this.loggedIn = true))
        .catch(e => (this.loggedIn = false))
    }
    
})

app.mount('#app')