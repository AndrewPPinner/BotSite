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
        .get("https://gpuforpeople.asuscomm.com/loggedin")
        .then(res => (console.log(res), this.loggedIn = true))
        .catch(e => (this.loggedIn = false))
    }
    
})

app.mount('#app')
