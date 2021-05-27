import * as THREE from 'three';
import { OrbitControls } from './lib/OrbitControls.js';
import { GUI } from './lib/dat.gui.module.js';
import { MDLLoader, MDLModel } from './MDLLoader';

let container: HTMLElement;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let clock: THREE.Clock;
let camera: THREE.PerspectiveCamera;
let gridHelper: THREE.GridHelper;
let axesHelper: THREE.AxesHelper;
let skeletonHelper: THREE.SkeletonHelper;
let mixer: THREE.AnimationMixer;
let settings: any = {};

window.addEventListener('load', init);

function init() {
    container = document.getElementById('container') as HTMLElement;

    // create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // create scene
    scene = new THREE.Scene();
    // for animation
    clock = new THREE.Clock();

    // create camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(15, 10, -15);

    // create camera controller
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.minDistance = 5;
    controls.maxDistance = 150;
    controls.update();

    // show gird
    gridHelper = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
    gridHelper.visible = false;
    scene.add(gridHelper);

    // show axes
    axesHelper = new THREE.AxesHelper();
    axesHelper.visible = false;
    scene.add(axesHelper);

    // create ambient light
    scene.add(new THREE.AmbientLight(0x443333));

    // create direction light 1
    const dirLight1 = new THREE.DirectionalLight(0xffddcc, 1);
    dirLight1.position.set(1, 0.75, 0.5);
    scene.add(dirLight1);

    // create direction light 2
    const dirLight2 = new THREE.DirectionalLight(0xccccff, 1);
    dirLight2.position.set(-1, 0.75, -0.5);
    scene.add(dirLight2);

    window.addEventListener('resize', onWindowResize);

    // create model loader
    const loader = new MDLLoader();
    // load model from url
    // @ts-ignore
    loader.load('asset/v_awp.mdl', (model: MDLModel) => {
        // console.log(model);
        const obj = model.group;

        // add model to scene
        scene.add(obj);

        // find all body parts
        let partLabels: string[] = [];
        let bodyGroup = obj.getObjectByName('[BODY]');
        // @ts-ignore
        for (let a of bodyGroup.children) {
            for (let b of a.children) {
                partLabels.push(b.name);
            }
        }

        // show skeleton
        skeletonHelper = new THREE.SkeletonHelper(obj);
        skeletonHelper.visible = false;
        scene.add(skeletonHelper);

        // create animation mixer
        mixer = new THREE.AnimationMixer(obj);

        // create action for animations
        let actions: THREE.AnimationAction[] = [];
        let actionLabels: string[] = [];
        for (let e of model.animations) {
            actions.push(mixer.clipAction(e));
            actionLabels.push(e.name);
        }

        // create control panel
        createPanel(partLabels, actions, actionLabels);

        // play first animation
        actions[0].play();
    });

    // start update loop
    animate();
}

function createPanel(partLabels: string[], actions: THREE.AnimationAction[], actionLabels: string[]) {
    const panel = new GUI({ width: 400 });

    // create settings object
    settings = {
        ShowAxes: false,
        ShowGrid: false,
        Animation: actionLabels[0],
        /* body parts */
    };
    // append body parts
    for (let a of partLabels) {
        Object.defineProperty(settings, a, { value: true, writable: true });
    }

    // @ts-ignore
    const folder1 = panel.addFolder('Settings');
    // @ts-ignore
    const folder2 = panel.addFolder('Model');
    // @ts-ignore
    const folder3 = panel.addFolder('Body');

    // viewer settings
    folder1.add(settings, 'ShowAxes').onChange((v) => {
        axesHelper.visible = v;
    });
    folder1.add(settings, 'ShowGrid').onChange((v) => {
        gridHelper.visible = v;
    });

    // animation selection
    folder2.add(settings, 'Animation').options(actionLabels).onChange((v) => {
        for (let e of actions) {
            e.stop();
        }
        let i = actionLabels.findIndex(e => e === v);
        actions[i].play();
    });

    // show body parts
    for (let a of partLabels) {
        folder3.add(settings, a).onChange((v) => {
            let o = scene.getObjectByName(a);
            if (o) {
                o.visible = v;
            }
        });
    }

    folder1.open();
    folder2.open();
    folder3.open();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    requestAnimationFrame(animate);
    if (mixer) {
        mixer.update(clock.getDelta());
    }
    renderer.render(scene, camera);
}