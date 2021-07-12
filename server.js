const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);


const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.set("view engine", "ejs");

//  serve images, CSS files, and JavaScript files in a directory named public
app.use(express.static("public"));

// home page
app.get("/", (req, res) => {
  res.render("home");
});

// create room
app.get("/create", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

// after call chat
app.get("/chat/:room", (req, res) => {
  res.render("after_meeting", { roomId: req.params.room });
});

// before call chat
app.get("/before_call/:room", (req, res) => {
  res.render("before_meeting", { roomId: req.params.room });
});

// room
app.get("/:room", (req, res) => {
  res.render('room', { roomId: req.params.room });
});

// users in room
const users_ = {};

// users in after chat
const users_after = {};

// users in before chat
const users_before = {};

io.on("connection", (socket) => {

  // listen to user for join room
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    
    // emit everyone a new user connected
    socket.to(roomId).emit("call-connected", userId);
    
    // emit everyone a user disconnected
    socket.on('disconnect', () => {
      socket.to(roomId).emit("call-disconnected", userId);
    });
    
    // emit everyone a user leaved the room
    socket.on("leave", (roomId, userId) => {
      socket.to(roomId).emit("call-disconnected", userId);
    });

  });
  
  // listen to user who shares screen and emit to room
  socket.on("me", (roomId, id) => {
    socket.to(roomId).emit("everyone", id);
  })
  
  // a new user joined for chat
  socket.on('user-join', (roomId, name) => {
    socket.join(roomId);
    users_[socket.id] = name;

    // emit everyone in room a new user joined
    socket.to(roomId).emit('user-joined', name);
  });
  
  // listen to user who send messages and emit message everyone in room
  socket.on("send", (roomId, message) => {
    socket.to(roomId).emit('receive', { message: message, name: users_[socket.id] });
  });
  
  // listen to user leave the chat and emit everyone in room
  socket.on("leave-chat", (roomId, name) => {
    socket.to(roomId).emit('leaved', name);
  })
  
  // for after call chat 
  socket.on('user-join-after', (roomId, name) => {
    socket.join(roomId);
    users_after[socket.id] = name;
    socket.to(roomId).emit('user-joined-after', name);
  });
  

  socket.on("send-after", (roomId, message) => {
    socket.to(roomId).emit('receive-after', { message: message, name: users_after[socket.id] });
  });

  // for before call chat
  socket.on('user-join-before', (roomId, name) => {
    socket.join(roomId);
    users_before[socket.id] = name;
    socket.to(roomId).emit('user-joined-before', name);
  });

  socket.on("send-before", (roomId, message) => {
    socket.to(roomId).emit('receive-before', { message: message, name: users_before[socket.id] });
  });

});

var port = process.env.PORT || 7000;
server.listen(port);
