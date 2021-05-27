import { Vec3, Vec4 } from "./Vector";

export function angleQuaternion(angles: Vec3): Vec4 {
    let angle: number;

    // FIXME: rescale the inputs to 1/2 angle
    angle = angles.z * 0.5;
    let sy = Math.sin(angle);
    let cy = Math.cos(angle);
    angle = angles.y * 0.5;
    let sp = Math.sin(angle);
    let cp = Math.cos(angle);
    angle = angles.x * 0.5;
    let sr = Math.sin(angle);
    let cr = Math.cos(angle);

    let x = sr * cp * cy - cr * sp * sy;
    let y = cr * sp * cy + sr * cp * sy;
    let z = cr * cp * sy - sr * sp * cy;
    let w = cr * cp * cy + sr * sp * sy;

    return new Vec4(x, y, z, w);
}

export function quaternionSlerp(p_: Vec4, q_: Vec4, t: number): Vec4 {
    let qt = [0, 0, 0, 0];
    let p = [p_.x, p_.y, p_.z, p_.w];
    let q = [q_.x, q_.y, q_.z, q_.w];

    // decide if one of the quaternions is backwards
    let a = 0;
    let b = 0;
    for (let i = 0; i < 4; i++) {
        a += (p[i] - q[i]) * (p[i] - q[i]);
        b += (p[i] + q[i]) * (p[i] + q[i]);
    }
    if (a > b) {
        for (let i = 0; i < 4; i++) {
            q[i] = -q[i];
        }
    }

    let cosom = p[0] * q[0] + p[1] * q[1] + p[2] * q[2] + p[3] * q[3];

    if ((1.0 + cosom) > 0.00000001) {
        let sclp: number;
        let sclq: number;
        if ((1.0 - cosom) > 0.00000001) {
            let omega = Math.acos(cosom);
            let sinom = Math.sin(omega);
            sclp = Math.sin((1.0 - t) * omega) / sinom;
            sclq = Math.sin(t * omega) / sinom;
        } else {
            sclp = 1.0 - t;
            sclq = t;
        }
        for (let i = 0; i < 4; i++) {
            qt[i] = sclp * p[i] + sclq * q[i];
        }
    } else {
        qt[0] = -p[1];
        qt[1] = p[0];
        qt[2] = -p[3];
        qt[3] = p[2];
        let sclp = Math.sin((1.0 - t) * 0.5 * Math.PI);
        let sclq = Math.sin(t * 0.5 * Math.PI);
        for (let i = 0; i < 3; i++) {
            qt[i] = sclp * p[i] + sclq * qt[i];
        }
    }

    return new Vec4(qt[0], qt[1], qt[2], qt[3]);
}