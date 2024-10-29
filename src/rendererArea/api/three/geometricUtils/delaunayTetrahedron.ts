type Point3D = {
    x: number;
    y: number;
    z: number;
  };
  
  type Tetrahedron = {
    points: [Point3D, Point3D, Point3D, Point3D];
    circumcenter: Point3D;
    circumradius: number;
  };
  
  type Triangle3D = {
    points: [Point3D, Point3D, Point3D];
  };
  
  export class Delaunay3D {
    private points: Point3D[] = [];
    private tetrahedra: Tetrahedron[] = [];
    private surfaceTriangles: Set<string> = new Set();
  
    constructor(points: Point3D[]) {
      if (points.length < 4) {
        throw new Error('At least 4 points are required for 3D triangulation');
      }
      this.points = points;
      this.triangulate();
    }
  
    private calculateCircumsphere(p1: Point3D, p2: Point3D, p3: Point3D, p4: Point3D): { 
      center: Point3D; 
      radius: number 
    } {
      // Matrix solution for circumcenter of tetrahedron
      const d = this.determinant([
        [p1.x, p1.y, p1.z, 1],
        [p2.x, p2.y, p2.z, 1],
        [p3.x, p3.y, p3.z, 1],
        [p4.x, p4.y, p4.z, 1]
      ]);
  
      if (Math.abs(d) < 1e-10) {
        throw new Error('Points are coplanar');
      }
  
      const p1Sq = p1.x * p1.x + p1.y * p1.y + p1.z * p1.z;
      const p2Sq = p2.x * p2.x + p2.y * p2.y + p2.z * p2.z;
      const p3Sq = p3.x * p3.x + p3.y * p3.y + p3.z * p3.z;
      const p4Sq = p4.x * p4.x + p4.y * p4.y + p4.z * p4.z;
  
      const dx = this.determinant([
        [p1Sq, p1.y, p1.z, 1],
        [p2Sq, p2.y, p2.z, 1],
        [p3Sq, p3.y, p3.z, 1],
        [p4Sq, p4.y, p4.z, 1]
      ]);
  
      const dy = -this.determinant([
        [p1Sq, p1.x, p1.z, 1],
        [p2Sq, p2.x, p2.z, 1],
        [p3Sq, p3.x, p3.z, 1],
        [p4Sq, p4.x, p4.z, 1]
      ]);
  
      const dz = this.determinant([
        [p1Sq, p1.x, p1.y, 1],
        [p2Sq, p2.x, p2.y, 1],
        [p3Sq, p3.x, p3.y, 1],
        [p4Sq, p4.x, p4.y, 1]
      ]);
  
      const c = -this.determinant([
        [p1Sq, p1.x, p1.y, p1.z],
        [p2Sq, p2.x, p2.y, p2.z],
        [p3Sq, p3.x, p3.y, p3.z],
        [p4Sq, p4.x, p4.y, p4.z]
      ]);
  
      const center: Point3D = {
        x: dx / (2 * d),
        y: dy / (2 * d),
        z: dz / (2 * d)
      };
  
      const radius = Math.sqrt(
        (dx * dx + dy * dy + dz * dz) / (4 * d * d) - c / d
      );
  
      return { center, radius };
    }
  
    private determinant(matrix: number[][]): number {
      if (matrix.length !== 4 || matrix.some(row => row.length !== 4)) {
        throw new Error('Matrix must be 4x4');
      }
  
      const [
        [m00, m01, m02, m03],
        [m10, m11, m12, m13],
        [m20, m21, m22, m23],
        [m30, m31, m32, m33]
      ] = matrix;
  
      return (
        m00 * m11 * m22 * m33 + m00 * m12 * m23 * m31 + m00 * m13 * m21 * m32 -
        m00 * m13 * m22 * m31 - m00 * m12 * m21 * m33 - m00 * m11 * m23 * m32 -
        m01 * m10 * m22 * m33 - m02 * m10 * m23 * m31 - m03 * m10 * m21 * m32 +
        m03 * m10 * m22 * m31 + m02 * m10 * m21 * m33 + m01 * m10 * m23 * m32 +
        m01 * m12 * m20 * m33 + m02 * m13 * m20 * m31 + m03 * m11 * m20 * m32 -
        m03 * m12 * m20 * m31 - m02 * m11 * m20 * m33 - m01 * m13 * m20 * m32 -
        m01 * m12 * m23 * m30 - m02 * m13 * m21 * m30 - m03 * m11 * m22 * m30 +
        m03 * m12 * m21 * m30 + m02 * m11 * m23 * m30 + m01 * m13 * m22 * m30
      );
    }
  
    private isPointInCircumsphere(point: Point3D, tetra: Tetrahedron): boolean {
      const dx = point.x - tetra.circumcenter.x;
      const dy = point.y - tetra.circumcenter.y;
      const dz = point.z - tetra.circumcenter.z;
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      return distanceSquared <= tetra.circumradius * tetra.circumradius * (1 + 1e-10);
    }
  
    private createTetrahedronKey(points: Point3D[]): string {
      return points
        .map(p => `${p.x},${p.y},${p.z}`)
        .sort()
        .join('|');
    }
  
    private createTriangleKey(points: Point3D[]): string {
      return points
        .map(p => `${p.x},${p.y},${p.z}`)
        .sort()
        .join('|');
    }
  
    private triangulate(): void {
      // Create initial super-tetrahedron
      const superTetra = this.createSuperTetrahedron();
      this.tetrahedra = [superTetra];
  
      // Add points one by one
      for (const point of this.points) {
        const badTetrahedra: Tetrahedron[] = [];
  
        // Find all tetrahedra whose circumsphere contains the point
        for (const tetra of this.tetrahedra) {
          if (this.isPointInCircumsphere(point, tetra)) {
            badTetrahedra.push(tetra);
          }
        }
  
        // Find boundary faces (triangles)
        const boundary = this.findBoundaryFaces(badTetrahedra);
  
        // Remove bad tetrahedra
        this.tetrahedra = this.tetrahedra.filter(
          t => !badTetrahedra.includes(t)
        );
  
        // Create new tetrahedra from point and boundary faces
        for (const face of boundary) {
          try {
            const { center, radius } = this.calculateCircumsphere(
              face.points[0],
              face.points[1],
              face.points[2],
              point
            );
  
            this.tetrahedra.push({
              points: [face.points[0], face.points[1], face.points[2], point],
              circumcenter: center,
              circumradius: radius
            });
          } catch (error) {
            // Skip if points are coplanar
            continue;
          }
        }
      }
  
      // Remove tetrahedra connected to super-tetrahedron
      this.removeExternalTetrahedra(superTetra);
      
      // Extract surface triangles
      this.extractSurfaceTriangles();
    }
  
    private createSuperTetrahedron(): Tetrahedron {
      // Find bounding box
      const minX = Math.min(...this.points.map(p => p.x));
      const minY = Math.min(...this.points.map(p => p.y));
      const minZ = Math.min(...this.points.map(p => p.z));
      const maxX = Math.max(...this.points.map(p => p.x));
      const maxY = Math.max(...this.points.map(p => p.y));
      const maxZ = Math.max(...this.points.map(p => p.z));
  
      // Calculate center and size
      const dx = maxX - minX;
      const dy = maxY - minY;
      const dz = maxZ - minZ;
      const dmax = Math.max(dx, dy, dz);
      const mid = {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        z: (minZ + maxZ) / 2
      };
  
      // Create super-tetrahedron vertices
      const p1: Point3D = {
        x: mid.x - 20 * dmax,
        y: mid.y - dmax,
        z: mid.z - dmax
      };
      const p2: Point3D = {
        x: mid.x + 20 * dmax,
        y: mid.y - dmax,
        z: mid.z - dmax
      };
      const p3: Point3D = {
        x: mid.x,
        y: mid.y + 20 * dmax,
        z: mid.z - dmax
      };
      const p4: Point3D = {
        x: mid.x,
        y: mid.y,
        z: mid.z + 20 * dmax
      };
  
      const { center, radius } = this.calculateCircumsphere(p1, p2, p3, p4);
  
      return {
        points: [p1, p2, p3, p4],
        circumcenter: center,
        circumradius: radius
      };
    }
  
    private findBoundaryFaces(badTetrahedra: Tetrahedron[]): Triangle3D[] {
      const faceCount = new Map<string, number>();
  
      // Count occurrences of each face
      for (const tetra of badTetrahedra) {
        const faces = [
          [tetra.points[0], tetra.points[1], tetra.points[2]],
          [tetra.points[0], tetra.points[1], tetra.points[3]],
          [tetra.points[0], tetra.points[2], tetra.points[3]],
          [tetra.points[1], tetra.points[2], tetra.points[3]]
        ];
  
        for (const face of faces) {
          const key = this.createTriangleKey(face);
          faceCount.set(key, (faceCount.get(key) || 0) + 1);
        }
      }
  
      // Return faces that appear only once (boundary faces)
      const boundaryFaces: Triangle3D[] = [];
      faceCount.forEach((count, key) => {
        if (count === 1) {
          const points = key.split('|').map(point => {
            const [x, y, z] = point.split(',').map(Number);
            return { x, y, z };
          });
          boundaryFaces.push({
            points: [points[0], points[1], points[2]] as [Point3D, Point3D, Point3D]
          });
        }
      });
  
      return boundaryFaces;
    }
  
    private removeExternalTetrahedra(superTetra: Tetrahedron): void {
      const superPoints = new Set(
        superTetra.points.map(p => `${p.x},${p.y},${p.z}`)
      );
      this.tetrahedra = this.tetrahedra.filter(
        tetra => !tetra.points.some(p => superPoints.has(`${p.x},${p.y},${p.z}`))
      );
    }
  
    private extractSurfaceTriangles(): void {
      const triangleCount = new Map<string, number>();
  
      // Count occurrences of each triangle
      for (const tetra of this.tetrahedra) {
        const faces = [
          [tetra.points[0], tetra.points[1], tetra.points[2]],
          [tetra.points[0], tetra.points[1], tetra.points[3]],
          [tetra.points[0], tetra.points[2], tetra.points[3]],
          [tetra.points[1], tetra.points[2], tetra.points[3]]
        ];
  
        for (const face of faces) {
          const key = this.createTriangleKey(face);
          triangleCount.set(key, (triangleCount.get(key) || 0) + 1);
        }
      }
  
      // Add triangles that appear only once (surface triangles)
      triangleCount.forEach((count, key) => {
        if (count === 1) {
          this.surfaceTriangles.add(key);
        }
      });
    }
  
    // Public methods
    public getTetrahedra(): Tetrahedron[] {
      return this.tetrahedra;
    }
  
    public getSurfaceTriangles(): Triangle3D[] {
      return Array.from(this.surfaceTriangles).map(key => {
        const points = key.split('|').map(point => {
          const [x, y, z] = point.split(',').map(Number);
          return { x, y, z };
        });
        return {
          points: [points[0], points[1], points[2]] as [Point3D, Point3D, Point3D]
        };
      });
    }
  
    public getPoints(): Point3D[] {
      return this.points;
    }
  }