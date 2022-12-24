import { GLTFLoader } from './3Dmodel/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from './3Dtext/CSS3DRenderer.js';
import { EffectComposer } from './Neon/EffectComposer.js';
import { RenderPass } from './Neon/RenderPass.js';
import { UnrealBloomPass } from './Neon/UnrealBloomPass.js';
import { OrbitControls } from './OrbitControls.js';

var scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,1000);
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    //antialias: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000D15, 1);
document.body.appendChild( renderer.domElement );

function test(){
    console.log("test");
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //let text = document.getElementById("label2");
    //text.style.width = 0.7*window.innerWidth + "px";
    renderer.setSize( window.innerWidth, window.innerHeight );
    //labelRenderer.setSize( innerWidth, innerHeight );
}
window.addEventListener('resize', onWindowResize, false);

let ProgressBar = document.getElementById('ProgressBar');
let DisplayBar = document.getElementById('DisplayBar');
let status = document.getElementById('statusBar');
let ContainerBar = document.getElementById('ContainerProgressBar');
let AnimationTrigger = document.getElementById('confirmButton');
let AnimationTriggerText = document.getElementById('confirmButtonText');
let validation = true;
let transition = false;
let modelLoaded = false;

const manager = new THREE.LoadingManager();

manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    status.textContent = itemsLoaded + ' of ' + itemsTotal + ' files.';
};
manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    ProgressBar.style.width = (itemsLoaded / itemsTotal * 100) + '%';
    status.textContent = itemsLoaded + ' of ' + itemsTotal + ' files.';
};
manager.onError = function ( url ) {
    console.log( 'There was an error loading ' + url );
};
manager.onLoad = function ( ) {
    //DisplayBar.style.display = "none";
    //animate();
    if (validation){
        AnimationTrigger.addEventListener('click', hello);
        status.style.opacity = "0";
        ContainerBar.style.opacity = '0';
        ContainerBar.style.width = '1%';
        AnimationTrigger.style.width = "150px";
        AnimationTrigger.style.height = "150px";
        AnimationTrigger.style.opacity = '1';
        AnimationTriggerText.style.opacity = '1';
        AnimationTriggerText.style.letterSpacing = "normal";
        camera.position.x = 0 ;
        camera.position.y = 35;
        camera.position.z = -20;
        camera.lookAt(0,35,0);
        AnimationTrigger.addEventListener('mouseover', function(){
            console.log("hover");
            AnimationTrigger.style.width = "170px";
            AnimationTrigger.style.height = "170px";
        });
        AnimationTrigger.addEventListener('mouseout', function(){
            console.log("hover");
            AnimationTrigger.style.width = "150px";
            AnimationTrigger.style.height = "150px";
        });


        validation = false;
        modelLoaded = true;
    }
    
};




function getRandomInt2(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const starCount = 5000;
const nothingAround = 20;
let starBuffer = new THREE.BufferGeometry();
let posstar = new Float32Array(starCount * 3);
for (let i =0; i <(starCount*3); i+=3){
    let x = getRandomInt2(-50,50);
    let y = getRandomInt2(-50,50);
    let z = getRandomInt2(-50,50);
    while ((x < nothingAround)&&(x > -nothingAround)&&(y < nothingAround)&&(y > -nothingAround)&&(z < nothingAround)&&(z > -nothingAround)){
        x = getRandomInt2(-50,50);
        y = getRandomInt2(-50,50);
        z = getRandomInt2(-50,50);
    }
    posstar[i] = x;
    posstar[i+1] = y;
    posstar[i+2] = z;  
}
starBuffer.setAttribute('position', new THREE.BufferAttribute(posstar, 3));
let StarsTextureLoader = new THREE.TextureLoader().load('BGtextures/star.png');
let starMaterial = new THREE.PointsMaterial({
    color: 0xcccccc,
    size: 0.2,
    map : StarsTextureLoader,
    //alphaTest: 0.5,
});
let star = new THREE.Points(starBuffer, starMaterial);
scene.add(star);



class Spring extends THREE.Mesh{
    constructor(radius, turns, segmentsPerTurn, height, growth, material){
      let g = new THREE.CylinderGeometry(0.2, 0.2, 1, 16, segmentsPerTurn * turns).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);
      let initPos = g.attributes.position.clone();
      super(g, material);
      this.radius = radius;
      this.turns = turns;
      this.segmentsPerTurn = segmentsPerTurn;
      this.height = height;
      this.growth = growth;
      this.update = () => {
        let _n = new THREE.Vector3(0, 1, 0), _v3 = new THREE.Vector3(), _s = new THREE.Vector3();
        let pos = g.attributes.position;
        for(let i = 0; i < initPos.count; i++){
          let ratio = initPos.getZ(i) * this.growth;
          let angle = this.turns * Math.PI * 2 * ratio;
          _v3.fromBufferAttribute(initPos, i).setZ(0);
          _v3.applyAxisAngle(_n, angle + Math.PI * 0.5);
          _v3.add(_s.setFromCylindricalCoords(this.radius, angle, this.height * ratio));
          pos.setXYZ(i, ... _v3);
        }
        g.computeVertexNormals();
        pos.needsUpdate = true;
      }
    }
  }
  

var obj,mixer;
var loader = new GLTFLoader(manager);
loader.load("3Dmodel/astroanim.gltf", function(gltf){
    obj = gltf.scene;
    obj.children[0].children[3].visible = false;
    obj.rotation.y = Math.PI;
    obj.scale.set(10,10,10);
    obj.position.set(0,0,0);
    scene.add(obj);
    mixer = new THREE.AnimationMixer(obj);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, 'ArmatureAction');
    const action = mixer.clipAction(clip.optimize());
    action.play();
});





const pointLight = new THREE.PointLight( 0x62BFFF, 0.52);
scene.add( pointLight );
pointLight.position.set( 0, 0, -10 );

const pointLight2 = new THREE.PointLight( 0xFF48C5, 0.5);
scene.add( pointLight2 );
pointLight2.position.set( 10, 10, 10 );


const renderScene = new RenderPass( scene, camera );
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = 0.5;
bloomPass.strength = 2;
bloomPass.radius = 1;
bloomPass.brightness = 0.1;
let composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );


                
const material = new THREE.MeshBasicMaterial( {color: 0x62BFFF,} );

let radius = 5;
let turns = 1;
let segmentsPerTurn = 100;
let height = 20;
let growth = 1;
let spring = new Spring(radius, turns, segmentsPerTurn, height, growth, material);
spring.update();
scene.add(spring);
spring.position.set(0,0,0);
spring.rotation.y = Math.PI/2;

const geometry = new THREE.SphereGeometry( 1, 32, 16 );
const material1 = new THREE.MeshBasicMaterial( { color: 0xFF48C5 } );
const sphere = new THREE.Mesh( geometry, material1 );
const sphere1= new THREE.Mesh( geometry, material1 );
const sphere2 = new THREE.Mesh( geometry, material1 );
const sphere3 = new THREE.Mesh( geometry, material1 );
const sphere4 = new THREE.Mesh( geometry, material1 );


scene.add( sphere );
scene.add( sphere1 );
scene.add( sphere2 );
scene.add( sphere3 );
scene.add( sphere4 );
sphere.position.set(-14,6,10);
sphere1.position.set(13,12,5);
sphere2.position.set(15,8,15);
sphere3.position.set(-15,15,-15);
sphere4.position.set(14,7,-15);


var touchstartX = 0;
var touchstartY = 0;
var touchendX = 0;
var touchendY = 0;

let y = 0;

document.addEventListener('touchstart', function(event) {
    touchstartY = event.changedTouches[0].screenY;

}, false);

document.addEventListener('touchmove', function(event) {
    if (touchstartY > event.changedTouches[0].screenY) {
        y = -0.2;
    }
    if (touchstartY < event.changedTouches[0].screenY) {
        y = 0.2;
    }
    touchstartY = event.changedTouches[0].screenY;
}, false);





window.addEventListener('wheel', onMouseWheel)

let position = 15;
function onMouseWheel(event) {
    console.log(event.deltaY);
    y = -event.deltaY * 0.009;
}
let distance = 20;

function updatePosition() {
    position += y;
    y *= 0.7;
    if (position < 0) {
        position = 0;
    }
    else if (position > 15) {
        position = 15;
    }
    else{
        camera.position.y = position;
        let angle = 3*Math.PI*(camera.position.y/15); 
        camera.position.x = distance * Math.sin(-angle);
        camera.position.z = distance * Math.cos(-angle);
        camera.lookAt(0,camera.position.y,0);
    }
}
let go = false;
function hello(){
    DisplayBar.style.backgroundColor = "rgba(0, 0, 0, 0.0)";
    AnimationTrigger.style.opacity = "0";
    AnimationTrigger.style.width = "0px";
    AnimationTrigger.style.height = "0px";
    camera.position.y = 15;
    StartFadeOut = new Date().getTime();
    transition = true;
}
let StartFadeOut;
let FadeOut = false;
function animate() {
    requestAnimationFrame( animate );  
    if (modelLoaded){
        mixer.update(0.005);
    }
    renderer.render( scene, camera );
    composer.render();
    if (transition){
        if (!FadeOut){
            if (new Date().getTime() - StartFadeOut > 3000){
                DisplayBar.style.display = "none";
                FadeOut = true;
            }
        }
        updatePosition();
    }
    
    
}
animate();




