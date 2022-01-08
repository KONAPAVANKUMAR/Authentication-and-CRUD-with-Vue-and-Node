new Vue({
    el : '#user',
    data : {
        token : '',
        user : null,
        usernameController : '',
    },
    created : function(){
        // check if token is in local storage
        if (localStorage.getItem('token')) {
            // if so, set token to local storage
            this.token = localStorage.getItem('token')
        }
        else {
            // if not, redirect to login page
            window.location.href = 'login.html';
        }

        this.getUser()        
    },
    methods : {
        logout : function(){
            // remove token from local storage
            localStorage.removeItem('token');
            // redirect to login page
            window.location.href = 'login.html';
        },

        getUser : function(){
            // get user from local storage
            this.user = JSON.parse(localStorage.getItem('user'))
            this.usernameController = this.user.username
        },

        updateUsername : async function(){
            userId = this.user._id
            updatedUsername = await this.usernameController
            this.user = await fetch('http://localhost:3000/user/' + userId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: updatedUsername
                })
            }).then(function (response) {
                return response.json()
            }
            ).then(function (data) {
                if (data.status == 'success') {
                    localStorage.setItem('user', JSON.stringify(data.user))
                    this.user = data.user
                } else {
                    alert(data.status)
                }
            })
        },

    }

})