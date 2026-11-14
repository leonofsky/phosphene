const PHI = Math.PI * (3 - Math.sqrt(5));

export function particleHome(
  digit: number,
  i: number,
  n: number,
  radius: number,
  out: { x: number; y: number; z: number },
): void {
  const t = n <= 1 ? 0.5 : i / (n - 1);
  const y0 = 1 - t * 2;
  const r = Math.sqrt(Math.max(0, 1 - y0 * y0));
  const theta = PHI * i;
  let x = Math.cos(theta) * r;
  let y = y0;
  let z = Math.sin(theta) * r;

  switch (digit) {
    case 0: {
      out.x = x * 0.05 * radius;
      out.y = y * 0.05 * radius;
      out.z = z * 0.05 * radius;
      return;
    }
    case 1:
      break;
    case 2: {
      const side = i % 2 === 0 ? -1 : 1;
      x = x * 0.62 + side * 0.92;
      y *= 0.82;
      z *= 0.82;
      break;
    }
    case 3: {
      const ring = i % 3;
      if (ring === 0) z *= 0.1;
      else if (ring === 1) y *= 0.1;
      else x *= 0.1;
      break;
    }
    case 4: {
      const verts: Array<[number, number, number]> = [
        [1, 1, 1],
        [1, -1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
      ];
      const v = verts[i % 4]!;
      x = x * 0.32 + v[0] * 0.72;
      y = y * 0.32 + v[1] * 0.72;
      z = z * 0.32 + v[2] * 0.72;
      break;
    }
    case 5: {
      y *= 0.22;
      const a = (i % 5) * ((Math.PI * 2) / 5);
      x = x * 0.38 + Math.cos(a) * 0.78;
      z = z * 0.38 + Math.sin(a) * 0.78;
      break;
    }
    case 6: {
      const layer = (i % 3) - 1;
      y = layer * 0.68 + y * 0.12;
      const a = (i % 6) * (Math.PI / 3);
      x = Math.cos(a) * 0.92 + x * 0.16;
      z = Math.sin(a) * 0.92 + z * 0.16;
      break;
    }
    case 7: {
      const arm = i % 3;
      const spin = t * 6.4 + arm * 2.094;
      const rad = 0.22 + t * 0.95;
      x = Math.cos(spin) * rad;
      z = Math.sin(spin) * rad;
      y *= 0.1;
      break;
    }
    case 8: {
      x = Math.sign(x || 1) * 0.82 + x * 0.16;
      y = Math.sign(y || 1) * 0.82 + y * 0.16;
      z = Math.sign(z || 1) * 0.82 + z * 0.16;
      break;
    }
    case 9: {
      x *= 1.42;
      y *= 1.22;
      z *= 1.42;
      break;
    }
    default:
      break;
  }

  out.x = x * radius;
  out.y = y * radius;
  out.z = z * radius;
}

export function satelliteAnchor(digit: number, index: number): {
  x: number;
  y: number;
  z: number;
  scale: number;
} {
  const r = 0.55 + Math.max(1, digit) * 0.26;
  const golden = PHI * index;
  const y = Math.sin(index * 1.17 + digit * 0.4) * 0.55;
  return {
    x: Math.cos(golden) * r,
    y,
    z: Math.sin(golden) * r,
    scale: 0.16 + (digit / 9) * 0.14,
  };
}

export function digitDispersion(digit: number): { dispersion: number; turbulence: number; count: number } {
  if (digit <= 0) {
    return { dispersion: 0.12, turbulence: 0.02, count: 280 };
  }
  return {
    dispersion: 0.55 + digit * 0.32,
    turbulence: 0.05 + digit * 0.055,
    count: 480 + digit * 180,
  };
}
