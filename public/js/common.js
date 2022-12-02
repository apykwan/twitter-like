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
      console.log(postData.likes.length)
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
