$(document).ready(function() {
  if (selectedTab === 'followers') return loadFollowers();

  loadFollowing();
});

function loadFollowers() {
  $.get(`/api/users/${profileUserId}/followers`,  function(results) {
    outputUsers(results.followers, $(".resultsContainer"));
  });
}

function loadFollowing() {
  $.get(`/api/users/${profileUserId}/following`, function(results) {
    outputUsers(results.following, $(".resultsContainer"));
  });
}