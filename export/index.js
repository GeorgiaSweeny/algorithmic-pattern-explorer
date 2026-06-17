/*
========================================
EXPORT
========================================
* Converts the rendered canvas into output formats.
*
* Planned:
*   pngExporter.js       — canvas.toBlob → PNG download
*   svgExporter.js       — reconstruct pattern as vector paths
*   knittingExporter.js  — pixel values mapped to stitch chart rows/columns
*
* All exporters receive (genName, params, canvas) and produce
* a downloadable artefact. No UI logic lives here.
-----------------------------------------
*/
