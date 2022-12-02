$(document).ready(() => {
    $.get(`/api/posts/${postId}`, function(result) {
        outputPostsWithReplies(result, $(".postsContainer"));
    });
});