const socket = io("/");
const form = document.getElementById('send-form');
const input = document.getElementById('chat_message');
const main_window = document.querySelector('.chat_area');

const add_message = (message) => {
  const message_ = document.createElement('div');
  message_.innerText = message;
  main_window.append(message_);
}

const user_name = prompt("Enter your name");

// emit everyone that user join
socket.emit("user-join-before", ROOMID, user_name);

add_message(`${user_name} joined the chat`);
socket.on('user-joined-before', name => {
  add_message(`${name} joined the chat`);
});

socket.on('receive-before', data => {
  add_message(`${data.name} : ${data.message}`);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = input.value;
  add_message(`You : ${message}`);
  socket.emit('send-before', ROOMID, message);
  input.value = '';
});