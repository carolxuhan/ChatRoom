var User = {"info": {}, "list": new Array(), "room": {},"socket":{}, "pos": {}};
var Room = {"rinfo": {}, "rlist": new Array(), "ruser": {}, "rban": {}};
//Room.rinfo["Lobby"] = {"name": "lobby", "type": "public", "pwd": null, "host": null};
//Room.ruser["Lobby"] = new Array();

//*************function of array operation************
//Array.prototype.indexOf = function(val) {  
//   for (var i = 0; i < this.length; i++) {  
//       if (this[i] == val) return i;  
//    }  
//   return -1;  
//};

if (!Array.indexOf) {  
    Array.prototype.indexOf = function (obj) {  
        for (var i = 0; i < this.length; i++) {  
            if (this[i] == obj) {  
                return i;  
            }  
        }  
        return -1;  
    }  
}

if (!Array.remove) {
    Array.prototype.remove = function(val) {  
        var index = this.indexOf(val);  
        if (index > -1) {  
            this.splice(index, 1);  
        }
    };//code
}



//************ Require the packages we will use:*************
var http = require("http"),
	socketio = require("socket.io"),
	fs = require("fs");
    var path = require('path');
	// $ = require("jquery");
 
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(request, response){
    var filePath = '.' + request.url;
	if (filePath == './')
		filePath = './index.htm';
		
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}
	
	fs.exists(filePath, function(exists) {
	
		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});
		}
		else {
			response.writeHead(404);
			response.end();
		}
	}); 
    
	// This callback runs when a new connection is made to our HTTP server.
	//fs.readFile("mainpage.html", function(err, data){
	//	// This callback runs when the client.html file has been read from the filesystem.
	//	if(err) return resp.writeHead(500);
	//	resp.writeHead(200);
	//	resp.end(data);
	//});
});
app.listen(3456);

//******************Do the Socket.IO**********************
var io = socketio.listen(app);
//initialize variables
Room.rinfo["Lobby"] = {"name": "lobby", "type": "public", "pwd": "###", "host": null};
Room.ruser["Lobby"] = new Array();
	
io.sockets.on("connection", function(socket){
	// This callback runs when a new Socket.IO connection is established.

	console.log("connection");

	// User.info[socket.handshake.headers.cookie] = {"uid": null, "nickname": null, "img": null};//initialize user info,with index cookie
	User.info[""+socket.id] = {"uid": null, "nickname": null, "img": null};//initialize user info,with index
    //console.log(socket);
	// ******* the request for login
	socket.on('login_to_server', function(data) {
		// This callback runs when the server receives a new log in event from the client.
		// ********
		// User.info[socket.handshake.headers.cookie].uid = socket.handshake.headers.cookie;
		if (User.list.indexOf(data["user"]) !== -1) {
			socket.emit("login_message", {"success": false, "err": data["user"]+" has already existed."});
			return;
		}

		User.info[""+socket.id].uid = socket.id;
		// User.info[socket.handshake.headers.cookie].nickname = data["user"];
		User.info[""+socket.id].nickname = data["user"];
		// User.info[socket.handshake.headers.cookie].image = null;
        User.info[""+socket.id].image = data["image"];
		// Assign space for creating rooms
		User.room[""+socket.id] = new Array();

		User.list.push(data["user"]);//add current client's nickname into User.list array(array of all users)

		User.socket[data["user"]] = socket;//add current client's socket to User.socket array(array of all sockets, whith index nickname)

        console.log(data["user"]);
		User.pos[data["user"]] = "Lobby";

		Room.ruser["Lobby"].push(data["user"]);//add current client's nickname into Room.ruser["lobby"] array(array of users in the lobby)


		console.log("userlogin: "+data["user"]); // log it to the Node.JS output
        //console.log(socket);
		socket.emit("login_message", {"success": true, "roomlist": Room.rlist, "userlist": User.list, "roomuser": Room.ruser, "userpos": User.pos});

		io.sockets.emit("message_to_client",{"message":data["user"]+" comes into the lobby." }); // broadcast login message to all other users
		io.sockets.emit("user_update", {"nickname": data["user"], "image": data["image"], "uid": socket.id, "opr": "login"});//update all users' room userlist
		// io.sockets.emit("room_update", );
		// io.sockets.emit("listpeople",Room.ruser["lobby"]);//update all users' room userlist
	});

	//******************Chat*****************
	socket.on('message_to_server', function(data) {//public message request
		// This callback runs when the server receives a new message from the client.
		console.log(data["user"]+" : "+data["message"]); // log it to the Node.JS output
		io.sockets.emit("message_to_client",{message:data["message"],user:data["user"], "image": data["image"] }) // broadcast the message to other users
	});

	socket.on('private_message_to_server', function(data) {//private message request
		// This callback runs when the server receives a new private message from the client.
		console.log(data["user1"]+" to "+data["user2"]+" : "+data["message"]); // log it to the Node.JS output
		//find target_socket where nickname = data["user2"];
		var target_socket = User.socket[data["user2"]];
		target_socket.emit("private_message_to_client",{message:data["message"],user1:data["user1"],user2:data["user2"],"image": data["image"] }) // broadcast message
		socket.emit("private_message_to_client",{message:data["message"],user1:data["user1"],user2:data["user2"] ,"image": data["image"]}) // broadcast message
	});

	//******************Leave the page*****************
	socket.on("disconnect", function(){
		// ********
		// if (User.info[socket.handshake.headers.cookie].nickname) {//if client valid
		if (User.info[""+socket.id].nickname) {
			// *******
			// var user = User.info[socket.handshake.headers.cookie].nickname;//get current client's nickname 
			var user = User.info[""+socket.id].nickname;
            var roomname = User.pos[user];
			var rlist = User.room[""+socket.id];
            
            Room.ruser[roomname].remove(user);//remove nickname from the name list of lobby
			User.list.remove(user);//remove nickname from the name list of all users
            
            for (var i = 0; i < rlist.length; i++) {
                var r = rlist[i];
                Room.rlist.remove(r);
                delete Room.rban[r];
                
                var userlist = Room.ruser[r];
                for (var j = 0; j<userlist.length; j++) {
                    console.log("id:"+userlist[i]);
                    User.pos[userlist[i]] = "Lobby";
                    Room.ruser["Lobby"].push(userlist[i]);
                }
            }
            //console.log(ruserlist[0]);
			// ********
			// delete User.info[socket.handshake.headers.cookie];//delect user infomation
			delete User.info[""+socket.id];
			delete User.room[""+socket.id];
			delete User.socket[user];
			delete User.pos[user];
			// io.sockets.emit("listpeople",Room.ruser["lobby"]);//update all users' room userlist
			io.sockets.emit("user_update", {"nickname": user, "userlist": User.list, "roomlist": Room.rlist, "userpos": User.pos, "roomuser": Room.ruser, "opr": "leave"});
			console.log("userdisconnect: "+user);//log it to the Node.JS output
			io.sockets.emit("message_to_client",{message:user+" left the lobby." })//broadcast disconnect message to all other users
        }
	});

	//******* the request for creating new room from the client
	socket.on("new_room", function(data){
		var roomname = data.rname;
        
        console.log("create room "+roomname);
        
		//Firstly, we should check if the room name has already existed.
		if (Room.rlist.indexOf(roomname) !== -1) {
			var msg = {"success": false, "msg": "The room has existed."};
			socket.emit("new_room_repsonse", msg);
			return;
		}
        
		//if not, create information space for the room.
		var id = socket.id;
		var host = data.host;
        console.log("The host is "+host);
		//store the new room for the user
		User.room[""+id].push(roomname);
		// User.hostroom[""+id].push(roomname);
		//store the room information
		// data.host = host;
		Room.rinfo[roomname] = {"rname": data["rname"], "type": data["type"], "pwd": data["pwd"], "host": host};
		//Room.rinfo[roomname].rname = data["rname"];
		//Room.rinfo[roomname].type = data["type"];
		//Room.rinfo[roomname].pwd = data["pwd"];
		//Room.rinfo[roomname].type = data["host"];

		Room.rlist.push(roomname);
		//store the users for this room
		Room.ruser[roomname] = new Array();
		//Room.ruser[roomname].push(host);

		Room.rban[roomname] = new Array();
		//Success, transfer the success information to the client.
        
        console.log(Room.rinfo[roomname].rname+" has been stored");
		var msg = {"success": true, "msg": "The room has been successfully created."};
		socket.emit("new_room_response", msg);

		//var r = Room;
		io.sockets.emit("room_update", {"roomname": roomname, "host": host, "opr": "add"});
	});

	//The request for deleting the room
	socket.on("del_room", function(data){
		var rlist = User.room[socket.id];
		var roomname = data.rname;
		var index = rlist.indexOf(roomname);
		if (index === -1){
			var msg = {"success": false, "msg": "Sorry, you are not eligible to delete this room since you are not the host."};
			socket.emit("del_room_response", msg);
		}else{
			//Remove from the host's room list
			User.room[""+socket.id].remove(roomname);
			// User.hostroom[""+socket.id].splice(index,1);
			//Remove from the room's info
			delete Room.rinfo[roomname];
			//Remove from the room list
			// index = Room.rlist.indexOf(roomname);
			Room.rlist.remove(roomname);
			//Remove from the room user list
            var temp = Room.ruser[roomname];
            for(var i = 0; i<temp.length; i++){
                var userin = temp[i];
                User.pos[userin] = "Lobby";
            }
			delete Room.ruser[roomname];
			delete Room.rban[roomname];

			var msg = {"success": true, "msg": "Deletion is successfully done!"};
			socket.emit("del_room_response", msg);

			//var r = Room;
			io.sockets.emit("room_update", {"roomname": roomname, "roomlist": Room.rlist, "roomuser": Room.ruser, "userpos": User.pos, "opr": "del"});
		}	
	});

	//The request for join the room
	socket.on("join_room", function(data){
		//var rlist = User.room[socket.id];
		var nickname = data.nickname;
		var roomname = data.rname;

		console.log(roomname);
        
        Room.ruser[roomname].push(nickname);
        User.pos[nickname] = roomname;
        Room.ruser["Lobby"].remove(nickname);

		var userlist = Room.ruser[roomname];

		if (Room.rban[roomname].indexOf(nickname) !== -1) {
            socket.emit("join_room_response", {"success": false, "msg": "Failure: You have been banned by the room host."});//code
            return;
        }
		
        socket.emit("join_room_response", {"success": true, "rname": roomname, "newuser": nickname});
		// for (var i = 0; i < userlist.length; i++) {
		// 	var user = userlist[i];
		// 	var user_socket = User.socket[user];
		io.sockets.emit("user_update", {"rname": roomname, "nickname": nickname, "userpos": User.pos, "roomuser": Room.ruser, "opr": "join"});
		// }
		
	});

	socket.on("back_to_lobby", function(data){
		var user = data.nickname;
		var roomname = data.position;

		Room.ruser[roomname].remove(user);
        Room.ruser["Lobby"].push(user);
        User.pos[user] = "Lobby";

		//var userlist = Room.ruser[roomname];

		socket.emit("back_response", {"rname": roomname, "nickname": user});

		// for (var i = 0; i < userlist.length; i++) {
		// 	var user = userlist[i];
		// 	var user_socket = User.socket[user];
		io.sockets.emit("user_update", {"rname": roomname, "nickname": user, "roomuser": Room.ruser, "userpos": User.pos, "opr": "go"});
		// }
	});
    
    socket.on("kick_user", function(data){
        var username = data.username;
        var room = data.pos;
        
        Room.ruser[room].remove(username);
        User.pos[username] = "Lobby";
        
        //var kicked = User.socket[username];
        //kicked.emit("kicked_off_response", {});
        
        io.sockets.emit("kick_user_response", {"user": username, "roomname": room, "roomuser": Room.ruser, "userpos": User.pos});
    });
    
    socket.on("ban_user", function(data){
        var username = data.username;
        var room = data.pos;
        
        console.log(username+" and "+room);
        
        Room.ruser[room].remove(username);
        console.log(Room.ruser[room]+"2");
        
        User.pos[username] = "Lobby";
        console.log(User.pos[username]+"3");
        
        Room.rban[room].push(username);
        console.log(Room.rban[room]+"4");
        
        //var banned = User.socket[username];
        //kicked.emit("banned_response", {});
        
        io.sockets.emit("ban_user_response", {"user": username, "roomname": room, "roomuser": Room.ruser, "userpos": User.pos});
    });
    
    socket.on("get_room_type", function(data){
        var type = Room.rinfo[data.roomname].type;
        socket.emit("room_type_response", {"type": type, "roomname": data.roomname});
        console.log("give the room type to user");
    });
    
    socket.on("get_room_pwd", function(data){
        //console.log("get pass word");
        var pwd_hash = Room.rinfo[data.roomname].pwd;
        //console.log(pwd);
        if (pwd_hash === data.pwd) {
            msg = {"success": true, "roomname": data.roomname};
        }else{
            msg = {"success": false, "messgae": "Sorry, wrong password!"}
        }
        socket.emit("room_pwd_response", msg);
        //console.log("give the room pwd to client");
    });
    
    socket.on("get_room_host", function(data){
        var roomname = data.room;
        //console.log("room position: "+roomname);
        var host = Room.rinfo[roomname].host;
        socket.emit("room_host_response", {"host": host, "username": data.username});
    });
    
    socket.on("get_room_host2", function(data){
        var roomname = data.room;
        var host = Room.rinfo[roomname].host;
        socket.emit("room_host_response2", {"host": host, "username": data.username});
    });
    
    
});
