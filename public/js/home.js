$(document).ready(function() {
  $.get("/api/posts", function(results) {
    console.log(results);
  });
});