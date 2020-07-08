
//////////////////////////////////////////////////////////////////////////////////
//      reference
//////////////////////////////////////////////////////////////////////////////////

// loading a texture
var path = "";
var textureLoader = new THREE.TextureLoader();
textureLoader.load(path,
  function ( t ) {
    material = new THREE.MeshBasicMaterial({
        map: t,
        transparent: true
      });
    ...
  },
  function(){},
  function(e) {
    console.log("textureloader error [" + path + "]:" + e);
  });

// adding an ellipse
var curve = new THREE.EllipseCurve(
    0, 0,             // ax, aY
    7, 15,            // xRadius, yRadius
    0, 3/2 * Math.PI, // aStartAngle, aEndAngle
    false             // aClockwise
);
var points = curve.getSpacedPoints( 20 );
var path = new THREE.Path();
var geometry = path.createGeometry( points );
var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
var line = new THREE.Line( geometry, material );
scene.add( line );

// keyboard input
var velocity = 0;
onRenderFcts.push(function(i,dt,t) {
    if(keyboard.pressed("a")) {
      velocity = -100;
    }
    mesh.position.y = mesh.position.y + velocity*dt;
  });
