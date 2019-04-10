
var palette = [0x121212, 0x402F3F]
var materials = [];
for(var i = 0; i < palette.length; i++) {
  var material = new THREE.MeshPhongMaterial( {
    color: palette[i],
    shading: THREE.SmoothShading,
    side: THREE.DoubleSide
  } );
  materials.push(material);
}

//////////////////////////////////////////////////////////////////////////////////
//      Init
//////////////////////////////////////////////////////////////////////////////////

var updaters= [];
var toRemove = [];
var scene   = new THREE.Scene();

var renderer    = new THREE.WebGLRenderer({
  antialias   : true,
  alpha : true,
});
// renderer.setClearColor(palette[0], 1)
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// dynamic aspect cameras
// var camera  = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000);
var camera = new THREE.OrthographicCamera( window.innerWidth / - 2 /1000, window.innerWidth / 2 /1000, window.innerHeight / 2 /1000, window.innerHeight / - 2 /1000, 1, 1000 );

// fixed aspect cameras
// var camera  = new THREE.PerspectiveCamera(45, 1, 0.01, 4000);
// var camera = new THREE.OrthographicCamera( - 1/2, 1 / 2, 1 / 2, 1 / - 2, 1, 1000 );

// handle window resize
window.addEventListener('resize', function(){
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect   = window.innerWidth / window.innerHeight;
  camera.left = window.innerWidth / - 2 /1000;
  camera.right = window.innerWidth / 2 /1000;
  camera.top = window.innerHeight / 2 /1000;
  camera.bottom = window.innerHeight / - 2 /1000;

  camera.updateProjectionMatrix();
}, false)

camera.position.z = 200;

var timeScales = [];
var keyboard    = new THREEx.KeyboardState();

//////////////////////////////////////////////////////////////////////////////////
//      vr support
//////////////////////////////////////////////////////////////////////////////////

//if ( WEBVR.isAvailable() === false ) {
//  document.body.appendChild( WEBVR.getMessage() );
//}
//var vrRenderer    = new THREE.WebGLRenderer({
//  antialias   : true
//});
//var vrCamera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10 );
//var vrControls = new THREE.VRControls( vrCamera );
//vrRenderer.setClearColor(palette[0], 1)
//vrRenderer.setPixelRatio( window.devicePixelRatio );
//vrRenderer.setSize( 1, 1 );
//vrRenderer.sortObjects = false;
//var vrEffect = new THREE.VREffect( renderer );
//if ( navigator.getVRDisplays ) {
//  navigator.getVRDisplays()
//    .then( function ( displays ) {
//      vrEffect.setVRDisplay( displays[ 0 ] );
//      vrControls.setVRDisplay( displays[ 0 ] );
//    } )
//    .catch( function () {
//      // no displays
//    } );
//  document.body.appendChild( WEBVR.getButton( vrEffect ) );
//}
//document.body.appendChild( vrRenderer.domElement );
//
//vrEffect.requestAnimationFrame(function vrAnimate(nowMsec){
//  // keep looping
//  vrEffect.requestAnimationFrame( vrAnimate );
//  vrEffect.render( scene, vrCamera );
//
//  vrControls.update();
//});

//////////////////////////////////////////////////////////////////////////////////
//      add an object in the scene
//////////////////////////////////////////////////////////////////////////////////

let cubeGeometry = new THREE.BoxBufferGeometry( .07, .07, .07 );
let createCube = function() {
  // var texture = new THREE.TextureLoader().load( 'textures/crate.gif' );
  // var material = new THREE.MeshBasicMaterial( { map: texture } );
  var material = new THREE.MeshBasicMaterial( {
    color: "rgb(" + Math.floor(Math.random() * 255) + ", "
      + Math.floor(Math.random() * 255) + ", "
      + Math.floor(Math.random() * 255) + ")"});
  let mesh = new THREE.Mesh( cubeGeometry, material );
  let angle = Math.random() * Math.PI * 2;
  let xv = Math.cos(angle);
  let yv = Math.sin(angle);
  let speed = .05 + .7 * Math.random();

  mesh.position.z = Math.random() *Math.random() *Math.random() * 100;
  updaters.push(function(i, dt, t){

    // expand outwards
    mesh.position.x += dt * xv * speed;
    mesh.position.y += dt * yv * speed;

    mesh.rotation.x += dt * xv * speed * 8;
    mesh.rotation.y += dt * yv * speed * 8;

    
  });
  return mesh;
}

for(let i = 0; i < 2000; i++) {
  scene.add(createCube());
}

//////////////////////////////////////////////////////////////////////////////////
//      lighting
//////////////////////////////////////////////////////////////////////////////////

var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 0, 1000, 0 );
scene.add( directionalLight ); 

 var light = new THREE.AmbientLight( 0xfffff, 0x080820, 1 );
 var light = new THREE.HemisphereLight( 0xfffff, 0x080820, 1 );
scene.add( light );

//////////////////////////////////////////////////////////////////////////////////
//      render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////
// render the scene
updaters.push(function(){
    renderer.render( scene, camera );       
})

// run the rendering loop
var lastTimeMsec= null
requestAnimationFrame(function animate(nowMsec){
  // keep looping
  requestAnimationFrame( animate );
  // measure time
  lastTimeMsec    = lastTimeMsec || nowMsec-1000/60
  var deltaMsec   = Math.min(200, nowMsec - lastTimeMsec)
  lastTimeMsec    = nowMsec
  // call each update function
  var timeScale = 1;
  for(var i = 0; i < timeScales.length; i++)
  {
    timeScale *= timeScales[i];
  }
  for(var i = 0; i < updaters.length; i++)
  {
    updaters[i](i, deltaMsec/1000, nowMsec/1000)
  }
  for(var i = toRemove.length - 1; i >= 0; i--)
  {
    updaters.splice(toRemove[i],1);
  }
  toRemove = [];
})
