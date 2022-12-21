$(document).ready(function() {
  $.get("/api/chats", function(data, status, xhr) {
    if(xhr.status == 400) {
      alert("Could not get chat list");
    } else {
      outputChatList(data, $(".resultsContainer"));
    }
  })
});

function outputChatList(chatList, container) {
  chatList.forEach(chat => {
    const html = createChatHtml(chat);
    container.append(html);
  });

  if(chatList.length == 0) {
    container.append(`<span class="noResults">Nothing to show!</span>`);
  }
}

function createChatHtml(chatData) {
  let chatName = getChatName(chatData);
  let image = getChatImageElements(chatData);
  let latestMessage = getLatestMessage(chatData.latestMessage);

  return `
    <a href="/messages/${chatData._id}" class="resultListItem">
      ${image}
      <div class="resultsDetailsContainer ellipsis">
        <span class="heading ellipsis">${chatName}</span>
        <span class="subText ellipsis">${latestMessage}</span>
      </div>
    </a>
  `;
}

function getLatestMessage(getLatestMessage) {
  if(getLatestMessage != null) {
    const sender = getLatestMessage.sender;
    return `${sender.firstName} ${sender.lastName}: ${getLatestMessage.content}`;
  }
  return "New Chat";
}

function getChatImageElements(chatData) {
  const otherChatUsers = getOtherChatUsers(chatData.users);

  let groupChatClass = "";
  let chatImage = getUserChatImageElment(otherChatUsers[0]);

  if(otherChatUsers.length > 1) {
    groupChatClass = "groupChatImage";
    chatImage += getUserChatImageElment(otherChatUsers[1])
  }

  return `
    <div class="resultsImageContainer ${groupChatClass}">${chatImage}</div>
  `;
}

function getUserChatImageElment(user) {
  if(!user || !user.profilePic) {
    return alert("User passed into function invalid");
  }

  return `<img src="${user.profilePic}" alt="User's profile pic">`;
}