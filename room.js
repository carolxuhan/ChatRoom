// var Room = {};
// var User = {};
// var socketio = io.connect();

function addroom(event){
	props = event.target.getBoundingClientRect();
	//document.getElementById("dialog").show();
	document.getElementById("create").style.left = props.left + 100 + 'px';
	document.getElementById("create").style.top = props.top + 10 + 'px';
	document.getElementById("create").style.display = "block";

	document.getElementById("displayusers").style.display = "none";

	document.getElementById("public").addEventListener("click", function(){
		document.getElementById("pwd").disabled = true;
		document.getElementById("pwd").value = "";
	}, false);

	document.getElementById("private").addEventListener("click", function(){
		document.getElementById("pwd").disabled = false;
	}, false);

	document.getElementById("confirm").addEventListener("click", createroom, false);
	document.getElementById("cancel").addEventListener("click", cancelAdd, false);
}

function cancelAdd(event){
	// document.getElementById("dialog").style.left = 0 + 'px';
	// document.getElementById("dialog").style.top = 0 + 'px';
	document.getElementById("create").style.display = "none";
}

function createroom(event) {
	/*************Do creating the room******************/
	//alert("create in");
	var roomname = document.getElementById("roomname").value;
	//var type = document.getElementById("").value;
	if (roomname === "") {
		alert("Room name cannot be empty.");
		return;
	}

	var type_pointers = document.getElementsByName("type");
	var type = null;
    for (var i = 0; i < type_pointers.length; i++) {
        if(type_pointers[i].checked){
            type = type_pointers[i].value;
            break;
        }
    }
    //alert(type);
    if (type === "private") {
    	var pwd = document.getElementById("pwd").value;
    	if(pwd == ""){
    		alert("The private room should has password.");
    		return;
    	}
    }
    else{var pwd = "###";}

    //var socketio = io.connect();
    var new_room = {"host": nickname, "rname": roomname, "type": type, "pwd": pwd};
    //alert(new_room.rname);
    socketio.emit("new_room", new_room);
}

function delRoom(event){
	//alert("deleting");
	/*************Do deleting the room******************/
	var roomname = document.getElementById("thisroom").value;
	var conf = confirm('Are you sure to remove the room "'+roomname+'"');

	if (!conf) {
		document.getElementById("displayusers").style.display = "none";
		$("ul#ruserlists li").empty();
		return;
	}
	
	socketio.emit("del_room", {"rname": roomname, "host": nickname});
	socketio.on("del_room_response", function(data){
		alert(data.msg);
		document.getElementById("displayusers").style.display = "none";
		//position = "Lobby";
		//User.pos[nickname] = "Lobby";
		//main_display();
	});
}

function joinRoom(event){
	var roomname = document.getElementById("thisroom").value;
	var conf = confirm('Are you sure to join the room "'+roomname+'"');

	if (!conf) {
		document.getElementById("displayusers").style.display = "none";
		$("ul#ruserlists li").empty();
		return;
	}
	
	//alert("join");
	//
	//if (Room.rban[roomname].indexOf(nickname) !== -1) {
	//	alert("Sorry, the host has banned you from joining this room.");
	//	document.getElementById("displayusers").style.display = "none";
	//	return;
	//}
	
	if (position === roomname) {
        var msg = "You've already in this room";//code
		document.getElementById("displayusers").style.display = "none";
		alert(msg);
		return;
    }
	
	//var type = Room.rinfo[roomname].type;
	socketio.emit("get_room_type", {"roomname": roomname});

	// 	socketio.emit("join_room", {"rname": roomname});
	// }
}

function joinprivateroom(event){
	var roomname = document.getElementById("thisroom").value;
	var pwd = document.getElementById("roompwd").value;
	socketio.emit("get_room_pwd", {"roomname": roomname, "pwd": pwd});
	//alert("join");
}

function backtolobby(event){
	socketio.emit("back_to_lobby", {"position": position, "nickname": nickname});
	
}


function roomusers(event){
	//alert("in");
	document.getElementById("create").style.display = "none";
	
	$("ul#ruserlists li").empty();
	var roomname = event.target.id;
	//alert(roomname);
	var rulist = Room.ruser[roomname];
	//alert(rulist);

	document.getElementById("thisroom").value = roomname;
	//alert(roomname);
	for (var i = 0; i < rulist.length; i++) {
		var newLi = document.createElement("li");
		newLi.innerHTML = rulist[i];
		document.getElementById("ruserlists").appendChild(newLi);
	}

	//alert("show");
	props = event.target.getBoundingClientRect();
	//document.getElementById("dialog").show();
	document.getElementById("displayusers").style.left = props.left + 20 + 'px';
	document.getElementById("displayusers").style.top = props.top + 10 + 'px';
	document.getElementById("displayusers").style.display = "block";

}

function hideusers(event){
	//alert("out");
	document.getElementById("displayusers").style.display = "none";
	$("ul#ruserlists li").empty();
	$("div#privatepart").empty();
}




// function clientListener(){
/*************Listen for updating the room******************/
//When the room has been updated, we should store the updated information for all rooms
socketio.on("room_update", function(data){
	//alert("in");
	
	var roomname = data.roomname;
	//var host = data.host;
	//var id = User.socket[host];
	// Room = roomdata;
	// User = userdata;

	if (data.opr === "add") {
		//alert();
		document.getElementById("message").appendChild(document.createTextNode("System"+" : "+roomname+" has been created."));
		document.getElementById("message").appendChild(document.createElement("hr"));
		//var host = data.host;
		//User.room[""+id].push(roomname);

		//Room.rinfo[roomname] = {"rname": data.info["rname"], "type": data.info["type"], "pwd": data.info["pwd"], "host": data.info["host"]};
		//Room.rinfo[roomname].rname = data.info["rname"];
		//Room.rinfo[roomname].type = data.info["type"];
		//Room.rinfo[roomname].pwd = data.info["pwd"];
		//Room.rinfo[roomname].type = data.info["host"];

		Room.rlist.push(data.roomname);
		//store the users for this room
		Room.ruser[data.roomname] = new Array();
		//Room.ruser[roomname].push(host);

		//Room.rban[roomname] = new Array();
		//alert("Room");
		var newLi = document.createElement("li");
		newLi.setAttribute("class", "room_list");
		//newLi.setAttribute("id", roomname);
		newLi.innerHTML = "<span id="+roomname+">"+roomname+"</span>";
		document.getElementById("rooms").appendChild(newLi);

		document.getElementById(roomname).addEventListener("mouseover", roomusers, false);
		document.getElementById(roomname).addEventListener("click", hideusers, false);
	}else{
		//User.room[""+id].remove(roomname);
		//delete Room.rinfo[roomname];
		Room.rlist = data.roomlist;
		Room.ruser = data.roomuser;
		User.pos = data.userpos;
		//delete Room.rban[roomname];

		document.getElementById("message").appendChild(document.createTextNode("System"+" : "+roomname+" has been deleted."));
		document.getElementById("message").appendChild(document.createElement("hr"));

		//Update the room.
		var list = Room.rlist;
		//$("ul#rooms li").empty();
		

		if (position === roomname) {
			alert("This room has been deleted by the host");
			position = "Lobby";
			document.getElementById("usertitle").innerHTML = "All Users";
			//User.pos[nickname] = "Lobby";
			//Room.ruser["Lobby"].push(nickname);
			document.getElementById("back").style.display = "none";
			main_display();
		}else{
			displayRoom(list);
		}
	}
		
});

socketio.on("new_room_response", function(data){
    alert(data.msg);
	if(data.success){
		document.getElementById("create").style.display = "none";
	}else{
		$("input[name='res']").click();
	}
});


// socketio.on("new_user", function(data){
// 	var username = data.newuser;
// 	var roomname = data.rname;
// 	Room.ruser[""+rname].push(username);

// 	if (username !== nickname) {

// 	}
// });
// }

socketio.on("join_room_response", function(data){
	var username = data.newuser;
	var roomname = data.rname;
	
	position = roomname;
	
	//User.pos[username] = roomname;
	if (!data.success) {
        alert(data.msg);
		document.getElementById("ruserlists").style.display = "none";
    }
	
	//alert("join "+roomname);
	
	//document.getElementById("position").innerHTML = roomname;
	
	//Room.ruser[roomname].push(username);
	//User.pos[username] = roomname;
	//Room.ruser["Lobby"].remove(username);
	
	//alert(Room.ruser[roomname]);
	//var userlist = Room.ruser[roomname];
	
	
	//document.getElementById("usertitle").innerHTML = roomname+"'s users";
	//displayUser(userlist);

	//document.getElementById("position").innerHTML = position;
	//document.getElementById("back").style.display = "block";
	//document.getElementById("displayusers").style.display = "none";
	// var btn = document.createElement("button");
});

socketio.on("back_response", function(data){
	document.getElementById("usertitle").innerHTML = "All Users";
	document.getElementById("back").style.display = "none";
	//Room.ruser[position].remove(data.nickname);
	//Room.ruser["Lobby"].push(data.nickname);
	//alert(Room.ruser[position]);
	position = "Lobby";
	
	//User.pos[data.nickname] = "Lobby";
	//main_display();

});

socketio.on("room_type_response", function(data){
	var type = data.type;
	var roomname = data.roomname;
	//alert(type);
	if (type !== "public") {
		document.getElementById("roompwd").value = "";
        document.getElementById("privatepart").style.display = "block";
    }else{
		//document.getElementById("joinprivate").click();
		socketio.emit("join_room", {"rname": roomname, "nickname": nickname});
	}
});

socketio.on("room_pwd_response", function(data){
	    if (!data.success) {
            alert(data.message);
			//alert(pwd+" "+data.pwd);
            //document.getElementById("privatepart").style.display = "block";
            // judge = false;
        }else{
            socketio.emit("join_room", {"rname": data.roomname, "nickname": nickname});
        }
s});
