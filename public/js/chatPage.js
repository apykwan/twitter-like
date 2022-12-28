let typing = false;
let lastTypingTime = "";

$(document).ready(function() {
  socket.emit("join room", chatId);
  socket.on("typing", () => $(".typingDots").show());
  socket.on("stop typing", () => $(".typingDots").hide());

  $.get(`/api/chats/${chatId}`, function(data) {
    $("#chatName").text(getChatName(data));
  });

  $.get(`/api/chats/${chatId}/messages`, function(data) {
    const messages = [];
    let lastSenderId = "";
    
    data.forEach(function(message, index) {
      const nextData = data[index + 1] ? data[index + 1] : null;
      const html = createMessageHtml(message, nextData, lastSenderId);
      messages.push(html);

      lastSenderId = message.sender._id;
    });

    addMessagesHtmlToPage(messages.join(""));
    scrollToBottom(false);
    markAllMessagesAsRead();

    // remove the loading spinner
    $(".loadingSpinnerContainer").remove();
    $(".chatContainer").css("visibility", "visible");
  });
});

$('#chatNameButton').click(function() {
  const name = $("#chatNameTextbox").val().trim();

  $.ajax({
    url: `/api/chats/${chatId}`,
    type: "PUT",
    data: { chatName: name },
    success: function(data, status, xhr) {
      if(xhr.status !== 204) {
        alert("could not update");
      } else {
        location.reload();
      }
     }
  })
});

$(".sendMessageButton").click(function() {
  messageSubmitted();
  return false;
});

$(".inputTextbox").keydown(function(event) {
  updateTyping();

  if(event.which === 13) {
    messageSubmitted();
    return false;
  }
});

function updateTyping() {
  if(!connected) return;

  if(!typing) {
    typing = true;
    socket.emit("typing", chatId);
  }

  lastTypingTime = new Date().getTime();
  const timerLength = 3000;

  setTimeout(() => {
    const timeNow = new Date().getTime();
    const timeDiff = timeNow - lastTypingTime;

    if(timeDiff >= timerLength) {
      socket.emit("stop typing", chatId);
      typing = false;
    }
  }, timerLength);
}

function messageSubmitted() {
  const content = $(".inputTextbox").val().trim();

  if(content !== "") {
    sendMessage(content);
  }
}

function sendMessage(content) {
  $.post("/api/messages", { 
    content,
    chatId 
  }, function(data, status, xhr) {
    if(xhr.status != 201) {
      alert("Could not send message");
      $(".inputTextbox").val(content);
      return;
    }
    addChatMessageHtml(data);

    if(connected) {
      socket.emit("new message", data);
    }

    $(".inputTextbox").val("");
    socket.emit("stop typing", chatId);
    typing = false;
  });
}

function addChatMessageHtml(message) {
  if(!message || !message._id) {
    alert("Message is not valid");
    return;
  }

  const messageDiv = createMessageHtml(message, null, "");
  addMessagesHtmlToPage(messageDiv);
  scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {
  const sender = message.sender;
  const senderName = `${sender.firstName} ${sender.lastName}`;

  const currentSenderId = sender._id;
  const nextSenderId = nextMessage !== null ? nextMessage.sender._id : "";

  const isFirst = lastSenderId !== currentSenderId;
  const isLast = nextSenderId !== currentSenderId;

  const isMine = message.sender._id === userLoggedIn._id;
  let liClassName = isMine ? "mine" : "theirs";

  let profileImage = "";
  if(isLast) {
    liClassName += " last";
    profileImage = `<img src="${sender.profilePic}" />`;
  }

  let nameElement = "";
  if(isFirst) {
    liClassName += " first";

    // Only show names if not self
    if(!isMine) nameElement = `<span class="senderName">${senderName}</span>`
  }

  let imageContainer = "";
  if(!isMine) imageContainer = `<span class="imageContainer">${profileImage}</span>`;

  return `
    <li class="message ${liClassName}">
      ${imageContainer}
      <div class="messageContainer">
        ${nameElement}
        <span class="messageBody">
          ${message.content}
        </span>
      </div>
    </li>
  `;
}

function addMessagesHtmlToPage(html) {
  $(".chatMessages").append(html);

  // Scroll to bottom
}

function scrollToBottom(animated) {
  const container = $(".chatMessages");
  const scrollHeight = container[0].scrollHeight;

  if(animated) {
    container.animate({ scrollTop: scrollHeight }, "slow");
  } else {
    container.scrollTop(scrollHeight);
  }
}

function markAllMessagesAsRead() {
  $.ajax({
    url: `/api/chats/${chatId}/messages/markAsRead`,
    type: "PUT",
    success: function() {
      refreshMessagesBadge();
    }
  })
}