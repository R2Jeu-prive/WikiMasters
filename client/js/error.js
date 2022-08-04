$(document).ready(function() {
    $("#error-screen .back").on("click", function(){
        $("#error-screen").addClass("hidden-screen");
        $("#main-screen").removeClass("hidden-screen");
    });
});