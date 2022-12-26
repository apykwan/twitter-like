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

function createNotificationHtml(notification) {
  if (!notification) return;

  const text = getNotificationText(notification);
  const href = getNotificationUrl(notification);
  const className = notification.opened ? "" : "active";

  return `
    <a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
      <div class="resultsImageContainer">
        <img src="${notification.userFrom.profilePic}" alt="User profile picture" />
      </div>
      <div class="resultsDetailsContainer ellipsis">
        <span class="ellipsis">${text}</span>
      </div>
    </a>
  `;
}

function getNotificationText(notification) {
  const { userFrom, notificationType } = notification;
  if(!userFrom) return alert("user from data not populated");

  const userFromName = `${userFrom.firstName} ${userFrom.lastName}`;

  let text;
  switch(notificationType) {
    case "retweet":
      text = `${userFromName} retweeted one of your posts`;
      break;
    case "postLike":
      text = `${userFromName} liked one of your posts`;
      break;
    case "reply":
      text = `${userFromName} replied to one of your posts`;
      break;
    case "follow":
      text = `${userFromName} followed you`;
      break;
    default:
      text = "Something went wrong!!!";
  }

  return `<span class="ellisis">${text}</span>`;
}

function getNotificationUrl(notification) {
  const { notificationType, entityId } = notification;

  switch(notificationType) {
    case "retweet":
    case "postLike":
    case "reply":
      return `/posts/${entityId}`;
    case "follow":
      return `/profile/${entityId}`;
    default:
      return "#";
  }
}