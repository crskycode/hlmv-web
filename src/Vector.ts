class Vec2 {

    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    equal(other: Vec2): boolean {
        return (this.x === other.x) && (this.y === other.y);
    }
}

class Vec3 {

    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    equal(other: Vec3): boolean {
        return (this.x === other.x) && (this.y === other.y) && (this.z === other.z);
    }

    add(other: Vec3): void {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
    }
}

class Vec4 {

    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    equal(other: Vec4): boolean {
        return (this.x === other.x) && (this.y === other.y) && (this.z === other.z) && (this.w === other.w);
    }
}

export { Vec2, Vec3, Vec4 }