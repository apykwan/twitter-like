$(document).ready(function() {
  $.get("/api/posts", function(results) {
    outputPosts(results, $(".postsContainer"));
  });
});

function outputPosts(results, container) {
  container.html("");

  results.forEach(result => {
    const html = createPostHtml(result);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span>Nothing to show.</span>")
  }
}