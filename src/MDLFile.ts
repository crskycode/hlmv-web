import { BinaryReader } from './BinaryReader';
import { Vec2, Vec3, Vec4 } from './Vector';
import { angleQuaternion, quaternionSlerp } from './MathLib';
import {
    StudioAnimationFrame,
    StudioAttachment,
    StudioBodyPart,
    StudioBone,
    StudioBoneController,
    StudioEvent,
    StudioHeader,
    StudioHitBox,
    StudioMesh,
    StudioModel,
    StudioPivot,
    StudioSequence,
    StudioSequenceGroup,
    StudioTexture,
    StudioVertex,
    StudioVertexVector
} from './Studio';

export class MDLFile {

    private header: StudioHeader = null;
    private bones: StudioBone[] = null;
    private boneControllers: StudioBoneController[] = null;
    private attachments: StudioAttachment[] = null;
    private hitBoxes: StudioHitBox[] = null;
    private sequences: StudioSequence[] = null;
    private sequenceGroups: StudioSequenceGroup[] = null;
    private bodyParts: StudioBodyPart[] = null;
    private textures: StudioTexture[] = null;
    private skinfamilies: number[][] = null;

    constructor() {
    }

    public load(buffer: ArrayBuffer) {
        let reader = new BinaryReader(buffer, true);

        this.readHeader(reader);
        this.readBone(reader);
        this.readSequence(reader);
        this.readTexture(reader);
        this.readModel(reader);
    }

    private readHeader(reader: BinaryReader): void {
        reader.setOffset(0);
        let h = new StudioHeader();
        // check magic
        h.id = reader.readUint32();
        if (h.id != 0x54534449) {
            throw new Error('not studio model file');
        }
        // check version
        h.version = reader.readUint32();
        if (h.version != 0x0A) {
            throw new Error('not supported version');
        }
        h.name = reader.readString(64);
        h.length = reader.readUint32();
        // check file size
        if (h.length != reader.getLength()) {
            throw new Error('invalid file length');
        }
        h.eyeposition = reader.readVec3();
        h.min = reader.readVec3();
        h.max = reader.readVec3();
        h.bbmin = reader.readVec3();
        h.bbmax = reader.readVec3();
        h.flags = reader.readUint32();
        h.numbones = reader.readUint32();
        h.boneindex = reader.readUint32();
        h.numbonecontrollers = reader.readUint32();
        h.bonecontrollerindex = reader.readUint32();
        h.numhitboxes = reader.readUint32();
        h.hitboxindex = reader.readUint32();
        h.numseq = reader.readUint32();
        h.seqindex = reader.readUint32();
        h.numseqgroups = reader.readUint32();
        h.seqgroupindex = reader.readUint32();
        h.numtextures = reader.readUint32();
        h.textureindex = reader.readUint32();
        h.texturedataindex = reader.readUint32();
        h.numskinref = reader.readUint32();
        h.numskinfamilies = reader.readUint32();
        h.skinindex = reader.readUint32();
        h.numbodyparts = reader.readUint32();
        h.bodypartindex = reader.readUint32();
        h.numattachments = reader.readUint32();
        h.attachmentindex = reader.readUint32();
        h.soundtable = reader.readUint32();
        h.soundindex = reader.readUint32();
        h.soundgroups = reader.readUint32();
        h.soundgroupindex = reader.readUint32();
        h.numtransitions = reader.readUint32();
        h.transitionindex = reader.readUint32();
        this.header = h;
    }

    private readBone(reader: BinaryReader): void {
        // read bones
        reader.setOffset(this.header.boneindex);
        this.bones = [];
        for (let i = 0; i < this.header.numbones; i++) {
            let a = new StudioBone();
            a.name = reader.readString(32);
            a.parent = reader.readInt32();
            a.flags = reader.readUint32();
            a.bonecontroller = reader.readInt32Array(6);
            a.value = reader.readFloatArray(6);
            a.scale = reader.readFloatArray(6);
            this.bones.push(a);
        }
        // read bone controllers
        reader.setOffset(this.header.bonecontrollerindex);
        this.boneControllers = [];
        for (let i = 0; i < this.header.numbonecontrollers; i++) {
            let a = new StudioBoneController();
            a.bone = reader.readUint32();
            a.type = reader.readUint32();
            a.start = reader.readFloat();
            a.end = reader.readFloat();
            a.rest = reader.readUint32();
            a.index = reader.readUint32();
            this.boneControllers.push(a);
        }
        // read attachments
        reader.setOffset(this.header.attachmentindex);
        this.attachments = [];
        for (let i = 0; i < this.header.numattachments; i++) {
            let a = new StudioAttachment();
            a.name = reader.readString(32);
            a.type = reader.readUint32();
            a.bone = reader.readUint32();
            a.org = reader.readVec3();
            a.vectors = [reader.readVec3(), reader.readVec3(), reader.readVec3()];
            this.attachments.push(a);
        }
        // read hit boxes
        reader.setOffset(this.header.hitboxindex);
        this.hitBoxes = [];
        for (let i = 0; i < this.header.numhitboxes; i++) {
            let a = new StudioHitBox();
            a.bone = reader.readUint32();
            a.group = reader.readUint32();
            a.bbmin = reader.readVec3();
            a.bbmax = reader.readVec3();
            this.hitBoxes.push(a);
        }
    }

    private readSequence(reader: BinaryReader): void {
        // read sequences
        reader.setOffset(this.header.seqindex);
        this.sequences = [];
        for (let i = 0; i < this.header.numseq; i++) {
            let a = new StudioSequence();
            a.label = reader.readString(32);
            a.fps = reader.readFloat();
            a.flags = reader.readUint32();
            a.activity = reader.readUint32();
            a.actweight = reader.readUint32();
            a.numevents = reader.readUint32();
            a.eventindex = reader.readUint32();
            a.numframes = reader.readUint32();
            a.numpivots = reader.readUint32();
            a.pivotindex = reader.readUint32();
            a.motiontype = reader.readUint32();
            a.motionbone = reader.readUint32();
            a.linearmovement = reader.readVec3();
            a.automoveposindex = reader.readUint32();
            a.automoveangleindex = reader.readUint32();
            a.bbmin = reader.readVec3();
            a.bbmax = reader.readVec3();
            a.numblends = reader.readUint32();
            a.animindex = reader.readUint32();
            a.blendtype = reader.readUint32Array(2);
            a.blendstart = reader.readFloatArray(2);
            a.blendend = reader.readFloatArray(2);
            a.blendparent = reader.readUint32();
            a.seqgroup = reader.readUint32();
            a.entrynode = reader.readUint32();
            a.exitnode = reader.readUint32();
            a.nodeflags = reader.readUint32();
            a.nextseq = reader.readUint32();
            this.sequences.push(a);
        }
        // read events and pivots
        this.sequences.forEach(seq => {
            // read events
            reader.setOffset(seq.eventindex);
            seq.events = [];
            for (let i = 0; i < seq.numevents; i++) {
                let a = new StudioEvent();
                a.frame = reader.readUint32();
                a.event = reader.readUint32();
                a.type = reader.readUint32();
                a.options = reader.readString(64);
                seq.events.push(a);
            }
            // read pivots
            reader.setOffset(seq.pivotindex);
            seq.pivots = [];
            for (let i = 0; i < seq.numpivots; i++) {
                let a = new StudioPivot();
                a.org = reader.readVec3();
                a.start = reader.readUint32();
                a.end = reader.readUint32();
                seq.pivots.push(a);
            }
        });
        // read sequence groups
        reader.setOffset(this.header.seqgroupindex);
        this.sequenceGroups = [];
        for (let i = 0; i < this.header.numseqgroups; i++) {
            let a = new StudioSequenceGroup();
            a.label = reader.readString(32);
            a.name = reader.readString(64);
            a.cache = reader.readUint32();
            a.data = reader.readUint32();
            this.sequenceGroups.push(a);
        }
        // read transitions
        reader.setOffset(this.header.transitionindex);
        for (let i = 0; i < this.header.numtransitions; i++) {
            for (let j = 0; j < this.header.numtransitions; j++) {
                // TODO:
                reader.readUint8();
            }
        }
        // read animation frames
        this.sequences.forEach(seq => {
            this.readAnimationFrame(reader, seq);
        });
    }

    private readModel(reader: BinaryReader): void {
        // read body parts
        reader.setOffset(this.header.bodypartindex);
        this.bodyParts = [];
        for (let i = 0; i < this.header.numbodyparts; i++) {
            let a = new StudioBodyPart();
            a.name = reader.readString(64);
            a.nummodels = reader.readUint32();
            a.base = reader.readUint32();
            a.modelindex = reader.readUint32();
            this.bodyParts.push(a);
        }
        // read models and mesh
        this.bodyParts.forEach(a => {
            // read models
            reader.setOffset(a.modelindex);
            a.models = [];
            for (let i = 0; i < a.nummodels; i++) {
                let b = new StudioModel();
                b.name = reader.readString(64);
                b.type = reader.readUint32();
                b.boundingradius = reader.readFloat();
                b.nummesh = reader.readUint32();
                b.meshindex = reader.readUint32();
                b.numverts = reader.readUint32();
                b.vertinfoindex = reader.readUint32();
                b.vertindex = reader.readUint32();
                b.numnorms = reader.readUint32();
                b.norminfoindex = reader.readUint32();
                b.normindex = reader.readUint32();
                b.numgroups = reader.readUint32();
                b.groupindex = reader.readUint32();
                a.models.push(b);
            }
            // read mesh, verts, norms
            a.models.forEach(b => {
                // read mesh
                reader.setOffset(b.meshindex);
                b.mesh = [];
                for (let i = 0; i < b.nummesh; i++) {
                    let c = new StudioMesh();
                    c.numtris = reader.readUint32();
                    c.triindex = reader.readUint32();
                    c.skinref = reader.readUint32();
                    c.numnorms = reader.readUint32();
                    c.normindex = reader.readUint32();
                    b.mesh.push(c);
                }
                // read verts
                b.verts = [];
                for (let i = 0; i < b.numverts; i++) {
                    b.verts.push(new StudioVertexVector());
                }
                reader.setOffset(b.vertinfoindex);
                for (let i = 0; i < b.numverts; i++) {
                    b.verts[i].bone = reader.readUint8();
                }
                reader.setOffset(b.vertindex);
                for (let i = 0; i < b.numverts; i++) {
                    b.verts[i].vec = reader.readVec3();
                }
                // read norms
                b.norms = [];
                for (let i = 0; i < b.numnorms; i++) {
                    b.norms.push(new StudioVertexVector());
                }
                reader.setOffset(b.norminfoindex);
                for (let i = 0; i < b.numnorms; i++) {
                    b.norms[i].bone = reader.readUint8();
                }
                reader.setOffset(b.normindex);
                for (let i = 0; i < b.numnorms; i++) {
                    b.norms[i].vec = reader.readVec3();
                }
                // rebuild
                this.rebuildModel(reader, b);
            });
        });
    }

    private readTexture(reader: BinaryReader): void {
        // read textures
        reader.setOffset(this.header.textureindex);
        this.textures = [];
        for (let i = 0; i < this.header.numtextures; i++) {
            let a = new StudioTexture();
            a.name = reader.readString(64);
            a.flags = reader.readUint32();
            a.width = reader.readUint32();
            a.height = reader.readUint32();
            a.index = reader.readUint32();
            this.textures.push(a);
        }
        // read skin families
        reader.setOffset(this.header.skinindex);
        this.skinfamilies = [];
        for (let i = 0; i < this.header.numskinfamilies; i++) {
            let skinref: number[] = [];
            for (let j = 0; j < this.header.numskinref; j++) {
                skinref.push(reader.readInt16());
            }
            this.skinfamilies.push(skinref);
        }
        // read texture image data
        this.textures.forEach(a => {
            this.readTextureData(reader, a);
        });
    }

    private rebuildModel(reader: BinaryReader, model: StudioModel): void {
        model.vertices = [];
        let addVertex = (pos: Vec3, norm: Vec3, uv: Vec2, bone: number): number => {
            let a = new StudioVertex();
            a.position = pos;
            a.normal = norm;
            a.texCoord = uv;
            a.bone = bone;
            // lookup vertex
            let i = model.vertices.findIndex(v => v.equal(a));
            if (i === -1) {
                return model.vertices.push(a) - 1;
            }
            return i;
        }
        // unpack triangle strip and fan
        model.mesh.forEach(a => {
            reader.setOffset(a.triindex);
            a.indices = [];
            let i: number;
            // load texture information for UV calculation
            let tex = this.textures[this.skinfamilies[0][a.skinref]];
            while (i = reader.readInt16()) {
                let fan = false;
                if (i < 0) {
                    fan = true;
                    i = -i;
                }
                let buf: number[][] = [];
                for (let j = 0; i > 0; i--, j++) {
                    buf.push(reader.readInt16Array(4));
                    if (j < 2) {
                        continue;
                    }
                    let vi = [0, 0, 0];
                    if (!fan) {
                        if (j % 2) {
                            vi[0] = j - 1;
                            vi[1] = j - 2;
                            vi[2] = j;
                        } else {
                            vi[0] = j - 2;
                            vi[1] = j - 1;
                            vi[2] = j;
                        }
                    } else {
                        vi[0] = j;
                        vi[1] = 0;
                        vi[2] = j - 1;
                    }
                    // 0-
                    a.indices.push(addVertex(
                        model.verts[buf[vi[0]][0]].vec,
                        model.norms[buf[vi[0]][1]].vec,
                        new Vec2(buf[vi[0]][2] / tex.width, buf[vi[0]][3] / tex.height),
                        model.verts[buf[vi[0]][0]].bone));
                    // 1-
                    a.indices.push(addVertex(
                        model.verts[buf[vi[1]][0]].vec,
                        model.norms[buf[vi[1]][1]].vec,
                        new Vec2(buf[vi[1]][2] / tex.width, buf[vi[1]][3] / tex.height),
                        model.verts[buf[vi[1]][0]].bone));
                    // 2-
                    a.indices.push(addVertex(
                        model.verts[buf[vi[2]][0]].vec,
                        model.norms[buf[vi[2]][1]].vec,
                        new Vec2(buf[vi[2]][2] / tex.width, buf[vi[2]][3] / tex.height),
                        model.verts[buf[vi[2]][0]].bone));
                }
            }
            if (a.indices.length / 3 != a.numtris) {
                throw 'Failed to parse triangles.';
            }
        });
    }

    private readAnimationFrame(reader: BinaryReader, seq: StudioSequence): void {
        seq.frames = [];
        for (let i = 0; i < seq.numframes; i++) {
            let panim = 0;
            if (seq.seqgroup == 0) {
                panim = this.sequenceGroups[seq.seqgroup].data + seq.animindex;
            } else {
                // TODO: support sequence file loading
                throw 'Not supported';
            }
            let a = new StudioAnimationFrame();
            a.pos = [];
            a.rot = [];
            for (let j = 0; j < this.bones.length; j++) {
                let rot = this.readBoneQuaternion(reader, this.bones[j], panim, i, 0);
                let pos = this.readBonePosition(reader, this.bones[j], panim, i, 0);
                panim += 12;
                a.rot.push(rot);
                a.pos.push(pos);
            }
            if (seq.motiontype & 0x0001)
                a.pos[seq.motionbone].x = 0.0;
            if (seq.motiontype & 0x0002)
                a.pos[seq.motionbone].y = 0.0;
            if (seq.motiontype & 0x0004)
                a.pos[seq.motionbone].z = 0.0;
            seq.frames.push(a);
        }
    }

    private readBoneQuaternion(reader: BinaryReader, bone: StudioBone, panim: number, frame: number, s: number): Vec4 {
        let rot1 = [0, 0, 0];
        let rot2 = [0, 0, 0];
        for (let j = 0; j < 3; j++) {
            let offset = reader.readUint16(panim + ((j + 3) * 2));
            if (offset === 0) {
                rot1[j] = rot2[j] = bone.value[j + 3];
            } else {
                let panimvalue = panim + offset;
                let k = frame;
                let valid = reader.readUint8(panimvalue);
                let total = reader.readUint8(panimvalue + 1);
                while (total <= k) {
                    k -= total;
                    panimvalue += (valid + 1) * 2;
                    // update
                    valid = reader.readUint8(panimvalue);
                    total = reader.readUint8(panimvalue + 1);
                }
                // Bah, missing blend!
                if (valid > k) {
                    rot1[j] = reader.readInt16(panimvalue + ((k + 1) * 2));
                    if (valid > k + 1) {
                        rot2[j] = reader.readInt16(panimvalue + ((k + 2) * 2));
                    } else {
                        if (total > k + 1) {
                            rot2[j] = rot1[j];
                        } else {
                            rot2[j] = reader.readInt16(panimvalue + ((valid + 2) * 2));
                        }
                    }
                } else {
                    rot1[j] = reader.readInt16(panimvalue + (valid * 2));
                    if (total > k + 1) {
                        rot2[j] = rot1[j];
                    } else {
                        rot2[j] = reader.readInt16(panimvalue + ((valid + 2) * 2));
                    }
                }
                rot1[j] = bone.value[j + 3] + rot1[j] * bone.scale[j + 3];
                rot2[j] = bone.value[j + 3] + rot2[j] * bone.scale[j + 3];
            }
        }
        let r1 = new Vec3(rot1[0], rot1[1], rot1[2]);
        let r2 = new Vec3(rot2[0], rot2[1], rot2[2]);
        if (!r1.equal(r2)) {
            let q1 = angleQuaternion(r1);
            let q2 = angleQuaternion(r2);
            return quaternionSlerp(q1, q2, s);
        }
        return angleQuaternion(r1);
    }

    private readBonePosition(reader: BinaryReader, bone: StudioBone, panim: number, frame: number, s: number): Vec3 {
        let pos = [0, 0, 0];
        for (let j = 0; j < 3; j++) {
            pos[j] = bone.value[j];
            let offset = reader.readUint16(panim + j * 2);
            if (offset !== 0) {
                let panimvalue = panim + offset;
                let k = frame;
                // find span of values that includes the frame we want
                let valid = reader.readUint8(panimvalue);
                let total = reader.readUint8(panimvalue + 1);
                while (total <= k) {
                    k -= total;
                    panimvalue += (valid + 1) * 2;
                    // update
                    valid = reader.readUint8(panimvalue);
                    total = reader.readUint8(panimvalue + 1);
                }
                // if we're inside the span
                if (valid > k) {
                    // and there's more data in the span
                    if (valid > k + 1) {
                        let v1 = reader.readInt16(panimvalue + ((k + 1) * 2));
                        let v2 = reader.readInt16(panimvalue + ((k + 2) * 2));
                        pos[j] += (v1 * (1.0 - s) + s * v2) * bone.scale[j];
                    } else {
                        let v1 = reader.readInt16(panimvalue + ((k + 1) * 2));
                        pos[j] += v1 * bone.scale[j];
                    }
                } else {
                    // are we at the end of the repeating values section and there's another section with data?
                    if (total <= k + 1) {
                        let v1 = reader.readInt16(panimvalue + (valid * 2));
                        let v2 = reader.readInt16(panimvalue + ((valid + 2) * 2));
                        pos[j] += (v1 * (1.0 - s) + s * v2) * bone.scale[j];
                    } else {
                        let v1 = reader.readInt16(panimvalue + (valid * 2));
                        pos[j] += v1 * bone.scale[j];
                    }
                }
            }
        }
        return new Vec3(pos[0], pos[1], pos[2]);
    }

    private readTextureData(reader: BinaryReader, texture: StudioTexture) {
        reader.setOffset(texture.index);
        const indicesSize = texture.width * texture.height;
        const palSize = 256 * 3;
        const dataSize = indicesSize * 4;
        let indices = new Uint8Array(reader.readBuffer(indicesSize));
        let pal = new Uint8Array(reader.readBuffer(palSize));
        let pixels = new Uint8Array(dataSize);
        // TODO: support transparent texture
        for (let i = 0; i < indicesSize; i++) {
            let index = indices[i];
            let colorOffset = index * 3;
            let pixelOffset = i * 4;
            pixels[pixelOffset + 0] = pal[colorOffset + 0]; // R
            pixels[pixelOffset + 1] = pal[colorOffset + 1]; // G
            pixels[pixelOffset + 2] = pal[colorOffset + 2]; // B
            pixels[pixelOffset + 3] = 255; // A
        }
        texture.data = pixels;
    }

    getHeader(): StudioHeader {
        return this.header;
    }

    getBones(): StudioBone[] {
        return this.bones;
    }

    getTextures(): StudioTexture[] {
        return this.textures;
    }

    getSkinFamilies(): number[][] {
        return this.skinfamilies;
    }

    getBodyParts(): StudioBodyPart[] {
        return this.bodyParts;
    }

    getSequences(): StudioSequence[] {
        return this.sequences;
    }
}