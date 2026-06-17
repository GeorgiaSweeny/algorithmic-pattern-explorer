/*
========================================
IMPORTERS
========================================
* Each importer converts an external pattern format into the
* normalised internal schema defined in core/patternSchema.js.
*
* Contract:
*   importer.import(externalDef) → PatternEntry
*
* Planned:
*   jsonImporter.js      — generic JSON pattern definitions
*   jsImporter.js        — ES module pattern definitions
*   svgImporter.js       — SVG-based patterns
* Importers are the only bridge between external libraries and the registry.
* No external format knowledge leaks past this boundary.
-----------------------------------------
*/
