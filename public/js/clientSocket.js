let connected = false;

const socket = io("http://localhost:3003");

socket.emit("setup", userLoggedIn);

socket.on("connected", function() {
  connected = true;
});

socket.on("message received", function(newMessage) {
  messageReceived(newMessage);
});

socket.on("notification received", function() {
  $.get("/api/notifications/latest", function(notificationData) {
    showNotificationPopup(notificationData);
    refreshNotificationBadge();
  });
});

function emitNotification(userId) {
  if(userId == userLoggedIn._id) return;

  socket.emit("notification received", userId);
}