$(document).ready(function() {
  if (selectedTab === 'replies') {
    loadReplies();
    return;
  }
  loadPosts();
});

function loadPosts() {
  $.get("/api/posts", { postedBy: profileUserId, isReply: false }, function(results) {
    outputPosts(results, $(".postsContainer"));
  });
}

function loadReplies() {
  $.get("/api/posts", { postedBy: profileUserId, isReply: true }, function(results) {
    outputPosts(results, $(".postsContainer"));
  });
}