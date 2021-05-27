import {
    AnimationClip,
    Bone,
    BufferGeometry,
    ClampToEdgeWrapping,
    DataTexture,
    DoubleSide,
    FileLoader,
    Float32BufferAttribute,
    Group,
    KeyframeTrack,
    LinearFilter,
    Loader,
    LoadingManager,
    MeshBasicMaterial,
    QuaternionKeyframeTrack,
    RGBAFormat,
    Skeleton,
    SkinnedMesh,
    Texture,
    Uint8BufferAttribute,
    UnsignedByteType,
    UVMapping,
    VectorKeyframeTrack
} from 'three';
import { MDLFile } from './MDLFile';

export type MDLModel = {
    file: MDLFile;
    group: Group;
    bones: Bone[];
    animations: AnimationClip[];
    textures: Texture[];
}

// TODO:
// 1. support sequence file loading
// 2. support extra texture file loading
// 3. implement bone controller
export class MDLLoader extends Loader {
    constructor(manager?: LoadingManager) {
        super(manager);
    }

    // @ts-ignore
    load(url, onLoad, onProgress, onError): void {
        let loader = new FileLoader(this.manager);
        loader.setPath(this.path);
        loader.setResponseType('arraybuffer');
        loader.setRequestHeader(this.requestHeader);
        loader.setWithCredentials(this.withCredentials);
        loader.load(url, (buffer) => {
            try {
                // @ts-ignore
                onLoad(this.parse(buffer));
            } catch (e) {
                if (onError) {
                    onError(e);
                } else {
                    console.error(e);
                }
                this.manager.itemError(url);
            }
        }, onProgress, onError);
    }

    parse(buffer: ArrayBuffer): MDLModel {
        // parse file
        let file = new MDLFile();
        file.load(buffer);

        // the root group contain mesh and joint
        let group = new Group();
        group.name = '[ROOT]';

        // create bone array
        let srcbones = file.getBones();
        let bones: Bone[] = [];
        for (let i = 0; i < srcbones.length; i++) {
            let a = srcbones[i];
            let b = new Bone();
            b.position.set(a.value[0], a.value[1], a.value[2]);
            b.rotation.set(a.value[3], a.value[4], a.value[5], 'ZYX');
            b.name = a.name;
            bones.push(b);
        }
        // link parent
        for (let i = 0; i < srcbones.length; i++) {
            for (let j = 0; j < srcbones.length; j++) {
                if (srcbones[j].parent == i) {
                    bones[i].add(bones[j]);
                }
            }
        }

        // add bone to root for animation
        let boneGroup = new Group();
        boneGroup.name = '[BONE]';
        for (let i = 0; i < srcbones.length; i++) {
            if (srcbones[i].parent === -1) {
                boneGroup.add(bones[i]);
            }
        }
        group.add(boneGroup);

        // build skeleton
        let skeleton = new Skeleton(bones);

        // build texture
        let textures: Texture[] = [];
        file.getTextures().forEach(a => {
            let b = new DataTexture(a.data, a.width, a.height, RGBAFormat, UnsignedByteType,
                UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, LinearFilter);
            b.name = a.name;
            textures.push(b);
        });

        // build model
        let bodyGroup = new Group();
        bodyGroup.name = '[BODY]';
        let skinFamilies = file.getSkinFamilies();
        file.getBodyParts().forEach(a => {
            let partGroup = new Group();
            partGroup.name = "[PART]";
            a.models.forEach(b => {
                // create vertex data buffers
                let position: number[] = [];
                let normal: number[] = [];
                let uv: number[] = [];
                let skinIndex: number[] = [];
                let skinWeight: number[] = [];
                for (let c of b.vertices) {
                    // position
                    position.push(c.position.x);
                    position.push(c.position.y);
                    position.push(c.position.z);
                    // normal
                    normal.push(c.normal.x);
                    normal.push(c.normal.y);
                    normal.push(c.normal.z);
                    // UV
                    uv.push(c.texCoord.x);
                    uv.push(c.texCoord.y);
                    // joints
                    skinIndex.push(c.bone);
                    skinIndex.push(0);
                    skinIndex.push(0);
                    skinIndex.push(0);
                    // weights
                    skinWeight.push(1);
                    skinWeight.push(0);
                    skinWeight.push(0);
                    skinWeight.push(0);
                }
                // create attributes
                let aPosition = new Float32BufferAttribute(position, 3);
                let aNormal = new Float32BufferAttribute(normal, 3);
                let aUV = new Float32BufferAttribute(uv, 2);
                let aSkinIndex = new Uint8BufferAttribute(skinIndex, 4);
                let aSkinWeight = new Float32BufferAttribute(skinWeight, 4);
                // create mesh
                let meshGroup = new Group();
                meshGroup.name = b.name;
                b.mesh.forEach(c => {
                    // bind attributes
                    let geo = new BufferGeometry();
                    geo.setAttribute('position', aPosition);
                    geo.setAttribute('normal', aNormal);
                    geo.setAttribute('uv', aUV);
                    geo.setAttribute('skinIndex', aSkinIndex);
                    geo.setAttribute('skinWeight', aSkinWeight);
                    geo.setIndex(c.indices);
                    // create default material
                    let mat = new MeshBasicMaterial({
                        map: textures[skinFamilies[0][c.skinref]],
                        skinning: true,
                        // color: 0x156289,
                        // emissive: 0x072534,
                        side: DoubleSide,
                        // flatShading: true
                    });
                    // create object
                    let mesh = new SkinnedMesh(geo, mat);
                    // bind to skeleton
                    mesh.bind(skeleton);
                    // put to group
                    meshGroup.add(mesh);
                });
                partGroup.add(meshGroup);
            });
            bodyGroup.add(partGroup);
        });

        // add mesh to root
        group.add(bodyGroup);

        // build animation clip
        let animations: AnimationClip[] = [];
        file.getSequences().forEach(a => {
            let duration = a.frames.length / a.fps;
            let tracks: KeyframeTrack[] = [];
            for (let i = 0; i < srcbones.length; i++) {
                let timeval: number[] = [];
                let posvals: number[] = [];
                let rotvals: number[] = [];
                for (let j = 0; j < a.frames.length; j++) {
                    timeval.push(j / a.frames.length * duration);
                    posvals.push(a.frames[j].pos[i].x);
                    posvals.push(a.frames[j].pos[i].y);
                    posvals.push(a.frames[j].pos[i].z);
                    rotvals.push(a.frames[j].rot[i].x);
                    rotvals.push(a.frames[j].rot[i].y);
                    rotvals.push(a.frames[j].rot[i].z);
                    rotvals.push(a.frames[j].rot[i].w);
                }
                let posTrack = new VectorKeyframeTrack(`${srcbones[i].name}.position`, timeval, posvals);
                let rotTrack = new QuaternionKeyframeTrack(`${srcbones[i].name}.quaternion`, timeval, rotvals);
                posTrack.validate();
                rotTrack.validate();
                tracks.push(posTrack);
                tracks.push(rotTrack);
            }
            let clip = new AnimationClip(a.label, duration, tracks);
            animations.push(clip);
        });

        // put Z going up
        boneGroup.rotateX(-1.570796);

        return {
            file,
            group,
            bones,
            animations,
            textures
        };
    }
}