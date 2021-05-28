var ChatUser = require('./chatuser');

var express = require('express');
var app = express();

var passport = require('passport');

var cookieParser = require('cookie-parser')();
app.use(cookieParser);

var session = require('cookie-session')({
    keys: ['secret'],
    maxAge: 2 * 60 * 60 * 1000
});
app.use(session);

app.use(passport.initialize());
app.use(passport.session());

const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

httpServer.listen(5000);

io.use(function (socket, next) {
    var req = socket.handshake;
    var res = {};
    cookieParser(req, res, function (err) {
        if (err) return next(err);
        session(req, res, next);
    });
});

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
    function (username, password, done) {
        ChatUser.find({ username: username, password: password },
            function (err, data) {
                if(err) console.error(err);
                if (data.length)
                    return done(null, { id: data[0]._id, username: data[0].username });
                return done(null, false);
            })
    }));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (id, done) {
    ChatUser.find({ username: id.username },
        function (err, data) {
            if (data.length == 1)
                done(null, { _id: data[0].id, username: data[0].username });
        });
});

var auth = passport.authenticate(
    'local', {
    successRedirect: '/',
    failureRedirect: '/login'
});

var myAuth = function (req, res, next) {
    if (req.isAuthenticated())
        next();
    else {
        res.redirect('/login');
    }
}


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var users = [];
io.on('connection', function (socket) {
    if(!socket.handshake.session.passport) return;
    var user = socket.handshake.session.passport.user.username;
    
    var pos = users.indexOf(user);
    if (pos == -1) users.push(user);

    socket.on('messageSent', function (data) {
        socket.emit('receiveMessage', { success: true });
        socket.broadcast.emit('receiveMessage', { message: data });
    })
})


app.use(express.static(__dirname));

//перевірка чи user автентифікований
app.get('/', myAuth);
//опрацювання кореневого шляху
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/chat.html');
})
app.post('/login', auth);
app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/login.html');
})

app.listen(8080);
console.log('Run server!');
