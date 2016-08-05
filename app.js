var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io').listen(server);

/*设置静态资源目录*/
app.use(express.static(__dirname + '/public'));

/*默认路由*/
app.get('/', function (req, res) {
    res.sendfile('index.html');
});

var connectionList = {}; //存储当前连接信息

/*客户端建立连接*/
io.sockets.on('connection', function (socket) {

	var socketId = socket.id;

    /*客户端连接时，保存socketId和用户名*/
    connectionList[socketId] = {
        socket: socket
    };	

    /* 用户进入聊天室，向其他用户广播其用户名*/
    socket.on('join', function (data) {
        console.log(data.username + ' join, IP: ' + socket.client.conn.remoteAddress);
        connectionList[socketId].username = data.username;
        /*向所有的连接触发事件，这里注意：不包括本身连接的事件。*/
        socket.broadcast.emit('broadcast_join', data);
        console.log('broadcast_join event emit');
    });

    /* 用户离开聊天室 广播其离开聊天室的信息 */
    socket.on('disconnect',function(data){
        if(connectionList[socketId].username){
            console.log(connectionList[socketId].username + ' quit');
            socket.broadcast.emit('broadcast_quit', {
                username: connectionList[socketId].username
            });
        }
        delete connectionList[socketId];
    });


    /* 用户发言 广播其发言信息 */
    socket.on('say',function(data){
        console.log(" Received Message: " + data.text);
        socket.broadcast.emit('broadcast_say',{
            username: connectionList[socketId].username,
            text:data.text
        });
    });





});


/*监听端口*/
server.listen(3000, function () {
    console.log('listening port: 3000')
});