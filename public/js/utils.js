/**Return Post Id */
function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post"); 
  const rootElement = isRoot ? element : element.closest(".post");
  const postId = rootElement.data().id;

  if (postId) return postId;
  
  alert("Post Id undefined");
}

/**Return HTML */
function createPostHtml (postData, largeFont = false) {
  if (!postData) return alert("post object is null");

  const isRetweet = postData.retweetData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.userName : null;
  postData = isRetweet ? postData.retweetData : postData;

  const postedBy = postData.postedBy;
  
  if(postedBy._id === undefined) {
    return console.log("User object not populated");
  }

  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
  const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
  const largeFontClass = largeFont ? "largeFont" : "";

  let retweetText = "";
  if (isRetweet) {
    retweetText = `
      <span>
        <i class="fas fa-retweet retweetedBy"></i>
        Retweeted by <a href="/profile/${retweetedBy}">@${retweetedBy}</a>
      </span>`
  }

  let replyFlag = "";

  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
        return alert("Reply is not populated");
    } else if (!postData.replyTo.postedBy._id) {
      return alert("Postedby is not populated");
    }

    const replyToUsername = postData.replyTo.postedBy.userName;
    replyFlag = `
      <div class="replyFlag">
        Replyng to <a href="/profile/${replyToUsername}">${replyToUsername}</a>
      </div>
    `;
  } 

  let buttons = "";
  let pinnedPostText;
  if (postData.postedBy._id == userLoggedIn._id) {
    const pinnedClass = postData.pinned ? "active" : "";
    const dataTarget = postData.pinned ? "#unpinModal" : "#confirmPinModal";
    pinnedPostText = postData.pinned ? '<i class="fas fa-thumbtack"> <span>Pinned post</span></i>' : '';

    buttons = `
      <button class="pinButton ${pinnedClass}" data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}">
        <i class="fas fa-thumbtack"></i>
      </button>
      <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal">
        <i class="fas fa-times"></i>
      </button>
    `;
  }

  return `
    <div class="post ${largeFontClass}" data-id=${postData._id}>
      <div class="postActionContainer">
        ${retweetText}
      </div>
      <div class="mainContentContainer">
        <div class="userImageContainer">
          <img src="${postedBy.profilePic}" alt="${postedBy.userName}'s profile picture"/>
        </div>
        <div class="postContentContainer">
          <div class="pinnedPostText">${pinnedPostText}</div>
          <div class="header">
            <a class="displayName" href="/profile/${postedBy.userName}">${displayName}</a>
            <span class="username">@${postedBy.userName}</span>
            <span class="date">${timestamp}</span>
            ${buttons}
          </div>
          ${replyFlag}
          <div class="postBody">
            <span>${postData.content}</span>
          </div>
          <div class="postFooter">
            <div class="postButtonContainer">
              <button data-toggle="modal" data-target="#replyModal">
                <i class="far fa-comment"></i>
              </button>
            </div>
             <div class="postButtonContainer green">
              <button class="retweetButton ${retweetButtonActiveClass}">
                <i class="fas fa-retweet"></i>
                <span>${postData.retweetUsers.length || ""}</span>
              </button>
            </div>
             <div class="postButtonContainer red">
              <button class="likeButton ${likeButtonActiveClass}">
                <i class="far fa-heart"></i>
                <span>${postData.likes.length || ""}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**Return Difference Between current time and posted time */
function timeDifference(current, previous) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed/1000 < 30) return "Just Now"
    return Math.round(elapsed/1000) + ' seconds ago';   
  }

  else if (elapsed < msPerHour) {
    return Math.round(elapsed/msPerMinute) + ' minutes ago';   
  }

  else if (elapsed < msPerDay ) {
    return Math.round(elapsed/msPerHour ) + ' hours ago';   
  }

  else if (elapsed < msPerMonth) {
    return Math.round(elapsed/msPerDay) + ' days ago';   
  }

  else if (elapsed < msPerYear) {
    return Math.round(elapsed/msPerMonth) + ' months ago';   
  }

  else {
    return Math.round(elapsed/msPerYear ) + ' years ago';   
  }
}

/**Append new post to the container */
function outputPosts(results, container) {
  container.html("");

  if (!Array.isArray(results)) {
    results = [results];
  }

  results.forEach(result => {
    const html = createPostHtml(result);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span>Nothing to show.</span>")
  }
}

function outputPostsWithReplies(results, container) {
  container.html("");

  if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
    const html = createPostHtml(results.replyTo);
    container.append(html);
  }

  const mainPostHtml = createPostHtml(results.postData, true);
  container.append(mainPostHtml);

  results.replies.forEach(result => {
    const html = createPostHtml(result);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span>Nothing to show.</span>")
  }
}

/**Append pinned posts to the container */
function outputPinnedPost(results, container) {
  if(results.length === 0) {
    container.hide();
    return;
  }
  container.html("");

  results.forEach(result => {
    const html = createPostHtml(result);
    container.append(html);
  });
}

/**For users display */
function outputUsers(results, container) {
  container.html("");

  results.forEach(result => {
    const html = createUserHtml(result, true);
    container.append(html);
  });

  if (results.length === 0) {
    container.append(`<span class="noResults">No result found!</span>`);
  }
}

function createUserHtml(userData, showFollowButton) {
  const name = `${userData.firstName} ${userData.lastName}`;
  const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  const text = isFollowing ? "Following": "Follow"
  const buttonClass = isFollowing ? "followButton following": "followButton"

  let followButton = "";

  if (showFollowButton && userLoggedIn._id != userData._id) {
    followButton = `
      <div class="followButtonContainer">
        <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
      </div>
    `;
  }

  return `
    <div class="user">
      <div class="userImageContainer">
        <img src="${userData.profilePic}" alt="user picture">
      </div>
      <div class="userDetailsContainer">
        <div class="header">
          <a href="/profile/${userData.userName}">${name}</a>
          <span class="username">@${userData.userName}</span>
        </div>
      </div>
      ${followButton}
    </div>
  `;
}

function searchUsers(searchTerm) {
  $.get("/api/users", { search: searchTerm }, function(results) {
    outputSelectableUsers(results, $(".resultsContainer"));
  });
}

function outputSelectableUsers(results, container) {
  container.html("");

  results.forEach(function(result) {
    // Ensure self and selected users will not be shown 
    if(result._id == userLoggedIn._id || selectedUsers.some(user => user._id === result._id)) return;

    const html = createUserHtml(result, false);
    const element = $(html);
    element.click(function() {
      userSelected(result);
    });

    container.append(element);
  });

  if (results.length === 0) {
    container.append(`<span class="noResults">No result found!</span>`);
  }
}

function userSelected(user) {
  selectedUsers.push(user);
  updateSelectedUsersHtml();
  $("#userSearchTextbox").val("").focus();
  $(".resultsContainer").html("");
  $("#createChatButton").prop("disabled", false);
}

function updateSelectedUsersHtml() {
  const elements = [];
  selectedUsers.forEach(function(user) {
    const { firstName, lastName } = user;
    const userElement = $(`<span class="selectedUser">${firstName} ${lastName}</span>`);
    elements.push(userElement);
  });

  $(".selectedUser").remove();
  $("#selectedUsers").prepend(elements);
}