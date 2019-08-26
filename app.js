
// nötige variablen werden initalisiert und definiert
var express = require("express")
var app = express ();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
const publicIP = require('public-ip');
var nickname = "anon";
var date = new Date();
var nicknameold = nickname;


// starte verbindung mit user/password , mysql
var mysqlcon = mysql.createConnection({
    host: "localhost",
    user: "webchat",
    password: "Euda1234!",
    database: "webchat"
});

// mysql-verbindungs-log, entweder error oder alles gut.
mysqlcon.connect(function(err) {
    if (err) throw err;
    console.log("MySQL connection established!");
// sql insert in webchat.logs.log ob der server erfolgreich gestartet ist.
var logsql = "INSERT INTO logs (log) VALUES ('server started!')";
    mysqlcon.query(logsql, function (err, result){
        if (err) throw err;
        console.log("DEBUG: start record in sql database inserted!")
    });
});

    // zugehörige seite wird aufgerufen - response
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/Page1.html');
});

    // express framework wird genutzt für url parsing?
app.use(express.urlencoded());


// http server wird gestartet auf port 3000
http.listen(3000, function () {
    console.log('listening on *:3000');
});


io.on('connection', function (socket) {
    // Hier falls eine neue Verbindung kommt

    // Wir möchten einen initialen Namen
    socket.nickname = "anon";

    socket.on('chat message', function (msg) {
        // Hier falls in der Verbindung eine Chatmessage ankommt
        io.emit('chat message', socket.nickname + ' sagt: ' + msg);
        console.log(socket.nickname + ': ' + msg);
        // STASI 2.0
        var messagesql = "INSERT INTO logs (log) VALUES ('" + date + " : " + socket.handshake.address + " : " + socket.nickname + " : " + msg + "')";
        mysqlcon.query(messagesql, function (err, result) {
            if (err) throw err;
            console.log("DEBUG: message in sql database inserted!")
    });
    });
    socket.on('setnickname', function (msg) {
        // Hier falls in der Nutzer in der Verbindung einen neuen Namen will, inklusive log wie der nutzer vorher hieß + mysql
        socket.nickname = msg;
        console.log(nicknameold + " changed the name to: " + socket.nickname);
        // STASI 3.0
        var nickchangesql = "INSERT INTO logs (log) VALUES ('" + date + " : " + socket.handshake.address + " : " + nicknameold + " changed the name to: " + socket.nickname + "')";
        mysqlcon.query(nickchangesql, function (err, result) {
            if (err) throw err;
            console.log("DEBUG: nickname change in sql database inserted!")
    });
        nicknameold = socket.nickname;
});
});


io.on('connection', function (socket) {
    // auch eine neue Verbindung, allerdings diesmal für die Übersicht getrennt
    // einmal ein log mit ip request des clients bei connect
    console.log( date + ' the ' + socket.handshake.address + ' is connected');
    io.emit('chat message', 'the ' + socket.handshake.address + ' is connected');
    var connectsql = "INSERT INTO logs (log) VALUES ('"+ date + " the ip " + socket.handshake.address + " is connected!')";
    mysqlcon.query(connectsql, function (err, result) {
        if (err) throw err;
        console.log("DEBUG: connect record in sql database inserted!")
    socket.on('disconnect', function () {
        // socket für disconnect mit request für die logs
        console.log('the ' + socket.handshake.address +' is disconnected');
        io.emit('chat message', 'the ' + socket.handshake.address + ' is disconnected');
        var disconnectsql = "INSERT INTO logs (log) VALUES ('"+ date + " the ip " + socket.handshake.address + " is disconnected!')";
        mysqlcon.query(disconnectsql, function (err, result) {
            if (err) throw err;
            console.log("DEBUG: disconnect record in sql database inserted!")
    });
});
});
});
