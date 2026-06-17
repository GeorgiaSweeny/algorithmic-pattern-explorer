/*
========================================
MAIN — entry point
========================================
No p5.js. Initialises the PatternDocument
and hands it to the workspace controller.
*/

import { createDocument }  from "./state/document.js";
import { SAMPLE_GRID }     from "./data/samplePattern.js";
import { initWorkspace }   from "./ui/workspace.js";

const doc = createDocument({
   name:    "Fair Isle Sample",
   width:   40,
   height:  40,
   source:  "library",
   grid:    SAMPLE_GRID,
});

initWorkspace(doc);
