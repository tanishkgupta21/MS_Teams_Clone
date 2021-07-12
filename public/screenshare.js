socket.on('everyone', id => {
    connect_user(id,mystream);
});

// for screen sharing
const Screenshare = () => {
    var display= {
        video :{
            cursor : "always"
        },
        audio : false
    };
        navigator.mediaDevices.getDisplayMedia(display).then((screen)=>{
            const video = document.createElement('video');
            mystream=screen;
            myscreen=mystream;
            add_stream(video,screen);
            socket.emit('me',ROOM_ID,currentUserId);         
        });
  }