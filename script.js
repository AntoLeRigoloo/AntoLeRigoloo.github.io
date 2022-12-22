import { GLTFLoader } from './3Dmodel/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from './3Dtext/CSS3DRenderer.js';
import { EffectComposer } from './Neon/EffectComposer.js';
import { RenderPass } from './Neon/RenderPass.js';
import { UnrealBloomPass } from './Neon/UnrealBloomPass.js';
import { OrbitControls } from './OrbitControls.js';

var scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,1000);
let hauteur = 15;
camera.position.set(0,hauteur,-15);
camera.lookAt(0,hauteur,10);


var renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000D15, 1);
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 10;
controls.maxDistance = 50;
controls.target.set(0, 10, 0);



function getRandomInt2(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const starCount = 10000;
const nothingAround = 50;
let starBuffer = new THREE.BufferGeometry();
let posstar = new Float32Array(starCount * 3);
for (let i =0; i <(starCount*3); i+=3){
    let x = getRandomInt2(-100,100);
    let y = getRandomInt2(-100,100);
    let z = getRandomInt2(-100,100);
    while ((x < nothingAround)&&(x > -nothingAround)&&(y < nothingAround)&&(y > -nothingAround)&&(z < nothingAround)&&(z > -nothingAround)){
        x = getRandomInt2(-100,100);
        y = getRandomInt2(-100,100);
        z = getRandomInt2(-100,100);
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
var loader = new GLTFLoader();
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
let turns = 2;
let segmentsPerTurn = 100;
let height = 15;
let growth = 1;
let spring = new Spring(radius, turns, segmentsPerTurn, height, growth, material);
spring.update();
scene.add(spring);
spring.position.set(0,2,0);

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
sphere.position.set(-14,10,6);
sphere1.position.set(13,7,5);
sphere2.position.set(7,12,15);
sphere3.position.set(-8,15,-13);
sphere4.position.set(14,7,-10);



function animate() {
    requestAnimationFrame( animate );  
    mixer.update(0.005);
    controls.update();
    renderer.render( scene, camera );
    composer.render();
}

animate();


