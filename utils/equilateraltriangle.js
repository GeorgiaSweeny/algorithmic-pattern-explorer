export function equilateralTriangle(w, h) {
         let cx;
         let cy;

         cx = CANVAS.CENTROID[0];
         cy = CANVAS.CENTROID[1];

         let width;
         let height;

         width = w;
         height = h;

         let aArr; //base line coordinates
         aArr = [cx + width / 2, cy, cx - width / 2, cy];

         let ax1 = a[0];
         let ax2 = a[2];
         let ay1 = a[1];
         let ay2 = a[3];

         /*
         let b;
         bArr = [ax1, ay1, cx, cy + height];

         let c;
         cArr = [ax2, ay2, cx, cy + height];
      
         a = line(ax1, ay1, ax2, ay2);
         b = line(ax1, xy1, cx, cy);
         c = line(ax2, ay2, cx, cy);
         */

         return triangle(ax1, ay1, ax2, ay2, cx, cy + height);
      }