$(document).ready(function() {
  $.get("/api/notifications", function(data) {
    optputNotificationList(data, $(".resultsContainer"));
  });
});

$("#markNotificationsAsRead").click(function() {
  markNotificationsAsOpened();
});

function optputNotificationList(notifications, container) {
  if(notifications.length === 0) return container.append(`<span class="noResults">Nothing to show!</span>`);
    
  notifications.forEach(function(notification) {
    const html = createNotificationHtml(notification);
    container.append(html);
  });
}