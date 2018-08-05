function Point(x, y) {
    return {x: x, y: y};
}

function Vector(x, y, z) {
    return {x: x, y: y, z: z};
}

function point_cross(a, b) {
    return Vector(a.y - b.y, b.x - a.x, a.x * b.y - a.y * b.x);
}

function cross(u, v) {
    var z = u.x * v.y - u.y * v.x;
    return Point((u.y * v.z - u.z * v.y) / z, (u.z * v.x - u.x * v.z) / z);
}

function dot(u, v) {
    return u.x * v.x + u.y * v.y + u.z * v.z;
}

let mask = [0, 1, 2, 2, 4, 0, 4, 4, 8, 1, 0, 2, 8, 1, 8, 0];
let tab1 = [4, 3, 0, 3, 1, 4, 0, 3, 2, 2, 4, 2, 1, 1, 0, 4];
let tab2 = [4, 0, 1, 1, 2, 4, 2, 2, 3, 0, 4, 1, 3, 0, 3, 4];

class Clipper {
    constructor(a, b) {
        if (a.x < b.x) {
            this.x_min = a.x;
            this.x_max = b.x;
        } else {
            this.x_min = b.x;
            this.x_max = a.x;
        }

        if (a.y < b.y) {
            this.y_min = a.y;
            this.y_max = b.y;
        } else {
            this.y_min = b.y;
            this.y_max = a.y;
        }

        this.x = [
            Vector(this.x_min, this.y_min, 1),
            Vector(this.x_max, this.y_min, 1),
            Vector(this.x_max, this.y_max, 1),
            Vector(this.x_min, this.y_max, 1)
        ]

        this.e = [
            Vector(0, 1, -this.y_min),
            Vector(1, 0, -this.x_max),
            Vector(0, 1, -this.y_max),
            Vector(1, 0, -this.x_min)
        ]
    }

    code(pt) {
        var c = 0;

        if (pt.x < this.x_min) {
            c = 8;
        } else if (pt.x > this.x_max) {
            c = 2;
        }

        if (pt.y < this.y_min) {
            c |= 1;
        } else if (pt.y > this.y_max) {
            c |= 4;
        }

        return c;
    };

    clipLine(x_a, x_b) {
        let c_a = this.code(x_a);
        let c_b = this.code(x_b);

        if ((c_a | c_b) == 0) {
            return [0, x_a, x_b];
        }

        if ((c_a & c_b) != 0) {
            return [-1, x_a, x_b];
        }

        let p = point_cross(x_a, x_b);

        var c = 0;

        for (var k = 0; k < 4; k++) {
            if (dot(p, this.x[k]) <= 0) {
                c |= (1 << k);
            }
        }

        if (c == 0 || c == 15) {
            return [-1, x_a, x_b];
        }

        let i = tab1[c];
        let j = tab2[c];

        if (c_a != 0 && c_b != 0) {
            x_a = cross(p, this.e[i]);
            x_b = cross(p, this.e[j]);
            return [3, x_a, x_b];
        } else {
            if (c_a == 0) {
                if ((c_b & mask[c]) == 0) {
                    x_b = cross(p, this.e[i]);
                } else {
                    x_b = cross(p, this.e[j]);
                }
                return [2, x_a, x_b];
            } else if (c_b == 0) {
                if ((c_a & mask[c]) == 0) {
                    x_a = cross(p, this.e[i]);
                } else {
                    x_a = cross(p, this.e[j]);
                }
                return [1, x_a, x_b];
            }
        }
    }
}
