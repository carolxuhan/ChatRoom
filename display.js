
function main_display(){
	//Fill the title
	position = "Lobby";
	document.getElementById("position").innerHTML = "Lobby@"+nickname;

	//Fill the room list
	var list = Room.rlist;
	displayRoom(list);

	//document.getElementById("displayusers").addEventListener("click", hideusers, false);

	//Fill the user list
	
	list = User.list;
	displayUser(list);
}


function displayRoom(list){
	var roomlist = document.getElementById("rooms");

	$("ul#rooms li").empty();
	for (var i = 0; i < list.length; i++) {
		var newLi = document.createElement("li");
		var roomname = list[i];

		newLi.setAttribute("class", "room_list");
		//newLi.setAttribute("id", roomname);
		newLi.innerHTML = "<span id="+roomname+">"+roomname+"</span>";
		roomlist.appendChild(newLi);
		document.getElementById(roomname).addEventListener("mouseover", roomusers, false);
		document.getElementById(roomname).addEventListener("click", hideusers, false);
	}
}

function displayUser(list){
	var userlist = document.getElementById("users");

	$("ul#users li").empty();
	for (var i = 0; i < list.length; i++) {
		var newLi = document.createElement("li");
		var username = list[i];

		newLi.setAttribute("class", "user_list");
		newLi.innerHTML = '<span id="'+username+'" onclick="javascript:SetPrivate(this)">'+username+'</span>';
		//newLi.innerHTML = '<span id="'+username+'>'+username+'</span>';
		userlist.appendChild(newLi);
		if (position === "Lobby") {
			if(User.pos[username] !== "Lobby"){ newLi.setAttribute("class", "offline"); }
			//alert("position");
			document.getElementById(username).addEventListener("mouseover", posuser, false);
		}else{
			document.getElementById(username).addEventListener("mouseover", oprusers, false);
		}
		//newLi.setAttribute("id", roomname);

		document.getElementById(username).addEventListener("click", hideopr, false);
	}
}