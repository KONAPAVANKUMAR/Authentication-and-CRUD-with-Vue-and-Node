
new Vue({
    el: '#app',
    data: {
        usernameController: '',
        passwordController: '',

    },

    created : function(){
            // check if token is in local storage
            if (localStorage.getItem('token')) {
                // redirect to todo.html
                window.location.href = 'todo.html';
            }
    },


    methods: {
        login: function () {
            console.log("logging in")
            // if username or password is empty, show error message
            if (this.usernameController == '' || this.passwordController == '') {
                alert('Please fill in all fields');
            } else {
                fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.usernameController,
                        password: this.passwordController
                    })
                }).then(function (response) {
                    return response.json()
                }).then(function (data) {
                    if (data.status == 'success') {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        window.location.href = 'todo.html'
                    } else {
                        alert(data.status)
                    }
                })
            }
        }
    }
})