import { Vec2, Vec3, Vec4 } from './Vector';

export class StudioHeader {
    id: number;
    version: number;
    name: string;
    length: number;
    eyeposition: Vec3;
    min: Vec3;
    max: Vec3;
    bbmin: Vec3;
    bbmax: Vec3;
    flags: number;
    numbones: number;
    boneindex: number;
    numbonecontrollers: number;
    bonecontrollerindex: number;
    numhitboxes: number;
    hitboxindex: number;
    numseq: number;
    seqindex: number;
    numseqgroups: number;
    seqgroupindex: number;
    numtextures: number;
    textureindex: number;
    texturedataindex: number;
    numskinref: number;
    numskinfamilies: number;
    skinindex: number;
    numbodyparts: number;
    bodypartindex: number;
    numattachments: number;
    attachmentindex: number;
    soundtable: number;
    soundindex: number;
    soundgroups: number;
    soundgroupindex: number;
    numtransitions: number;
    transitionindex: number;
}

export class StudioSequenceHeader {
    id: number;
    version: number;
    name: string;
    length: number;
}

export class StudioBone {
    name: string;
    parent: number;
    flags: number;
    bonecontroller: number[];
    value: number[];
    scale: number[];
}

export class StudioBoneController {
    bone: number;
    type: number;
    start: number;
    end: number;
    rest: number;
    index: number;
}

export class StudioHitBox {
    bone: number;
    group: number;
    bbmin: Vec3;
    bbmax: Vec3;
}

export class StudioSequenceGroup {
    label: string;
    name: string;
    cache: number;
    data: number;
}

export class StudioAnimationFrame {
    pos: Vec3[];
    rot: Vec4[];
}

export class StudioSequence {
    label: string;
    fps: number;
    flags: number;
    activity: number;
    actweight: number;
    numevents: number;
    eventindex: number;
    numframes: number;
    numpivots: number;
    pivotindex: number;
    motiontype: number;
    motionbone: number;
    linearmovement: Vec3;
    automoveposindex: number;
    automoveangleindex: number;
    bbmin: Vec3;
    bbmax: Vec3;
    numblends: number;
    animindex: number;
    blendtype: number[];
    blendstart: number[];
    blendend: number[];
    blendparent: number;
    seqgroup: number;
    entrynode: number;
    exitnode: number;
    nodeflags: number;
    nextseq: number;
    // holder
    events: StudioEvent[];
    pivots: StudioPivot[];
    // holder, decomposed animation frame data
    frames: StudioAnimationFrame[];
}

export class StudioEvent {
    frame: number;
    event: number;
    type: number;
    options: string;
}

export class StudioPivot {
    org: Vec3;
    start: number;
    end: number;
}

export class StudioAttachment {
    name: string;
    type: number;
    bone: number;
    org: Vec3;
    vectors: Vec3[];
}

export class StudioBodyPart {
    name: string;
    nummodels: number;
    base: number;
    modelindex: number;
    // holder, all the models in this part
    models: StudioModel[];
}

export class StudioTexture {
    name: string;
    flags: number;
    width: number;
    height: number;
    index: number;
    // holder, pixels data, in RGBA format
    data: Uint8Array;
}

export class StudioVertexVector {
    bone: number;
    vec: Vec3;
}

export class StudioVertex {
    position: Vec3;
    normal: Vec3;
    texCoord: Vec2;
    // one bone binding per vertex
    bone: number;

    equal(other: StudioVertex): boolean {
        return this.position.equal(other.position)
            && this.normal.equal(other.normal)
            && this.texCoord.equal(other.texCoord)
            && this.bone == other.bone;
    }
}

export class StudioModel {
    name: string;
    type: number;
    boundingradius: number;
    nummesh: number;
    meshindex: number;
    numverts: number;
    vertinfoindex: number;
    vertindex: number;
    numnorms: number;
    norminfoindex: number;
    normindex: number;
    numgroups: number;
    groupindex: number;
    // holder
    mesh: StudioMesh[];
    verts: StudioVertexVector[];
    norms: StudioVertexVector[];
    // holder, all the rebuild vertices
    vertices: StudioVertex[];
}

export class StudioMesh {
    numtris: number;
    triindex: number;
    skinref: number;
    numnorms: number;
    normindex: number;
    // holder, rebuild index of triangles
    indices: number[];
}