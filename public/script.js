const socket = io("/");
const videoGrid = document.getElementById("video_array");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: '443',
});


let mystream;
let peers = {};
let currentUserId;
let myscreen;
let my_video;


var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

var user_display= {
  video : true , 
  audio : true
};

// get our user media
navigator.mediaDevices.getUserMedia(user_display)
  .then((stream) => {
    mystream = stream;
    my_video = stream;
    add_stream(myVideo, stream, "me");
    
    //new user connected
    socket.on("call-connected", (userId) => {
      connect_user(userId, stream);
    });
    
     // a user diconnected
    socket.on("call-disconnected", (userId,name) => {
      if (peers[userId]) { peers[userId].close(); }
    })
  });

// user join the room
peer.on("open", (id) => {
  currentUserId = id;
  socket.emit("join-room", ROOM_ID, id);
});

// connect with new user by calling peer
const connect_user = (userId, stream) => {
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    add_stream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call;
};

// add the given stream
const add_stream = (video, stream, id = "") => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
  Sizechange();
};

const Sizechange = () => {   
  var users = document.getElementById("video_array");
  users = users.children.length;
  var width = 100 / users;
  if (users > 3) {
    width = 33
    for (let user = 0; user < users; user++) {
      document.getElementsByTagName("video")[user].style.width =
        width + "%";
    }
  }
  else {
    for (let user = 0; user < users; user++) {
      document.getElementsByTagName("video")[user].style.width =
        width + "%";
    }
  }
};

// answer the call from other peer
let state = 0;
peer.on("call", function (call) {
  getUserMedia(
    user_display,
    function (stream) {
      call.answer(mystream);
      const video = document.createElement("video");
      if (mystream != myscreen) {
        call.on("stream", function (remoteStream) {
          add_stream(video, remoteStream);
        });
      }
    },
    function (err) {
      console.log("Failed to get local stream", err);
    });
});


// to copy url
const copyinvite = () => {
  var copy_url = document.getElementById("main_link");
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(copy_url);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("copy");
};

// video button
const playStop = () => {
  const enabled = my_video.getVideoTracks()[0].enabled;
  if (enabled) {
    my_video.getVideoTracks()[0].enabled = false;
    PlayVideo();
  }
  else {
    my_video.getVideoTracks()[0].enabled = true;
    StopVideo();
  }
}

const StopVideo = () => {
  const html = `
  <i class="fa fa-video-camera"></i>
  `
  document.querySelector(".video_button").innerHTML = html;
}
const PlayVideo = () => {
  const html = `
  <i class="fas fa-video-slash"></i>
  `
  document.querySelector(".video_button").innerHTML = html;
}


// for audio button
const muteUnmute = () => {
  const enabled = my_video.getAudioTracks()[0].enabled;
  if (enabled) {
    my_video.getAudioTracks()[0].enabled = false;
    UnmuteButton();
  }
  else {
    
    my_video.getAudioTracks()[0].enabled = true;
    MuteButton();
  }
}

const MuteButton = () => {
  const html = `
  <i class="fas fa-microphone"></i>
  `
  document.querySelector(".audio_button").innerHTML = html;
}
const UnmuteButton = () => {
  const html = `
  <i class="fas fa-microphone-slash"></i>
  `
  document.querySelector(".audio_button").innerHTML = html;
}
 
// user leaves the meeting
const leave_meeting = () => {
  // emit everyone in room that user disconnected
  socket.emit('leave-chat',ROOM_ID,user_name);
  socket.emit('leave', ROOM_ID, currentUserId);
}

// peer disconnected
peer.on("disconnected", id => {
  socket.emit('leave', ROOM_ID, id);
})
 
document.getElementById("main_link").innerText=url;

