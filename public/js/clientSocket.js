let connected = false;

const socket = io("http://localhost:3003");

socket.emit("setup", userLoggedIn);

socket.on("connected", function() {
  connected = true;
});

socket.on("message received", function(newMessage) {
  messageReceived(newMessage);
});