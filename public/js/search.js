let timer;

$("#searchBox").keydown(function(event) {
  clearTimeout(timer);
  const textbox = $(event.target);
  const value = textbox.val();
  const searchType = textbox.data().search;

  timer = setTimeout(function() {
    value = textbox.val().trim();

    if (value == "") {
      $(".resultsContainer").html("");
    } else {
      console.log(value);
    }
  }, 1000);

  console.log(value);
  console.log(searchType);
});