# PattKnitter
## Archetype-Based Procedural Pattern Generator

Pattknitter is a browser-based procedural pattern generation system that enables users to design, modify, and export visual patterns through a unified, human-centric parameter model.

Instead of exposing generator-specific parameters, PattKnitter abstracts procedural systems (noise, tessellation, wave fields, spatial patterns, and recursive structures) into a shared set of archetypes such as Size, Density, Detail, and Randomness. These archetypes provide a consistent interface across heterogeneous pattern generation algorithms.

Patterns are defined as normalized recipes consisting of:

a generator (e.g. noise, grid, Voronoi)
a set of parameter-to-archetype mappings
transform rules for consistent UI scaling
export capabilities

The system supports real-time preview and export to common formats including PNG and SVG, with an experimental pathway for domain-specific export into knitting pattern grids.

Key Features
Archetype-driven parameter system for procedural patterns
Multiple generator families (tessellation, noise, wave, recursive, spatial)
Consistent UI across all pattern types
Live canvas-based preview (p5.js)
Export to SVG / PNG
Experimental knitting chart export (grid-based patterns)
Research Focus

This project explores whether a normalized archetype-based interaction model can provide a consistent and usable interface for heterogeneous procedural pattern systems, evaluated through user testing with domain-specific (textile/knitting) workflows.

### Intial Proposal
[MSc Project Proposal_Georgia Sweeny.pdf](https://github.com/user-attachments/files/26582968/MSc.Project.Proposal_Georgia.Sweeny.pdf)
