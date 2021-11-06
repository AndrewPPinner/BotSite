const app = Vue.createApp({
    data() {
        return {
            user: null,
            pass: null,
            url: null,
            show: false
        }
    },
    methods: {
        test(user, pass, url, token) {
            //https://quickbots.herokuapp.com/
            axios({method: 'get',
                    url: 'http://localhost:3000/bot/user/' + user + "/" + pass + "/" + url,
                    headers: { "authorization": "Bearer " + token}    
                })
            .then(response => (console.log(response), this.show = true))
            .catch(e => (console.log(e)))
        },
        getToken(token, user, pass, url) {
            axios
            //https://quickbots.herokuapp.com/profile/ID
            .get("http://localhost:3000/profile/ID")
            .then(response => {
                const token = response.data
                this.test(user, pass, url, token)
            })
            .catch(e =>(console.log(e)))
        }
    }
})

app.mount('#app')