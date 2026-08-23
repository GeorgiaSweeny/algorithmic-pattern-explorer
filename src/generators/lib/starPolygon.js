/*
========================================
STAR POLYGON
========================================
* Builds the classic {n/k} star-polygon edge set: join every point of a
* Radial Divisions ring to the one `skip` steps around, instead of asking
* which point is nearest (that's Distance Field's job). Straight chords
* between non-adjacent points self-intersect into sharp outward rays — the
* traditional construction real Islamic star motifs use — rather than the
* flat Voronoi cells a nearest-point search gives.
*
* Not sourced from docs/references/Maths to Magic...pdf — that paper's own
* Figures 17-19 ("Motif A"/"Motif B") are screenshots of its reference
* Houdini tool's output, not a chord/skip specification (the paper's actual
* method is translate-rotate-boolean CSG on copies of a shape, described in
* its Figures 3-5; see docs/ISLAMIC_PATTERN_CONSTRUCTION.md for the full
* comparison). The {n/k} skip formula and rationale below are this
* codebase's own reading of the general star-polygon construction.
*
* starOutline() below is islamic.js's construction: instead of using the
* raw chords directly (each one crossing the whole ring, as starEdges
* gives you), it derives the star polygon's own *silhouette* — n sharp tip
* vertices (the ring points themselves) alternating with n concave waist
* vertices, each waist being the actual point where two of the star's own
* chords cross near that gap. This is standard "fill a self-intersecting
* star polygon" geometry (the same shape a 5-pointed star icon traces),
* not sourced from any reference doc — see docs/ISLAMIC_PATTERN_CONSTRUCTION.md
* for why: the user-supplied compass-and-straightedge source
* (drawingislamicgeometricdesigns.com, Anthony Lee's rosette method) could
* not be transcribed reliably from two independent WebFetch passes, so
* this implements the piece of real, independently-verifiable geometry his
* method and this one share (one proportioning relationship deriving the
* whole star+petal shape as a single silhouette) rather than guessing at
* his exact labelled steps.
*/

export function starSkip(n) {
   return n % 2 === 0 ? Math.max(1, n / 2 - 1) : Math.floor(n / 2);
}

// Flat [x1, y1, x2, y2, ...] chord list connecting point i to point
// (i + skip) % n, for every i — the full edge set of the (possibly
// compound) star polygon, ready for Distance Field's line-feature search.
export function starEdges(points, skip) {
   const n = points.length / 2;
   const edges = new Float32Array(n * 4);
   for (let i = 0; i < n; i++) {
      const j = (i + skip) % n;
      edges[i * 4]     = points[i * 2];
      edges[i * 4 + 1] = points[i * 2 + 1];
      edges[i * 4 + 2] = points[j * 2];
      edges[i * 4 + 3] = points[j * 2 + 1];
   }
   return edges;
}

// Where two infinite lines (through p1-p2 and p3-p4) cross, or null if
// they're parallel (or nearly enough that the intersection is unreliable).
export function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
   const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
   if (Math.abs(d) < 1e-9) return null;
   const a = x1 * y2 - y1 * x2;
   const b = x3 * y4 - y3 * x4;
   return {
      x: (a * (x3 - x4) - (x1 - x2) * b) / d,
      y: (a * (y3 - y4) - (y1 - y2) * b) / d,
   };
}

// The star polygon's own silhouette: ring points (tips) alternating with
// waist points, giving a closed 2n-vertex polygon
// [tip_0, waist_0, tip_1, waist_1, ..., tip_{n-1}, waist_{n-1}].
//
// waist_i is where chord(tip_i, tip_{i+skip}) crosses chord(tip_{i+1},
// tip_{i+1-skip}) — the two chords nearest the gap between tip_i and
// tip_{i+1}. By the ring's rotational symmetry these two chords are exact
// mirror images of each other about the bisector angle between tip_i and
// tip_{i+1}, so they're guaranteed to cross somewhere on that bisector
// (not an approximation — a line and its own mirror image about an axis
// only ever meet on that axis, except in the degenerate near-parallel
// case guarded below).
//
// Falls back to waist = midpoint(tip_i, tip_{i+1}) for whichever gaps
// produce a degenerate (near-parallel) chord pair — keeps this total for
// every n rather than producing NaN/Infinity for small n where `skip`
// isn't geometrically meaningful.
export function starOutline(points, skip) {
   const n = points.length / 2;
   const tip = (i) => {
      const k = ((i % n) + n) % n;
      return [points[k * 2], points[k * 2 + 1]];
   };

   const outline = new Float32Array(n * 4);
   for (let i = 0; i < n; i++) {
      const [tx, ty] = tip(i);
      outline[i * 4] = tx;
      outline[i * 4 + 1] = ty;

      const [ax, ay] = tip(i);
      const [bx, by] = tip(i + skip);
      const [cx, cy] = tip(i + 1);
      const [dx, dy] = tip(i + 1 - skip);
      const hit = lineIntersect(ax, ay, bx, by, cx, cy, dx, dy);
      outline[i * 4 + 2] = hit ? hit.x : (tx + cx) / 2;
      outline[i * 4 + 3] = hit ? hit.y : (ty + cy) / 2;
   }
   return outline;
}
