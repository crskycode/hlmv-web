import { Vec3 } from './Vector';

export class BinaryReader {

    private buffer: ArrayBuffer;
    private view: DataView;
    private littleEndian: boolean;
    private offset: number;

    constructor(buffer: ArrayBuffer, littleEndian: boolean) {
        if (!buffer) {
            throw new Error('buffer cannot be null');
        }
        this.buffer = buffer;
        this.view = new DataView(this.buffer);
        this.littleEndian = littleEndian;
        this.offset = 0;
    }

    setOffset(offset: number): void {
        if (offset < 0 || offset > this.buffer.byteLength) {
            throw new RangeError('offset out of buffer');
        }
        this.offset = offset;
    }

    getLength(): number {
        return this.buffer.byteLength;
    }

    readBuffer(length: number, offset?: number): ArrayBuffer {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let result = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return result;
    }

    readInt8(offset?: number): number {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let value = this.view.getInt8(this.offset);
        this.offset += 1;
        return value;
    }

    readUint8(offset?: number): number {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let value = this.view.getUint8(this.offset);
        this.offset += 1;
        return value;
    }

    readInt16(offset?: number): number {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let value = this.view.getInt16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    }

    readUint16(offset?: number): number {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let value = this.view.getUint16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    }

    readInt32(offset?: number): number {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let value = this.view.getInt32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    readUint32(offset?: number): number {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let value = this.view.getUint32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    readFloat(offset?: number): number {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let value = this.view.getFloat32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    readString(length: number, offset?: number) {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let array = new Uint8Array(this.buffer, this.offset, length);
        this.offset += length;
        length = array.findIndex(v => v === 0);
        if (length === 0) {
            return '';
        }
        if (length === -1) {
            length = array.length;
        }
        array = array.slice(0, length);
        let result = '';
        array.forEach(e => {
            result += String.fromCharCode(e);
        });
        return result;
    }

    readInt16Array(count: number, offset?: number): number[] {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let array: number[] = [];
        for (let i = 0; i < count; i++) {
            array.push(this.readInt16());
        }
        return array;
    }

    readInt32Array(count: number, offset?: number): number[] {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let array: number[] = [];
        for (let i = 0; i < count; i++) {
            array.push(this.readInt32());
        }
        return array;
    }

    readUint32Array(count: number, offset?: number): number[] {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let array: number[] = [];
        for (let i = 0; i < count; i++) {
            array.push(this.readUint32());
        }
        return array;
    }

    readFloatArray(count: number, offset?: number): number[] {
        if (offset !== undefined) {
            this.offset = offset;
        }
        let array: number[] = [];
        for (let i = 0; i < count; i++) {
            array.push(this.readFloat());
        }
        return array;
    }

    readVec3(offset?: number): Vec3 {
        if (offset !== undefined) {
            this.offset = offset;
        }
        return new Vec3(this.readFloat(), this.readFloat(), this.readFloat());
    }
}