// Saves options to chrome.storage
function save_options() {
  var authUser = document.getElementById('auth_user').value;
  chrome.storage.sync.set({
    authUser: authUser
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

chrome.storage.sync.get("authUser", function(items) {
    if(items.authUser){
      document.getElementById('auth_user').value = items.authUser;
    }
});

document.getElementById('save').addEventListener('click',
    save_options);