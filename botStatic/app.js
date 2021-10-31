
const app = Vue.createApp({
    data() {
        return {
            user: null,
            pass: null,
            url: null
        }
    },
    methods: {
        test(user, pass, url) {
            axios
            .get('http://localhost:3000/bot/user/' + user + "/" + pass + "/" + url)
            .then(response => (console.log(response)))
            .catch(e => (console.log(e)))
        }
    }
})

app.mount('#app')