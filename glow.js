const playIntroBtn = document.getElementById("playIntroBtn");
const introVideoPlayer = document.getElementById("introVideoPlayer");
const audellesIntroVideo = document.getElementById("audellesIntroVideo");
const closeIntroVideo = document.getElementById("closeIntroVideo");


/* Open intro video */
playIntroBtn.addEventListener("click", function(event) {

  event.preventDefault();

  introVideoPlayer.style.display = "block";

  introVideoPlayer.setAttribute(
    "aria-hidden",
    "false"
  );

  audellesIntroVideo.currentTime = 0;

  audellesIntroVideo.play().catch(function(error) {

    console.log(
      "Video playback requires user interaction:",
      error
    );

  });

});


/* Close intro video */
closeIntroVideo.addEventListener("click", function() {

  audellesIntroVideo.pause();

  audellesIntroVideo.currentTime = 0;

  introVideoPlayer.style.display = "none";

  introVideoPlayer.setAttribute(
    "aria-hidden",
    "true"
  );

});


/* Automatically hide when video finishes */
audellesIntroVideo.addEventListener("ended", function() {

  introVideoPlayer.style.display = "none";

  introVideoPlayer.setAttribute(
    "aria-hidden",
    "true"
  );

});


/* Allow Escape key to close */
document.addEventListener("keydown", function(event) {

  if (
    event.key === "Escape" &&
    introVideoPlayer.style.display === "block"
  ) {

    audellesIntroVideo.pause();

    introVideoPlayer.style.display = "none";

    introVideoPlayer.setAttribute(
      "aria-hidden",
      "true"
    );

  }

});
