1. When user enters in a room a peer object is created 
   
   var peer = new Peer(undefined, {
   path: "/peerjs",
   host: "/",
   port: '443',
   });
 
2. Every Peer object is assigned a unique ID when it's created
   and a connection is established and we emit server that a user join
   
   peer.on("open", (id) => {
   currentUserId = id;
   socket.emit("join-room", ROOM_ID, id);
   });

3. When a peer object is created his display stream is added to his page
   navigator.mediaDevices.getUserMedia(user_display)
   add_stream(myVideo, stream, "me");

4. At the server side , it listens that user joins and a socket is created
   and message is emitted to everyone in the room .
   Also listen to the message when user leaves or disconnect and emit
   everyone in the room that user disconnected.

    socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("call-connected", userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit("call-disconnected", userId);
    });

    socket.on("leave", (roomId, userId) => {
      socket.to(roomId).emit("call-disconnected", userId);
    });
    }); 


5. To call the user who joins and get his stream 
   const call = peer.call(userId, stream)
   call.on('stream', userVideoStream => {
    add_stream(video, userVideoStream)
   })

   To answer a call from peer with our stream 
   peer.on("call", function (call) 
   call.answer(mystream); 

6. For chatting,  users messages are emmited with socket
   socket.emit('send', ROOM_ID, message);
    
   Messages listened by the server and it emit it to everyone in the room
   socket.on("send", (roomId, message) => {
    socket.to(roomId).emit('receive', { message: message, name: users_[socket.id] });
   });

   Messages listened by client
   socket.on('receive', data => {
   add_message(`${data.name} : ${data.message}`);
   });

7  When user the meeting a message is emmited to server 
   socket.emit('leave-chat',ROOM_ID,user_name);
   socket.emit('leave', ROOM_ID, currentUserId);
    
   When peer disconnect a message will bw emmited to server 
   peer.on("disconnected", id => {
   socket.emit('leave', ROOM_ID, id);
   })
   
   Message from server is listened by the client to remove video
   socket.on("call-disconnected", (userId,name) => {
      if (peers[userId]) { peers[userId].close(); }
   })

   
