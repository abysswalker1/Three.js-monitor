import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from "dat.gui";
import map from '../mactexture.jpg'
import {BufferGeometryUtils} from './BufferGeometryUtils';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfff)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const debug = new dat.GUI();
const debugParams = {primaryColor: 0xbebed9, secondaryColor: 0x000000};

const primaryMaterial = new THREE.MeshBasicMaterial( {color: debugParams.primaryColor, side: THREE.DoubleSide} );
const secondaryMaterial = new THREE.MeshBasicMaterial( {color: debugParams.secondaryColor, side: THREE.DoubleSide} );

let pointIndexes = {
    'x': 0,
    'y': 1,
    'z': 2
}

const findMaxPoint = (point, array) => {
    let max;
    for(let i = pointIndexes[point]; i < array.length; i += 3) {
        if(array[i] > array[i - 3]) {
            max = array[i];
        }
    }
    return max;
}

const findMinPoint = (point, array) => {
    let min;
    for(let i = pointIndexes[point]; i < array.length; i += 3) {
        if(array[i] < array[i - 3]) {
            min = array[i];
        }
    }
    return min;
}

const calculateParabolicPosition = (params, array, offset = 0) => {
    const {targetPoint, dependentPoint, frequency = 1} = params;

    for( let i = 0; i <= array.length; i += 3 ) {
        let targetPointIndex = pointIndexes[targetPoint];
        let dependentPointIndex = pointIndexes[dependentPoint];
        array[i + targetPointIndex] = array[i + targetPointIndex] + (array[i + dependentPointIndex]**2 * frequency) + offset;
    }
}

const calculateDirectDependencyPosition = (params, array, offset = 0) => {
    const {targetPoint, dependentPoint, frequency = 1} = params;

    for( let i = 0; i <= array.length; i += 3 ) {
        let targetPointIndex = pointIndexes[targetPoint];
        let dependentPointIndex = pointIndexes[dependentPoint];
        array[i + targetPointIndex] = (array[i + targetPointIndex] + array[i + dependentPointIndex]) * frequency + offset;
    }
}


const width = 7, height = 4, width_segments =40, height_segments = 40;
const parabolaShapeParams = {
    targetPoint: 'z',
    dependentPoint: 'x',
    frequency: 0.07
}

const monitorBackGeometry = new THREE.PlaneBufferGeometry(width + 0.09, height + 0.09, width_segments + 2, height_segments + 2);
const backPosAttribute = monitorBackGeometry.getAttribute('position')
const backVerticies = backPosAttribute.array;
calculateParabolicPosition(
    parabolaShapeParams,
    backVerticies
)

const monitorFrontGeometry = new THREE.PlaneBufferGeometry(width, height, width_segments, height_segments);
const frontPosAttribute = monitorFrontGeometry.getAttribute('position')
let frontVerticies = frontPosAttribute.array;
calculateParabolicPosition(
    parabolaShapeParams,
    frontVerticies,
    0.001
)
const monitorBodyGeometry = new THREE.BoxBufferGeometry(width + 0.2, height + 0.2, 0.1, width_segments + 2, height_segments + 2);
const monitorBodyVerticies = monitorBodyGeometry.getAttribute('position').array; 
calculateParabolicPosition(
    parabolaShapeParams,
    monitorBodyVerticies,
    -0.06
)

const desktopTexture = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(map)});

const monitorBody = new THREE.Mesh(monitorBodyGeometry, primaryMaterial)
const monitorFront = new THREE.Mesh(monitorFrontGeometry, desktopTexture);
const monitorBack = new THREE.Mesh(monitorBackGeometry, secondaryMaterial);
const monitor = new THREE.Object3D();
monitor.add(monitorBack);
monitor.add(monitorFront);
monitor.add(monitorBody);
monitor.position.set(0, 1, 0);
scene.add(monitor)

//gui monitor
debug.add(monitorBack, 'visible')
debug.add(primaryMaterial, 'wireframe')
debug.addColor(debugParams, 'primaryColor')
    .onChange(() => primaryMaterial.color.set(debugParams.primaryColor));
debug.addColor(debugParams, 'secondaryColor')
    .onChange(() => secondaryMaterial.color.set(debugParams.secondaryColor));



// Basis

const b_width = 0.5, b_height = 3.5, b_widthSegments = 20, b_heightSegments = 20; 
const basisVerticalGeometry = new THREE.BoxBufferGeometry(b_width, b_height, 0.5, b_widthSegments, b_heightSegments)
const basisVertical = new THREE.Mesh(basisVerticalGeometry, primaryMaterial);
const basisVerticalVerticies = basisVerticalGeometry.getAttribute('position').array;
const basisVerticalIncleShapeParams = {
    targetPoint: 'z',
    dependentPoint: 'y',
    frequency: 0.4
}
calculateDirectDependencyPosition(
    basisVerticalIncleShapeParams,
    basisVerticalVerticies
)


const shape1 = new THREE.Shape();
shape1.moveTo(0, 0);
shape1.lineTo(0, 0.3);
shape1.lineTo(0.1, 0.5);
shape1.lineTo(0.4, 0.5);
shape1.lineTo(0.5, 0.3);
shape1.lineTo(0.5, 0);
shape1.lineTo(0, 0);

const extrudeSettings = {
  depth: 1.5,
  bevelEnabled: false, 
};

const shape2 = new THREE.Shape();
shape2.moveTo(-0.5, 0);
shape2.lineTo(-0.5, 0.3);
shape2.lineTo(-0.4, 0.5);
shape2.lineTo(0.4, 0.5);
shape2.lineTo(0.5, 0.3);
shape2.lineTo(0.5, 0);
shape2.lineTo(0, 0);


const basisRightFootGeometry = new THREE.ExtrudeBufferGeometry(shape1, extrudeSettings); 
const basisRightFootVerticies = basisRightFootGeometry.getAttribute('position').array;
calculateDirectDependencyPosition({targetPoint: 'x', dependentPoint: 'z'}, basisRightFootVerticies)

const basisLeftFootGeometry = new THREE.ExtrudeBufferGeometry(shape1, extrudeSettings);
const basisLeftFootVerticies = basisLeftFootGeometry.getAttribute('position').array;
calculateDirectDependencyPosition({targetPoint: 'x', dependentPoint: 'z', frequency: -1}, basisLeftFootVerticies)

const basisFootBackGeometry = new THREE.ExtrudeBufferGeometry(shape2, extrudeSettings);
const basisFootBackGeometryVerticies = basisFootBackGeometry.getAttribute('position').array; 
for( let i = 0; i < basisFootBackGeometryVerticies.length; i += 3 ) {
    basisFootBackGeometryVerticies[i+2] = basisFootBackGeometryVerticies[i+2] - 1.2
}

const basisFootGeometry = BufferGeometryUtils.mergeBufferGeometries([basisRightFootGeometry, basisLeftFootGeometry, basisFootBackGeometry]);
const basisFoot = new THREE.Mesh(basisFootGeometry, primaryMaterial);
basisFoot.position.set(0, -2, 0)

const basis = new THREE.Object3D();
basis.add(basisFoot);
basis.add(basisVertical);
scene.add(basis);
basis.position.set(0,0,-0.9)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime;
    lastElapsedTime = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()