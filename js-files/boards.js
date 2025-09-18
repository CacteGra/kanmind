boards = {
    addOverlay: function() {
        document.getElementById("modalOverlay").classList.remove("hide");
    },

    createBoard: function() {

    }
}

var checkbox = document.querySelector("input[name=submenu]");
var submenuClose = document.querySelector(".submenu");
checkbox.addEventListener('change', function() {
  if (this.checked) {
    submenuClose.style.display="block";
  } else {
    submenuClose.style.display="none";
  }
});