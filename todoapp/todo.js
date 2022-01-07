new Vue({
    el: '#todo',
    data: {
        token : '',
        todoController : '',
        todos : [],
        todoSelected : null,
        editController : '',
    },
    // on init
    created: function () {
        // check if token is in local storage
        if (localStorage.getItem('token')) {
            // if so, set token to local storage
            this.token = localStorage.getItem('token')
        } else {
            // if not, redirect to login page
            window.location.href = 'login.html';
        }

        this.getTodos()
        
    },


    methods : {
        logout: function () {
            // remove token from local storage
            localStorage.removeItem('token');
            // redirect to login page
            window.location.href = 'login.html';
        },

        getTodos : async function(){
            this.todos = await fetch('http://localhost:3000/todo', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token
                }
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (data.status == 'success') {
                    return data.todos
                } else {
                    alert(data.status)
                }
            })
        },


        toggleTodo : async function(todo){
            this.todos = await fetch('http://localhost:3000/todo/' + todo._id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token
                },
            }).then( function(response){

                return response.json()
            }).then(function(data){
                if(data.status == 'success'){
                    return data.todos
                }
            })
        },

        addTodo : async function(){
            var todo = this.todoController
            // if todo is empty, show error message
            if (todo == '') {
                alert('Please fill in all fields');
            }
            else {
                this.todos = await fetch('http://localhost:3000/todo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': this.token
                    },
                    body: JSON.stringify({
                        title : todo
                    })
                }).then(function (response) {
                    return response.json()
                }).then(function (data) {
                    if (data.status == 'success') {
                        // add todo to todos array
                        
                        return data.todos
                        // clear todoController
                        
                    } else {
                        alert(data.status);
                    }
                })

                this.todoController = ''
            }
        },


        deleteTodo : async function(todo){

            this.todos = await fetch('http://localhost:3000/todo/' + todo._id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token
                },
            }).then( function(response){
                return response.json()
            }).then(function(data){
                if(data.status == 'success'){
                    return data.todos
                }
            })
        },

        editTodo : async function(todo){
            
            var id = todo._id
            var title = this.editController
            this.todos = await fetch('http://localhost:3000/todo/update/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    title : title
                })
            }).then( function(response){
                return response.json()
            }
            ).then(function(data){
                if(data.status == 'success'){
                    // close exampleModal
                    $("#exampleModal").modal('hide');
                    return data.todos
                }
            })
        }

        
    }
})