
navigator.mediaDevices.getUserMedia({
  video: true
});

var gui = new dat.GUI({
    name: 'options'
  });

let minSensitivityDecreasePresenceSpeed = 3;
let maxSensitivityDecreasePresenceSpeed = 5;
let minSensitivityIncreasePresenceSpeed = 1;
let maxSensitivityIncreasePresenceSpeed = 5;
let minSensitivityDebounceDelay = 1;
let maxSensitivityDebounceDelay = .1;

var options = {
  // decreasePresenceSpeed: 0.8,
  // increasePresenceSpeed: 2.3,
  minPlaybackSpeed: 1,
  maxPlaybackSpeed: 1,
  minOverlayOpacity: 0,
  maxOverlayOpacity: 1,
  sensitivity: .3,
  // presenceDebounceDelay: 0.2
};
// for (let id in options1) {
//   if (localStorage.getItem(id + "1")) {
//     options1[id] = parseFloat(localStorage.getItem(id + "1"));
//   }
// }

// function writeOptions1() {
//   for (let id in options1) {
//     localStorage.setItem(id + "1", options1[id]);
//   }
// }
// var options2 = {
//   // decreasePresenceSpeed: 0.8,
//   // increasePresenceSpeed: 2.3,
//   minPlaybackSpeed: 0.325,
//   maxPlaybackSpeed: 1,
//   minOverlayOpacity: 0,
//   maxOverlayOpacity: 1,
//   sensitivity: .3,
//   // presenceDebounceDelay: 0.2
// };
// for (let id in options2) {
//   if (localStorage.getItem(id + "2")) {
//     options2[id] = parseFloat(localStorage.getItem(id + "2"));
//   }
// }

// function writeOptions2() {
//   for (let id in options2) {
//     localStorage.setItem(id + "2", options2[id]);
//   }
// }
// var folder1 = null;
if (tab1) {
  // folder1 = gui.addFolder('set 1 options');
  // folder1.add(options1, "increasePresenceSpeed", 0, 10).onChange(writeOptions1);
  // folder1.add(options1, "decreasePresenceSpeed", 0, 10).onChange(writeOptions1);

  // gui.add(options1, "minPlaybackSpeed", 0, 3).onChange(writeOptions1);
  // gui.add(options1, "maxPlaybackSpeed", 0, 3).onChange(writeOptions1);
}


// folder1.add(options1, "presenceDebounceDelay", 0, 10).onChange(writeOptions1);
// var folder2 = null;
if (tab2) {
  // folder2 = gui.addFolder('set 2 options');
  // folder2.add(options2, "increasePresenceSpeed", 0, 10).onChange(writeOptions2);
  // folder2.add(options2, "decreasePresenceSpeed", 0, 10).onChange(writeOptions2);

  // gui.add(options2, "minPlaybackSpeed", 0, 3).onChange(writeOptions2);
  // gui.add(options2, "maxPlaybackSpeed", 0, 3).onChange(writeOptions2);
}

// folder2.add(options2, "presenceDebounceDelay", 0, 10).onChange(writeOptions2);

let fullscreen = {
  clickToFullscreen: () => {
    if (initialized) {
        document.getElementById('videos').requestFullscreen();
      }
  },
};
if (tab1) gui.add(options, "sensitivity", 0.01, .999).onChange(() => {
  localStorage.setItem(sensitivity, options["sensitivity"]);
});
gui.add(fullscreen, "clickToFullscreen");

// function setupInput(id) {
//   if (localStorage.getItem(id)) {
//     document.getElementById(id).value = localStorage.getItem(id);
//   }
//   document.getElementById(id).addEventListener('change', (event) => {
//     localStorage.setItem(id, event.target.value);
//   });
// }

// let inputs = [];
// if (tab1) inputs = ['v0name1', 'v1name1'];
// if (tab2) inputs = ['v0name2', 'v1name2'];
// for (let v of inputs) {
//   setupInput(v);
// }

function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput') {
      const option = document.createElement('button');
      option.innerHTML = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      option.onclick = () => {
        document.getElementById("cambuttons").setAttribute("hidden", "true");
        button_callback(deviceInfo.deviceId,
          vname1,
          vname2);
      };
      document.getElementById("cambuttons").appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

let initialized = false;
function button_callback(deviceId, v0name, v1name) {
  picoSetup(deviceId);

  let videoContainer = document.getElementById("videos");

  v0 = document.createElement("VIDEO");
  v0.setAttribute("src", "../videos/" + v0name);
  v0.setAttribute("id", "video0");

  v1 = document.createElement("VIDEO");
  v1.setAttribute("src", "../videos/" + v1name);
  v1.setAttribute("id", "video1");

  for (let v of[v0, v1]) {
    v.setAttribute("class", "cb_video");
    v.setAttribute("autoplay", "autoplay");
    v.setAttribute("loop", "loop");
    videoContainer.appendChild(v);
  }

  requestAnimationFrame(updateVideo);
}

let currentPresence = 0;
let presenceDebounceCounter = 0;

let previousTime = Date.now();
function getSensitivity() {
  return options.sensitivity;
}

function updateVideo() {
  if (v0.paused) {
    v0.play();
  }
  if (v1.paused) {
    v1.play();
  }

  let currentTime = Date.now();
  let dt = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  let videoDelta = Math.abs(v1.currentTime - v0.currentTime);
  if (videoDelta > 1.5 && videoDelta < v0.duration/2) {
    v0.currentTime = 0;
    v1.currentTime = 0;
    console.log("large desync detected, restarting videos")
  }
  if (typeof confDets !== 'undefined') {
    // if (confDets.length > 0) {
    //   v1.style.opacity = 1;

    //   v0.playbackRate = 1;
    //   v1.playbackRate = 1;
    // } else {
    //   v1.style.opacity = 0;
    //   v0.playbackRate = .4;
    //   v1.playbackRate = .4;
    // }

    let presenceDebounceDelay = minSensitivityDebounceDelay + 
      (maxSensitivityDebounceDelay - minSensitivityDebounceDelay) * getSensitivity();
    let increasePresenceSpeed = minSensitivityIncreasePresenceSpeed + 
      (maxSensitivityIncreasePresenceSpeed - minSensitivityIncreasePresenceSpeed) * getSensitivity();
    let decreasePresenceSpeed = minSensitivityDecreasePresenceSpeed + 
      (maxSensitivityDecreasePresenceSpeed - minSensitivityDecreasePresenceSpeed) * getSensitivity();

    if (confDets.length > 0) {
      presenceDebounceCounter = presenceDebounceDelay;
    } else if (presenceDebounceCounter > 0) {
      presenceDebounceCounter -= dt;
    }

    if (presenceDebounceCounter > 0) {
      currentPresence += dt * increasePresenceSpeed;
    } else {
      currentPresence -= dt * decreasePresenceSpeed;
    }
    currentPresence = Math.min(currentPresence, 1);
    currentPresence = Math.max(currentPresence, 0);

    v0.playbackRate = v1.playbackRate = (options.minPlaybackSpeed + (options.maxPlaybackSpeed - options.minPlaybackSpeed) * currentPresence);
    v1.style.opacity = (options.minOverlayOpacity + (options.maxOverlayOpacity - options.minOverlayOpacity) * currentPresence);
  }


  requestAnimationFrame(updateVideo);
}

