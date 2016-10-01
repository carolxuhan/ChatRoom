var nickname = null;
var image = null;
var privatetarget = null;

//Login once load the page
function login () {
	//alert("login");
	nickname = document.getElementById("nickname").value;
	image = file;
	if (nickname) {
	   	socketio.emit("login_to_server",{user:nickname,image:image});
	   // $('#login').hide();
	}else{
		alert("nickname cannot be empty.");
	}
}

function SetPrivate(obj) {
	//privatetarget = document.getElementById("target").value;
	privatetarget = obj.id;
	if (User.pos[privatetarget] !== position) {
		alert('You are not in the same room. The user "'+privatetarget+'" is in '+User.pos[privatetarget]+'.');
		return;
	}
	document.getElementById("say").setAttribute("placeholder", "Speaking to "+privatetarget+"...");
	document.getElementById("pblc").style.display = "none";
	document.getElementById("say").style.width = "80%";
	document.getElementById("prvt").style.display = "inline";
}

function sendMessage(){
	//var nickname = "Tom";
	var msg = document.getElementById("say").value;
	socketio.emit("message_to_server",{message:msg,user:nickname,image:image});
}

function sendPrivateMessage(){
	//var nickname = "Tom";
	if (privatetarget) {
	   var msg = document.getElementById("say").value;
	   socketio.emit("private_message_to_server",{message:msg,user1:nickname,user2:privatetarget,image:image});
	}else{
	   alert("You must click a target first!");
	}
}

function oprusers(event){
	document.getElementById("userpos").style.display = "none";
	
	props = event.target.getBoundingClientRect();
	document.getElementById("usersopr").style.left = props.left - 200 + 'px';
	document.getElementById("usersopr").style.top = props.top + 'px';
	
	//alert(event.target.id);
	document.getElementById("target").value = event.target.id;
	document.getElementById("target2").value = event.target.id;
	//alert(event.target.id);
	// document.getElementById("usersopr").style.display = "none";

	document.getElementById("usersopr").style.display = "block";
}

function posuser(event){
	var user = event.target.id;
	//alert(user);
	var pos = User.pos[user];
	//alert(pos);
	document.getElementById("usersopr").style.display = "none";
	document.getElementById("userpos").innerHTML = '<b>Now: </b>'+pos;
	//document.getElementById("target").value = event.target.id;

	props = event.target.getBoundingClientRect();
	document.getElementById("userpos").style.left = props.left - 200 + 'px';
	document.getElementById("userpos").style.top = props.top + 10 + 'px';

	document.getElementById("userpos").style.display = "block";
}

function hideopr(event){
	document.getElementById("userpos").style.display = "none";
	document.getElementById("usersopr").style.display = "none";
}

function kickUser(event) {
	//alert("kick");
	var username = document.getElementById("target2").value;
	//alert(username);
	
	if (username === nickname) {
        alert("You cannot kick yourself.");
		return;
    }
	
	socketio.emit("get_room_host", {"room": position, "username": username});
	
}

socketio.on("room_host_response", function(data){
	if (data.host !== nickname) {
            alert("You are not eligible to kick others out.");//code
			document.getElementById("usersopr").style.display = "none";
			return;
    }
	socketio.emit("kick_user", {"username": data.username, "pos": position});
});

socketio.on("kick_user_response", function(data){
	Room.ruser = data.roomuser;
	User.pos = data.userpos;
	//kickeduser = data.user;
	
	if (position === data.roomname) {
		if (nickname!==data.user) {
            displayUser(Room.ruser[data.roomname]);//code
        }else{
			alert("You are kicked out by the host.");
			position = "Lobby";
			displayUser(User.list);
			document.getElementById("position").innerHTML = "Lobby@"+nickname;
			document.getElementById("usertitle").innerHTML = "All Users";
		}
        
    }
	document.getElementById("usersopr").style.display = "none";
});

function banUser(event) {
	//alert("kick");
    var username = document.getElementById("target2").value;
	//alert(username);
	
	if (username === nickname) {
        alert("You cannot ban yourself.");
		document.getElementById("usersopr").style.display = "none";
		return;
    }
	
	socketio.emit("get_room_host2", {"room": position, "username": username});
	
}

socketio.on("room_host_response2", function(data){
	if (data.host !== nickname) {
            alert("You are not eligible to ban others out.");//code
			document.getElementById("usersopr").style.display = "none";
			return;
    }
	//alert("start ban");
	socketio.emit("ban_user", {"username": data.username, "pos": position});
});


socketio.on("ban_user_response", function(data){
	//alert("start ban");
	Room.ruser = data.roomuser;
	User.pos = data.userpos;
	
	if (position === data.roomname) {
		if (nickname!==data.user) {
            displayUser(Room.ruser[data.roomname]);//code
        }else{
			alert("You are banned by the host.");
			position = "Lobby";
			displayUser(User.list);
			document.getElementById("position").innerHTML = "Lobby@"+nickname;
			document.getElementById("usertitle").innerHTML = "All Users";
		} 
    }
	document.getElementById("usersopr").style.display = "none";
});


socketio.on("login_message", function(data){
	//alert("in");
	if (data.success) {
		Room.rlist = data.roomlist;
		Room.ruser = data.roomuser;
		User.list = data.userlist;
		User.pos = data.userpos;
		//alert(nickname);

		position = "Lobby";

		document.getElementById("login").style.display = "none";
		main_display();
		document.getElementById("main").style.display = "block";
		//alert("login222");
	}else{
		alert(data.err);
	}
});

socketio.on("user_update", function(data){
	//alert("update");
	if (data.opr === "login") {
		//alert(nickname);
		if (data.nickname === nickname) {
			return;
		}
		var username = data.nickname;
		var image = data.image;
		//alert(position+username);
		//User.info[""+data.uid].uid = data.uid;
		//User.info[""+data.uid].nickname = username;
		//User.info[""+data.uid].image = null;

		User.room[""+data.uid] = new Array();

		User.list.push(username);
		User.pos[username] = "Lobby";

		User.socket[username] = data.uid;

		Room.ruser["Lobby"].push(username);

		if (position === "Lobby") {
			//alert(position);
			//var newLi = document.createElement("li");
			//newLi.setAttribute("class", "user_list");
			//newLi.innerHTML = '<span id="'+username+'" onclick="javascript:SetPrivate(this)">'+username+'</span>';
			//document.getElementById(username).addEventListener("mouseover", posuser, false);
			//document.getElementById("users").appendChild(newLi);
			displayUser(User.list);
		}
		
	}else if(data.opr === "leave"){
		//alert(0);
		var user = data.nickname;
		var up = User.pos[user];
		var list = new Array();
		
		//alert(1);
		
		Room.ruser = data.roomuser;
		Room.rlist = data.roomlist;
		User.list = data.userlist;
		
		User.pos = data.userpos;
		
		//alert(position);
		if (position === "Lobby") {
			main_display();
			return;
		}
		//displayUser(list);
		//displayRoom(Room.rlist);
		//if () {
		//alert(position);
		//alert(Room.rlist);
        if (Room.rlist.indexOf(position) === -1 && position !==  "Lobby") {
			alert(position);
			alert("The host of this room is off line. You should leave.");
			document.getElementById("position").innerHTML = "Lobby@"+nickname;
			document.getElementById("usertitle").innerHTML = "All Users";
			position = "Lobby";
			document.getElementById("back").style.display = "none";
			main_display();
			return;
		}//code
		if (position !== "Lobby" && up === position) {
			list = Room.ruser[position];
			displayUser(list);
		}
		
	}else if (data.opr === "join") {
		//alert(data.nickname+" "+nickname);
		//if (data.nickname == nickname) { return; }
		var username = data.nickname;
		
		document.getElementById("message").appendChild(document.createTextNode(username+" has joined into "+data.rname));
		document.getElementById("message").appendChild(document.createElement("hr"));
		
		Room.ruser = data.roomuser;
		User.pos = data.userpos;
		var userlist = Room.ruser[data.rname];
		
		if (position === data.rname) {
			displayUser(userlist);
		}
		if (position === "Lobby") {
            displayUser(User.list);
        }
		if (data.nickname === nickname) {
            document.getElementById("position").innerHTML = data.rname+"@"+nickname;
			document.getElementById("usertitle").innerHTML = data.rname+"'s users";
			displayUser(userlist);
			document.getElementById("back").style.display = "block";
			document.getElementById("displayusers").style.display = "none";
			document.getElementById("privatepart").style.display = "none";
			document.getElementById("userpos").style.display = "none";
        }
	}else if(data.opr === "go"){
		//if (data.nickname === nickname) { return; }
		Room.ruser = data.roomuser;
		User.pos = data.userpos;
		
		document.getElementById("message").appendChild(document.createTextNode(data.nickname+" return to Lobby."));
		document.getElementById("message").appendChild(document.createElement("hr"));

		if (data.nickname === nickname) {
			alert("name:"+nickname);
			document.getElementById("back").style.display = "none";
			document.getElementById("usertitle").innerHTML = "All Users";
			main_display();
		}
		if (position === data.rname) {
			alert("pos:"+position);
			displayUser(Room.ruser[position]);
		}
	}
});

// Display the message from others or system
socketio.on("message_to_client",function(data) {
    //Append an HR thematic break and the escaped HTML of the new message
	//alert("msg");
    if (data["user"]) {
		var DOM_img = document.createElement("img");
		DOM_img.src = data["image"];
		DOM_img.style.width = "50px";
		document.getElementById("message").appendChild(DOM_img);
        document.getElementById("message").appendChild(document.createTextNode(data["user"]+" : "+data['message']));
    }else{
       document.getElementById("message").appendChild(document.createTextNode("System : "+data['message']));
    }
	document.getElementById("message").appendChild(document.createElement("hr"));
});

socketio.on("private_message_to_client",function(data) {
	//Append an HR thematic break and the escaped HTML of the new message
	if (data["user1"]) {
		var DOM_img = document.createElement("img");
		DOM_img.src = data["image"];
		DOM_img.style.width = "50px";
		document.getElementById("message").appendChild(DOM_img);
		if (data["user1"] === nickname) {
           document.getElementById("message").appendChild(document.createTextNode("You to "+data["user2"]+" (private) : "+data['message']));
        }else{
			document.getElementById("message").appendChild(document.createTextNode(data["user1"]+" to you (private) : "+data['message']));
		} 
	}else{
	   document.getElementById("message").appendChild(document.createTextNode("System : "+data['message']));
	}
	document.getElementById("message").appendChild(document.createElement("hr"));
});
