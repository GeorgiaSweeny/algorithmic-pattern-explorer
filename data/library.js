/*
========================================
PATTERN LIBRARY — static data
========================================
Each pattern has a status:
  "active" — loads into the editor (prototype: only one works)
  "proxy"  — shown in the UI for browsing but not loadable
              (demonstrates category/browse interaction)
*/

export const LIBRARY = [
   {
      category: "Fair Isle",
      patterns: [
         { id: "fair-isle-sample",    name: "Diamond Band",     status: "active"  },
         { id: "fair-isle-snowflake", name: "Snowflake",        status: "proxy"   },
         { id: "fair-isle-chevron",   name: "Chevron",          status: "proxy"   },
         { id: "fair-isle-tree",      name: "Tree of Life",     status: "proxy"   },
      ],
   },
   {
      category: "Stripes",
      patterns: [
         { id: "stripe-classic",      name: "Classic Stripe",   status: "proxy"   },
         { id: "stripe-ombre",        name: "Ombré Fade",       status: "proxy"   },
         { id: "stripe-broken",       name: "Broken Stripe",    status: "proxy"   },
      ],
   },
   {
      category: "Geometric",
      patterns: [
         { id: "geo-houndstooth",     name: "Houndstooth",      status: "proxy"   },
         { id: "geo-argyle",          name: "Argyle",           status: "proxy"   },
         { id: "geo-mosaic",          name: "Mosaic",           status: "proxy"   },
      ],
   },
   {
      category: "Cables",
      patterns: [
         { id: "cable-basic",         name: "Basic Cable",      status: "proxy"   },
         { id: "cable-horseshoe",     name: "Horseshoe Cable",  status: "proxy"   },
      ],
   },
   {
      category: "Lace",
      patterns: [
         { id: "lace-leaf",           name: "Leaf Lace",        status: "proxy"   },
         { id: "lace-feather",        name: "Feather & Fan",    status: "proxy"   },
      ],
   },
];
