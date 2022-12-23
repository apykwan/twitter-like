/**GLOBAL VARIABLES */
let modalIsVisible, cropper, timer;
const selectedUsers = [];

/**POST SUBMIT BUTTON - ENABLING OR DISABLING */
$("#postTextarea, #replyTextarea").keyup(function (event) {
  const textbox = $(event.target);
  const value = textbox.val().trim();

  const isModal = textbox.parents(".modal").length == 1;
  
  const submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

  if (submitButton.length == 0) return alert("No submit button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }

  submitButton.prop("disabled", false);
});

/**POST SUBMIT BUTTON */
$("#submitPostButton, #submitReplyButton").click(function (event) {
  const button = $(event.target);

  const isModal = button.parents(".modal").length == 1;
  const textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

  const data = {
    content: textbox.val()
  };

  if (isModal) {
    const id = $("#submitReplyButton").data().id;
    if (!id) return alert("Button id is null");

    data.replyTo = id;
  }

  $.post("/api/posts", data, function(postData) {
    if (postData.replyTo) {
      location.reload();
    } else {
      const html = createPostHtml(postData);

      $(".postsContainer").prepend(html);
      textbox.val("");

      button.prop("disabled", true);
    }
  });
  modalIsVisible = false;
});

/** REPLY MODAL SUBMIT BUTTON*/
$("#replyModal").on("show.bs.modal", function(event) {
  event.stopPropagation();
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);

  // .data() would be stored in jQuery's cache
  $("#submitReplyButton").data("id", postId);

  $.get(`/api/posts/${postId}`, function(results) {
    outputPosts(results, $("#originalPostContainer"))
  });
  modalIsVisible = true;
});

/** REPLY MODAL REMOVE CONTENT AFTER CLOSING */
$("#replyModal").on("hidden.bs.modal", function() {
  $("#originalPostContainer").html("");
  modalIsVisible = false;
});

/** DELETE MODAL */
$("#deletePostModal").on("show.bs.modal", function(event) {
  event.stopPropagation();
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#deletePostButton").data("id", postId);

  modalIsVisible = true;
});

/** PIN MODAL */
$("#confirmPinModal").on("show.bs.modal", function(event) {
  event.stopPropagation();
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#pinPostButton").data("id", postId);

  modalIsVisible = true;
});

/** UNPIN MODAL */
$("#unpinModal").on("show.bs.modal", function(event) {
  event.stopPropagation();
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#unpinPostButton").data("id", postId);

  modalIsVisible = true;
});

/** DELETE MODAL SUBMIT BUTTON */
$("#deletePostButton").click(function (event) {
  const postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "DELETE",
    success: function(data, status, xhr) {
      if (xhr.status !== 202) {
        alert("Could not delete post!");
        return;
      }
      location.reload();
    }
  });
});

/** PIN MODAL PIN BUTTON */
$("#pinPostButton").click(function (event) {
  const postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: { pinned: true }, 
    success: function(data, status, xhr) {
      if (xhr.status !== 204) {
        alert("Could not pin post!");
        return;
      }
      location.reload();
    }
  });
});

/** UNPIN MODAL UNPIN BUTTON */
$("#unpinPostButton").click(function (event) {
  const postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: { pinned: false }, 
    success: function(data, status, xhr) {
      if (xhr.status !== 204) {
        alert("Could not pin post!");
        return;
      }
      location.reload();
    }
  });
});

/**UPLOAD PHOTO PREVIEW */
$('#filePhoto').change(function() {
  if(this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const image = document.getElementById("imagePreview");
      image.src = event.target.result;

      if(cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false
      });
    };
    reader.readAsDataURL(this.files[0]);
  }
});

/**UPLOAD PHOTO SUBMIT BUTTON */
$("#imageUploadButton").click(() => {
  const canvas = cropper.getCroppedCanvas();

  if(canvas == null) {
    alert("Could not upload image. Make sure it is an image file.")
    return;
  }

  canvas.toBlob(function(blob) {
    const formData = new FormData();
    formData.append("croppedImage", blob);
    
    $.ajax({
      url: "/api/users/profilePicture",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function() {
        location.reload();
      }
    })
  });
});

/**NEW MESSAGE USER SEARCH BOX */
$("#userSearchTextbox").keydown(function(event) {
  clearTimeout(timer);
  const textbox = $(event.target);
  let value = textbox.val();

  if(value == "" && (event.which == 8 || event.keyCode == 8)) {
    // remove user from selection
    selectedUsers.pop();
    updateSelectedUsersHtml();
    $(".resultsContainer").html("");

    if (selectedUsers.length === 0) {
      $("#createChatButton").prop("disabled", true);
    }

    return;
  }

  timer = setTimeout(function() {
    value = textbox.val().trim();

    if (value == "") {
      $(".resultsContainer").html("");
    } else {
      searchUsers(value);
    }
  }, 1000);
});

/**CREATE CHAT BUTTON */
$('#createChatButton').click(function() {
  const data = JSON.stringify(selectedUsers);

  $.post("/api/chats", { users: data }, function(chat) {
    if (!chat || !chat._id) alert("Invalid reponse from server.");

    window.location.href = `/messages/${chat._id}`;
  });
});

/**COVER PHOTO PREVIEW */
$('#coverPhoto').change(function() {
  if(this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const image = document.getElementById("coverPreview");
      image.src = event.target.result;

      if(cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false
      });
    };
    reader.readAsDataURL(this.files[0]);
  }
});

/**COVER PHOTO SUBMIT BUTTON */
$("#coverPhotoUploadButton").click(() => {
  const canvas = cropper.getCroppedCanvas();

  if(canvas == null) {
    alert("Could not upload image. Make sure it is an image file.")
    return;
  }

  canvas.toBlob(function(blob) {
    const formData = new FormData();
    formData.append("croppedImage", blob);
    
    $.ajax({
      url: "/api/users/coverPhoto",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function() {
        location.reload();
      }
    })
  });
});

/**LIKE BUTTON */
$(document).on('click', '.likeButton', function(event) {
  event.stopPropagation();
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if(postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: function(postData) {
      button.find("span").text(postData.likes.length || "");

      if(postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    }
  });
});

/**RETWEET BUTTON */
$(document).on('click', '.retweetButton', function(event) {
  event.stopPropagation();
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if (!postId) return;

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: "POST",
    success: function(postData) {
      button.find("span").text(postData.retweetUsers.length || "");

      if(postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    }
  });
});

/**TO POST PAGE */
$(document).on('click', '.post', function(event) {
  const element = $(event.target);
  const postId = getPostIdFromElement(element);
  // const modalIsVisible = $("#replyModal").is("visible");
 
  if (postId !== undefined && !element.is("button") && !modalIsVisible) {
    setTimeout(function() {
      if(!modalIsVisible) window.location.href = `/posts/${postId}`;
    }, 100);
  };
});

/**FOLLOW BUTTON */
$(document).on("click", ".followButton", function(event) {
  const button = $(event.target);
  const userId = button.data().user;
  
  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: "PUT",
    success: function(data, status, xhr) {
      if (xhr.status === 404) return;

      let difference = 1;

      if(data.following && data.following.includes(userId)) {
        button.addClass("following");
        button.text("Following");
      } else {
        button.removeClass("following");
        button.text("Follow");
        difference = -1;
      }

      const followersLabel = $("#followersValue");
      if (followersLabel.length > 0) {
        const followersText = followersLabel.text();
        followersLabel.text(Number(followersText) + difference);
      }
    }
  });
});

/**STOP BUBBLING WHEN CLICKING ON THE NAMES */
$(document).on("click", ".displayName, .username, .retweetedBy, #confirmPinModal", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".closeButton", function() {
  modalIsVisible = false;
});

/**FOR CHATROOM NAMES */
function getChatName(chatData) {
  let chatName = chatData.chatName;

  if(!chatName) {
    const otherChatUsers = getOtherChatUsers(chatData.users);
    const namesArray = otherChatUsers.map(function(user) {
      return `${user.firstName} ${user.lastName}`;
    });
    chatName = namesArray.join(", ");
  }

  return chatName;
}

function getOtherChatUsers(users) {
  if(users.length == 1) return users;

  // return users array without self
  return users.filter(user => user._id !== userLoggedIn._id);
}

/** RECEIVING MESSAGE FROM OTHER UERS */
function messageReceived(newMessage) {
  if($(".chatContainer").length == 0) {
    // Show popup notification

  } else {
    addChatMessageHtml(newMessage)
  }
}