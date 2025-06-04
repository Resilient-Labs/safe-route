function showToast(message, type = "success") {
  Toastify({
    text: message,
    duration: 4000,
    gravity: "top",
    position: "right",
    style: {
      background: type === "error"
        ? "linear-gradient(to right, #e53935, #e35d5b)"
        : "linear-gradient(to right, #00b09b, #96c93d)"
    }
  }).showToast();
}

// Make globally accessible
window.showToast = showToast;

// When page is done loading, this lets us autoread toastMessage/toastType from our URLs if we need
document.addEventListener("DOMContentLoaded", function() {
  var params = new URLSearchParams(window.location.search);
  var message = params.get("toastMessage");
  var type    = params.get("toastType");

  if (message) {
    showToast(message, type);
  }
});