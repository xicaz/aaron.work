// segment local storage per tab by using these
// instead of regular localstorage calls

function lsGet(name) {
  return localStorage.getItem(newTitle + name);
}

function lsSet(name, value) {
  localStorage.setItem(newTitle + name, value);
}


// ************ constants and globals *****************************************
let initialized = false;

var gui = new dat.GUI({
    name: 'options'
  });

// some handcrafted constants for the "face sensitivity" slider
let minSensitivityDecreasePresenceSpeed = 3;
let maxSensitivityDecreasePresenceSpeed = 5;
let minSensitivityIncreasePresenceSpeed = 1;
let maxSensitivityIncreasePresenceSpeed = 5;
let minSensitivityDebounceDelay = 1;
let maxSensitivityDebounceDelay = .1;

// motion variables
let oflowMotionAmountBuffer = 0;
let oflowMotionAmount = 0;

let playbackSpeedBuffer = 1;

// options that can be changed via the UI
var options = {
  playbackSpeedDecreaseSpeed: 1,
  eyeRecognition: false,
  faceSensitivity: .3,
  motionSensitivity: .3,
  minSpeed: .7,
  maxSpeed: 1.2,
  autostart: false,
};

for (let option in options) {
  if (lsGet(option) !== null) {
    if (option == "autostart" || option == "eyeRecognition") {
      options[option] = lsGet(option) === "true";
    } else {
      options[option] = parseFloat(lsGet(option));
    }
  }
}

// ************ page load setup *****************************************
navigator.mediaDevices.getUserMedia({
  video: true
});

// dat.gui setup
gui.add(options, "eyeRecognition").onChange(() => {
    lsSet("eyeRecognition", options["eyeRecognition"]);
  });
gui.add(options, "faceSensitivity", 0.01, .999).onChange(() => {
    lsSet("faceSensitivity", options["faceSensitivity"]);
  });
gui.add(options, "motionSensitivity", 0.01, .999).onChange(() => {
    lsSet("motionSensitivity", options["motionSensitivity"]);
  });
gui.add(options, "playbackSpeedDecreaseSpeed", 0.01, .999).onChange(() => {
    lsSet("playbackSpeedDecreaseSpeed", options["playbackSpeedDecreaseSpeed"]);
  });
gui.add(options, "minSpeed", 0.01, .999).onChange(() => {
    lsSet("minSpeed", options["minSpeed"]);
  });
gui.add(options, "maxSpeed", 1.001, 2.999).onChange(() => {
    lsSet("maxSpeed", options["maxSpeed"]);
  });
gui.add(options, "autostart").onChange(() => {
    lsSet("autostart", options["autostart"]);
  });
let fullscreen = {
  clickToFullscreen: () => {
    if (initialized) {
        document.getElementById('videos').requestFullscreen();
        document.getElementById('videos').style.cursor = "cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjbQg61aAAAADUlEQVQYV2P4//8/IwAI/QL/+TZZdwAAAABJRU5ErkJggg=='), url(images/blank.cur), none;";
      }
  },
};
document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        fullscreen.clickToFullscreen();
    }
}
gui.add(fullscreen, "clickToFullscreen");

// getUserMedia setup

// getUserMedia success callback
function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput') {
      const option = document.createElement('button');
      option.innerHTML = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      option.onclick = () => {
        lsSet("videoInput", option.innerHTML);

        document.getElementById("cambuttons").setAttribute("hidden", "true");
        button_callback(deviceInfo.deviceId,
          vname1,
          vname2);
      };
      if ((options.autostart === true || options.autostart === "true") && lsGet("videoInput") == option.innerHTML) {
        option.onclick();
        fullscreen.clickToFullscreen();
      }
      document.getElementById("cambuttons").appendChild(option);
      console.log(deviceInfo.label + " " + deviceInfo.deviceId);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
}

// getUserMedia error callback
function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

// in "demo" we use regular getusermedia
if (skipEnumerate) {
  const option = document.createElement('button');
      option.innerHTML = "begin demo";
      option.onclick = () => {
        document.getElementById("cambuttons").setAttribute("hidden", "true");
        button_callback(null,
          vname1,
          vname2);
      };
      document.getElementById("cambuttons").appendChild(option);
}
// otherwise we need to be able to choose which webcam to use
else {
  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
}


// ************ camera chosen setup *****************************************

// helper function to calculate magnitude of coordinates
let mag = (x, y) => {return Math.sqrt((x - y) * (x - y));};
function button_callback(deviceId, v0name, v1name) {
    // run face detection setup
  
  picoSetup(deviceId);

  // run optical flow setup
  let videoContainer = document.getElementById("videos");
  webCamFlow = new oflow.VideoFlow(mycamvas.video, 8);

  webCamFlow.onCalculated( function (direction) {
    // calculate motion amount by averaging all of the motion zone magnitudes
      for(var i = 0; i < direction.zones.length; ++i) {
          var zone = direction.zones[i];
          oflowMotionAmount += mag(zone.u, zone.v);
      }
      oflowMotionAmount = oflowMotionAmount / direction.zones.length;
      
  });

  // only update at 10hz to have consistent performance with different framerates
  let updateOflowMotionAmount = () => {
      let oflowMotionAmountEl = document.getElementById("oflowMotionAmount");
      if (oflowMotionAmountEl) oflowMotionAmountEl.innerHTML = oflowMotionAmountBuffer;
      oflowMotionAmountBuffer = (oflowMotionAmount * .5 + oflowMotionAmountBuffer * .5);
      setTimeout(updateOflowMotionAmount, 100);
  };
  setTimeout(updateOflowMotionAmount, 100);

  // start optical flow calculations and video playback
  webCamFlow.startCapture();

  v0 = document.createElement("VIDEO");
  v0.setAttribute("src", "../videos/" + v0name); // defined in individual index.htmls
  v0.setAttribute("id", "video0");

  v1 = document.createElement("VIDEO");
  v1.setAttribute("src", "../videos/" + v1name); // defined in individual index.htmls
  v1.setAttribute("id", "video1");

  for (let v of[v0, v1]) {
    v.setAttribute("class", "cb_video");
    v.setAttribute("autoplay", "autoplay");
    v.setAttribute("loop", "loop");
    videoContainer.appendChild(v);
  }
  if (newTitle !== null) {
    document.title = newTitle;
  }

  requestAnimationFrame(updateVideo); // updateVideo defined later
}

// ************ update *****************************************

// "presence" as in the presence of a face
let currentPresence = 0;
// debounce counter used to smooth out flickering in face detection
let presenceDebounceCounter = 0;

let previousTime = Date.now();

function updateVideo() {

  let currentTime = Date.now();
  let dt = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  // force sync the videos. if they are paused, play them
  if (v0.paused) {
    v0.play();
  }
  if (v1.paused) {
    v1.play();
  }

  // if they have drifted dramatically apart, restart them
  // a little bit of drift is *guaranteed*, so don't turn the number down here too low
  let videoDelta = Math.abs(v1.currentTime - v0.currentTime);
  if (videoDelta > 5.5 && videoDelta < v0.duration/2) {
    v0.currentTime = 0;
    v1.currentTime = 0;
    console.log("large desync detected, restarting videos")
  }

  // caculate these based off of the "faceSensitivity" slider. see the constants above
  let presenceDebounceDelay = minSensitivityDebounceDelay + 
    (maxSensitivityDebounceDelay - minSensitivityDebounceDelay) * options.faceSensitivity;
  let increasePresenceSpeed = minSensitivityIncreasePresenceSpeed + 
    (maxSensitivityIncreasePresenceSpeed - minSensitivityIncreasePresenceSpeed) * options.faceSensitivity;
  let decreasePresenceSpeed = minSensitivityDecreasePresenceSpeed + 
    (maxSensitivityDecreasePresenceSpeed - minSensitivityDecreasePresenceSpeed) * options.faceSensitivity;

  // confDets is defined by pico--represents the number of faces detected
  if (!(typeof confDets === "undefined") && confDets.length > 0 && options.eyeRecognition) {
    presenceDebounceCounter = presenceDebounceDelay;
  } else if (presenceDebounceCounter > 0) {
    presenceDebounceCounter -= dt;
  }

  // if the debounce is still ticking down, pretend we still see a face
  // we also allow movement to trigger the item
  if (presenceDebounceCounter > 0 || playbackSpeedBuffer > 1) {
    currentPresence += dt * increasePresenceSpeed;
  // once it's 0 we can safely say there is no face
  } else {
    currentPresence -= dt * decreasePresenceSpeed;
  }

  // clamp this value then use it to calculate the overlay opacity
  currentPresence = Math.min(currentPresence, 1);
  currentPresence = Math.max(currentPresence, 0);
  v1.style.opacity = currentPresence;

  // use the motion amount to calculate the playback speed
  let speed = (oflowMotionAmountBuffer > (1.4 - options.motionSensitivity) ? (options.maxSpeed * Math.min(1.3, Math.max(oflowMotionAmountBuffer, 1))) : options.minSpeed);
  if (speed > playbackSpeedBuffer) {
    playbackSpeedBuffer = speed;
  }
  else {
    playbackSpeedBuffer -= dt * options.playbackSpeedDecreaseSpeed;
    playbackSpeedBuffer = Math.max(playbackSpeedBuffer, options.minSpeed);
  }
  v0.playbackRate = v1.playbackRate = playbackSpeedBuffer;
  v0.playbackRate = v1.playbackRate = playbackSpeedBuffer;

  requestAnimationFrame(updateVideo);
}

