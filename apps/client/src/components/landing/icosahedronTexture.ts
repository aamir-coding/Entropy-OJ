import * as THREE from 'three';

/* ─── Canonical Regular Icosahedron Geometry ──────────────────────────────── */
const PHI = (1 + Math.sqrt(5)) / 2; // Golden Ratio ~1.61803398875
const R0 = Math.sqrt(1 + PHI * PHI); // ~1.90211303259

const BASE_VERTICES: [number, number, number][] = [
  [-1,  PHI, 0], [ 1,  PHI, 0], [-1, -PHI, 0], [ 1, -PHI, 0],
  [ 0, -1,  PHI], [ 0,  1,  PHI], [ 0, -1, -PHI], [ 0,  1, -PHI],
  [ PHI, 0, -1], [ PHI, 0,  1], [-PHI, 0, -1], [-PHI, 0,  1],
].map(([x, y, z]) => [x / R0, y / R0, z / R0]);

const FACES: [number, number, number][] = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

// Precompute 30 unique edges and their adjacent faces
interface EdgeInfo {
  v1: number;
  v2: number;
  faceA: number;
  faceB: number;
}

const EDGES_WITH_NEIGHBORS: EdgeInfo[] = (() => {
  const edgeMap = new Map<string, { v1: number; v2: number; faces: number[] }>();

  for (let f = 0; f < FACES.length; f++) {
    const [a, b, c] = FACES[f];
    const pairs: [number, number][] = [[a, b], [b, c], [c, a]];

    for (const [v1, v2] of pairs) {
      const minV = Math.min(v1, v2);
      const maxV = Math.max(v1, v2);
      const key = `${minV}_${maxV}`;

      if (!edgeMap.has(key)) {
        edgeMap.set(key, { v1: minV, v2: maxV, faces: [f] });
      } else {
        edgeMap.get(key)!.faces.push(f);
      }
    }
  }

  const result: EdgeInfo[] = [];
  for (const item of edgeMap.values()) {
    result.push({
      v1: item.v1,
      v2: item.v2,
      faceA: item.faces[0],
      faceB: item.faces[1] ?? item.faces[0],
    });
  }
  return result;
})();

// Precompute adjacent faces for each of the 12 vertices
const VERTEX_FACES: number[][] = (() => {
  const vf: number[][] = Array.from({ length: 12 }, () => []);
  for (let f = 0; f < FACES.length; f++) {
    const [a, b, c] = FACES[f];
    vf[a].push(f);
    vf[b].push(f);
    vf[c].push(f);
  }
  return vf;
})();

/* ─── Vector Math Helpers ─────────────────────────────────────────────────── */
interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function rotateX(v: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: v.x, y: v.y * cos - v.z * sin, z: v.y * sin + v.z * cos };
}

function rotateY(v: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: v.x * cos + v.z * sin, y: v.y, z: -v.x * sin + v.z * cos };
}

function rotateZ(v: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos, z: v.z };
}

/* ─── Procedural Icosahedron Texture Engine ───────────────────────────────── */
export class IcosahedronTextureEngine {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;

  private readonly resolution: number;
  private readonly scale: number;
  private readonly lightDir: Vec3;

  // 3D Hold-and-Spin Drag Physics State
  public isDragging = false;
  private userRotation = { x: 0, y: 0 };
  private angularVelocity = { x: 0, y: 0 };
  private lastPointer = { x: 0, y: 0 };

  // Smooth Parallax tilt on hover
  private smoothedParallax = { x: 0, y: 0 };

  constructor(resolution = 512) {
    this.resolution = resolution;
    this.scale = resolution * 0.36; // comfortably sized within canvas with padding

    // Light vector from top-right-front
    const lx = 0.45, ly = 0.65, lz = 0.75;
    const lLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
    this.lightDir = { x: lx / lLen, y: ly / lLen, z: lz / lLen };

    this.canvas = document.createElement('canvas');
    this.canvas.width = resolution;
    this.canvas.height = resolution;

    const ctx = this.canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) throw new Error('Failed to get 2D canvas context for IcosahedronTexture');
    this.context = ctx;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;

    // Initial render
    this.render(0);
  }

  /* ── Pointer Drag Event Handlers ────────────────────────────────────────── */
  public onPointerDown(clientX: number, clientY: number): void {
    this.isDragging = true;
    this.lastPointer = { x: clientX, y: clientY };
    this.angularVelocity = { x: 0, y: 0 };
  }

  public onPointerMove(clientX: number, clientY: number): void {
    if (!this.isDragging) return;

    const dx = clientX - this.lastPointer.x;
    const dy = clientY - this.lastPointer.y;
    this.lastPointer = { x: clientX, y: clientY };

    // Sensitivity: radians per pixel
    const sensitivity = 0.0075;
    const dRotY = dx * sensitivity;
    const dRotX = dy * sensitivity;

    this.userRotation.y += dRotY;
    this.userRotation.x += dRotX;

    // Track instantaneous angular velocity for momentum throw
    this.angularVelocity.y = dRotY;
    this.angularVelocity.x = dRotX;
  }

  public onPointerUp(): void {
    this.isDragging = false;
    // Clamp velocity to reasonable momentum bounds
    const maxSpeed = 0.18;
    this.angularVelocity.x = Math.max(-maxSpeed, Math.min(maxSpeed, this.angularVelocity.x));
    this.angularVelocity.y = Math.max(-maxSpeed, Math.min(maxSpeed, this.angularVelocity.y));
  }

  /* ── Per-Frame Update & Render ─────────────────────────────────────────── */
  public update(time: number, screenCursor: THREE.Vector2): void {
    if (!this.isDragging) {
      // Apply momentum throw with angular friction damping
      this.userRotation.x += this.angularVelocity.x;
      this.userRotation.y += this.angularVelocity.y;

      this.angularVelocity.x *= 0.94;
      this.angularVelocity.y *= 0.94;

      // When momentum settles, maintain slow majestic idle drift
      const idleSpeed = 0.0025;
      this.userRotation.y += idleSpeed;
    }

    // Subtle parallax tilt when pointer is hovering
    const targetParallaxX = (Math.abs(screenCursor.x) <= 1 ? screenCursor.x : 0) * 0.20;
    const targetParallaxY = (Math.abs(screenCursor.y) <= 1 ? -screenCursor.y : 0) * 0.15;

    this.smoothedParallax.x += (targetParallaxX - this.smoothedParallax.x) * 0.08;
    this.smoothedParallax.y += (targetParallaxY - this.smoothedParallax.y) * 0.08;

    this.render(time);
    this.texture.needsUpdate = true;
  }

  public render(time: number): void {
    const ctx = this.context;
    const res = this.resolution;
    const cx = res * 0.5;
    const cy = res * 0.5;

    // Clear to pure #000000 background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, res, res);

    // 1. Compute 3D Euler Rotations:
    // Base Isometric Tilt (pitch 35.264°, yaw 45°) + user interactive rotation + parallax
    const isoPitch = 0.6154797; // ~35.264 deg
    const isoYaw = 0.7853982;   // 45 deg

    const totalRotX = isoPitch + this.userRotation.x + this.smoothedParallax.y;
    const totalRotY = isoYaw + this.userRotation.y + this.smoothedParallax.x;
    const totalRotZ = Math.sin(time * 0.15) * 0.04;

    // 2. Transform the 12 Vertices in 3D Space
    const rotV: Vec3[] = BASE_VERTICES.map(([bx, by, bz]) => {
      let v: Vec3 = { x: bx, y: by, z: bz };
      v = rotateY(v, totalRotY);
      v = rotateX(v, totalRotX);
      v = rotateZ(v, totalRotZ);
      return v;
    });

    // 2D Screen-space coordinates
    const projV = rotV.map((v) => ({
      x: cx + v.x * this.scale,
      y: cy - v.y * this.scale,
      z: v.z,
    }));

    // 3. Compute Outward Normals and Visibility for all 20 Faces
    interface FaceRenderData {
      idx: number;
      normZ: number;
      avgZ: number;
      intensity: number;
      pa: { x: number; y: number };
      pb: { x: number; y: number };
      pc: { x: number; y: number };
    }

    const faceData: FaceRenderData[] = [];
    const faceNormalsZ: number[] = new Array(FACES.length);

    for (let f = 0; f < FACES.length; f++) {
      const [ia, ib, ic] = FACES[f];
      const a = rotV[ia], b = rotV[ib], c = rotV[ic];

      // Calculate 3D Outward Normal (cross product AB x AC)
      const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
      const acx = c.x - a.x, acy = c.y - a.y, acz = c.z - a.z;
      const nx = aby * acz - abz * acy;
      const ny = abz * acx - abx * acz;
      const nz = abx * acy - aby * acx;
      const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);

      const normX = nLen > 0 ? nx / nLen : 0;
      const normY = nLen > 0 ? ny / nLen : 0;
      const normZ = nLen > 0 ? nz / nLen : 0;

      faceNormalsZ[f] = normZ;

      // Lighting Model: Ambient + Lambertian Diffuse + Specular Sheen
      const diffuse = Math.max(0, normX * this.lightDir.x + normY * this.lightDir.y + normZ * this.lightDir.z);
      const hx = this.lightDir.x, hy = this.lightDir.y, hz = this.lightDir.z + 1.0;
      const hLen = Math.sqrt(hx * hx + hy * hy + hz * hz);
      const spec = Math.pow(Math.max(0, (normX * hx + normY * hy + normZ * hz) / (hLen || 1)), 14.0) * 0.35;

      const ambient = 0.12;
      const intensity = Math.min(0.68, ambient + diffuse * 0.42 + spec);

      faceData.push({
        idx: f,
        normZ,
        avgZ: (rotV[ia].z + rotV[ib].z + rotV[ic].z) / 3,
        intensity,
        pa: projV[ia],
        pb: projV[ib],
        pc: projV[ic],
      });
    }

    // 4. Render Facets (Style 2: Faceted Crystal Shading)
    // Only render front-facing facets (normZ > 0). Backfaces are strictly occluded.
    // Sort front faces back-to-front by average Z for clean depth rendering
    const frontFaces = faceData.filter((f) => f.normZ > -0.05);
    frontFaces.sort((a, b) => a.avgZ - b.avgZ);

    for (const face of frontFaces) {
      // Fade in smoothly as the facet turns towards camera
      const faceAlpha = Math.min(1.0, Math.max(0.0, (face.normZ + 0.05) * 3.0));
      const gray = Math.round(face.intensity * 255 * faceAlpha);

      ctx.beginPath();
      ctx.moveTo(face.pa.x, face.pa.y);
      ctx.lineTo(face.pb.x, face.pb.y);
      ctx.lineTo(face.pc.x, face.pc.y);
      ctx.closePath();
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.fill();
    }

    // 5. Render Structural Wireframe Edges with Strict Adjacent-Face Culling
    // An edge is visible IF AND ONLY IF at least one of its two adjacent triangles is front-facing!
    // This strictly prevents incomplete floating edges from lighting up before their triangles appear.
    for (const edge of EDGES_WITH_NEIGHBORS) {
      const nzA = faceNormalsZ[edge.faceA];
      const nzB = faceNormalsZ[edge.faceB];

      const maxNz = Math.max(nzA, nzB);

      // STRICT CONVEX VISIBILITY: If both adjacent faces are facing away, edge is completely occluded!
      if (maxNz <= 0.02) {
        continue; // Do NOT draw rear-facing edges!
      }

      // Smooth synchronous edge fade: fades in unison with the triangle rotating into view
      const edgeAlpha = Math.min(1.0, Math.max(0.0, (maxNz - 0.02) * 2.8));
      if (edgeAlpha <= 0.01) continue;

      const p1 = projV[edge.v1];
      const p2 = projV[edge.v2];

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${edgeAlpha})`;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // 6. Render Apex Diamond Nodes (Strictly synchronized with visible faces)
    for (let v = 0; v < 12; v++) {
      const p = projV[v];
      // A vertex is visible only if at least one of its adjacent faces is front-facing
      let maxVertexNz = -1.0;
      for (const fIdx of VERTEX_FACES[v]) {
        if (faceNormalsZ[fIdx] > maxVertexNz) {
          maxVertexNz = faceNormalsZ[fIdx];
        }
      }

      if (maxVertexNz > 0.02) {
        const nodeAlpha = Math.min(1.0, maxVertexNz * 3.0);
        const nodeSize = 3.6 + Math.max(0, p.z) * 1.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha})`;
        ctx.shadowColor = `rgba(255, 255, 255, ${nodeAlpha})`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }
  }

  public dispose(): void {
    this.texture.dispose();
  }
}
