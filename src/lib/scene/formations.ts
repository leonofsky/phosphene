import * as THREE from "three";

export function digitFormations(count: number): Float32Array[] {
  // Ten 3D formations: torus, sphere, helix, grid, wave, cross, ring, spiral, cube, random.
  const formations: Float32Array[] = [];
  const v = new THREE.Vector3();
  for (let d = 0; d < 10; d++) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const a = t * Math.PI * 2;
      const b = ((i * 0.61803398875) % 1) * Math.PI * 2;
      switch (d) {
        case 0: v.set(Math.cos(a) * 12 + Math.cos(b) * 2, Math.sin(b) * 2, Math.sin(a) * 12 + Math.cos(b) * 2); break;
        case 1: v.setFromSphericalCoords(10, Math.acos(1 - 2 * t), b); break;
        case 2: v.set(Math.cos(a * 4) * 7, (t - 0.5) * 24, Math.sin(a * 4) * 7); break;
        case 3: v.set((i % 16 - 8) * 1.4, (Math.floor(i / 16) % 16 - 8) * 1.4, (Math.floor(i / 256) - 2) * 4); break;
        case 4: v.set((t - 0.5) * 28, Math.sin(a * 3) * 5, Math.cos(a * 2) * 8); break;
        case 5: v.set(i % 3 === 0 ? (t - 0.5) * 24 : 0, i % 3 === 1 ? (t - 0.5) * 24 : 0, i % 3 === 2 ? (t - 0.5) * 24 : 0); break;
        case 6: v.set(Math.cos(a) * 11, Math.sin(a) * 11, Math.sin(a * 5) * 1.5); break;
        case 7: v.set(Math.cos(a * 3) * t * 14, (t - 0.5) * 8, Math.sin(a * 3) * t * 14); break;
        case 8: v.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18); break;
        default: v.setFromSphericalCoords(4 + Math.random() * 14, Math.random() * Math.PI, Math.random() * Math.PI * 2);
      }
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    }
    formations.push(positions);
  }
  return formations;
}
