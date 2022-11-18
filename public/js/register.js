const passwordField = document.getElementById('password');
const passwordConfirmField = document.getElementById('passwordConf');
const form = document.getElementById('registerForm');
    
function validateForm(e) {
  e.preventDefault();

  if (passwordField.value != passwordConfirmField.value) {
    alert("passwords do not match. Please try again");
  } else {
    form.submit();
  }
}

form.addEventListener('submit', validateForm);