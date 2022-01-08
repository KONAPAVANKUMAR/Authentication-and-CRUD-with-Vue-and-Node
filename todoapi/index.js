const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = 3000

// use
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

// listen
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// mongodb
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/TodoDB', { useNewUrlParser: true })

// use schema
const User = mongoose.model('User', {
    username: String,
    password: String,
    profilePic : {
        data : Buffer,
        contentType : String
    },
    // todos array
    todos: [{
        title: String,
        completed: Boolean
    }]
})

// multer
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({storage : storage})

// signup user
app.post('/signup', (req, res) => {
    var username = req.body.username
    var password = req.body.password

    // check if username already exists
    User.findOne({ username: username }, (err, user) => {
        if (err) {
            res.status(500).send(err)
        } else if (user) {
            res.status(400).send('Username already exists')
        }

        else{
            // bcrypt
            const saltRounds = 10
            bcrypt.hash(password, saltRounds, function (err, hash) {
                // create new user
                const newUser = new User({
                    username: username,
                    password: hash,
                    todos: []
                })

                // save user
                newUser.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    res.status(200).send(user)
                })
            })
        }
    })
})


// login user and send token
app.post('/login', (req, res) => {
    var username = req.body.username
    var password = req.body.password
    // find user
    User.findOne({ username: username }, (err, user) => {
        if (err) {
            res.status(500).send(err)
        }

        // compare password
        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                res.status(500).send(err)
            }

            // if password correct
            if (result) {
                // create token
                const token = jwt.sign({
                    username: user.username
                }, 'secret')

                // send token
                res.status(200).send({status : "success", token: token,user : user})
            } else {
                res.status(401).send({status : "wrong password"})
            }
        })
    })
})

// add todo to loggedin user
app.post('/todo', (req, res) => {
    // get bearer token from headers
    var token = req.headers['authorization']
    // remove bearer from token
    token = token.replace('Bearer ', '')

    // verify token
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            res.status(401).send('Invalid token')
        } else {
            var username = decoded.username
            var title = req.body.title

            // find user
            User.findOne({ username: username }, (err, user) => {
                if (err) {
                    res.status(500).send(err)
                }

                // add todo
                user.todos.push({
                    title: title,
                    completed: false
                })

                // save user
                user.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    res.status(200).send({status : "success", todos: user.todos})
                })
            })
        }
    })
})

// get todos from loggedin user
app.get('/todo', (req, res) => {
    // get bearer token from headers
    var token = req.headers['authorization']
    // remove bearer from token
    token = token.replace('Bearer ', '')
    // verify token
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            res.status(401).send('Invalid token')
        } else {
            var username = decoded.username

            // find user
            User.findOne({ username: username }, (err, user) => {
                if (err) {
                    res.status(500).send(err)
                }

                res.status(200).send({status : "success", todos: user.todos})
            })
        }
    })
})

// complete todo by id
app.put('/todo/:id', (req, res) => {
    // get bearer token from headers
    var token = req.headers['authorization']
    // remove bearer from token
    token = token.replace('Bearer ', '')
    // verify token
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            res.status(401).send('Invalid token')
        } else {
            var username = decoded.username
            var id = req.params.id

            // find user
            User.findOne({ username: username }, (err, user) => {
                if (err) {
                    res.status(500).send(err)
                }

                // find todo
                var todo = user.todos.id(id)
                if(todo.completed == true){
                    todo.completed = false
                }
                else{
                    todo.completed = true
                }
                

                // save user
                user.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    res.status(200).send({status : "success", todos: user.todos})
                })
            })
        }
    })
})


// delete todo by id
app.delete('/todo/:id', (req, res) => {
    // get bearer token from headers
    var token = req.headers['authorization']
    // remove bearer from token
    token = token.replace('Bearer ', '')
    // verify token
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            res.status(401).send('Invalid token')
        } else {
            var username = decoded.username
            var id = req.params.id

            // find user
            User.findOne({ username: username }, (err, user) => {
                if (err) {
                    res.status(500).send(err)
                }

                // find todo
                var todo = user.todos.id(id)
                // remove todo
                todo.remove()

                // save user
                user.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    res.status(200).send({status : "success", todos: user.todos})
                })
            })
        }
    })
})

// edit todo by id
app.put('/todo/update/:id', (req, res) => {
    // get bearer token from headers
    var token = req.headers['authorization']
    // remove bearer from token
    token = token.replace('Bearer ', '')
    // verify token
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            res.status(401).send('Invalid token')
        } else {
            var username = decoded.username
            var id = req.params.id
            var title = req.body.title

            // find user
            User.findOne({ username: username }, (err, user) => {
                if (err) {
                    res.status(500).send(err)
                }

                // find todo
                var todo = user.todos.id(id)
                todo.title = title

                // save user
                user.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    res.status(200).send({status : "success", todos: user.todos})
                })
            })
        }
    })
})

// update profile pic of loggedin user
app.put('/profilepic', (req, res) => {
    // get bearer token from headers
    var token = req.headers['authorization']
    // remove bearer from token
    token = token.replace('Bearer ', '')
    // verify token
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            res.status(401).send('Invalid token')
        } else {
            var username = decoded.username
            var profilepic = req.body.profilepic

            // find user
            User.findOne({ username: username }, (err, user) => {
                if (err) {
                    res.status(500).send(err)
                }

                // update profilepic
                user.profilepic = profilepic

                // save user
                user.save((err, user) => {
                    if (err) {
                        res.status(500).send(err)
                    }
                    res.status(200).send({status : "success", profilepic: user.profilepic})
                })
            })
        }
    })
})

// update username by id
app.put('/user/:id', (req, res) => {
    // get username by id
    var id = req.params.id
    // search username by id in mongo
    User.findById(id, (err, user) => {
        if (err) {
            res.status(500).send(err)
        }

        // update username
        user.username = req.body.username

        // save user
        user.save((err, user) => {
            if (err) {
                res.status(500).send(err)
            }
            res.status(200).send({status : "success", user: user})
        })
    })
})