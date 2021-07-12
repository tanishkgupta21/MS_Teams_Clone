const form = document.getElementById('send-form');
const input = document.getElementById('chat_message');
const main_window = document.querySelector('.chat_area');
const main__parti = document.querySelector('.participant_area');


const add_message = (message) => {
  const message_ = document.createElement('div');
  message_.innerText = message;
  main_window.append(message_);
}

const add_participant = (message) =>{
  const message_ = document.createElement('div');
  message_.setAttribute("id",message);
  message_.innerText = message;
  main__parti.append(message_);
}

const user_name = prompt("Enter your name");

// emit everyone that user join
socket.emit("user-join", ROOM_ID, user_name);
add_message(`${user_name} joined the chat`);
add_participant(`${user_name}`);


// listen 
socket.on('user-joined', name => {
  add_participant(`${name}`);
  add_message(`${name} joined the chat`);
});


socket.on('leaved', name =>{
add_message(`${name} leaved the chat`);
var elem = document.getElementById(name);
main__parti.removeChild(elem);
});

socket.on('receive', data => {
  add_message(`${data.name} : ${data.message}`);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = input.value;
  add_message(`You : ${message}`);
  socket.emit('send', ROOM_ID, message);
  input.value = '';
});

const hide_chat = () => {
  document.body.classList.toggle("chat_toggle");
}


const show_participant = () => {
  document.body.classList.toggle("participant_toggle");
}

const Invite = () =>{
  document.body.classList.toggle("invite_toggle");
}