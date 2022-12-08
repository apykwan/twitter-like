let modalIsVisible;

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

/**UPLOAD PHOTO */
$('#filePhoto').change(function() {
  if(this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function(event) {
      $("#imagePreview").attr("src", event.target.result)
    };
    reader.readAsDataURL(this.files[0]);
  }
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
$(document).on("click", ".displayName, .username, .retweetedBy", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".closeButton", function() {
  modalIsVisible = false;
});