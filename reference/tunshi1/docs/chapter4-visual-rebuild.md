# Chapter IV visual rebuild · 2026-10-02

TEST only. Main is unchanged. This is a substantial map/material/interior presentation update, retaining the connected exploration and facility gameplay. No formal Chapter IV story or complete minigames were added.

## What changed and why

The former circular building exclusion test left long gaps even when neighbouring rectangular facades fitted. The new planner checks actual rectangles against all roads, facility bodies, the open Huangxing plaza and underground stair heads. Shop walls now join along the main spine and narrow Taiping/Pozi streets while real crossings and side lanes stay open. Ground-floor merchandise, framed glazing, awnings and service detail provide readable human-scale structure; upper facade types, side elevations and roof silhouettes break the repeated apartment-window pattern.

The eight inspected photographs and their dates/reuse notices are recorded in [the reference dossier](chapter4-visual-reference-dossier.md); previous campus, park and tunnel references remain in [landmark references](chapter4-landmark-references.md). Ratios and exact internal layouts remain original compressed game designs. No downloaded photograph is embedded in a material or shipped with the game.

- Huangxing: continuous middle-height commercial walls, recessed displays, structural window framing, side windows, AC vents, coping, drains, projecting signs and grey granite bands. Its central plaza opens out around a standing bronze overcoat silhouette and a corner roof pavilion.
- Jiefang: ordinary asphalt car street, curbs, tactile paving, drain grates, shade trees and short pedestrian rail panels. Night sources occupy real street lamps instead of following the camera.
- Pozi: an original compressed Fire Palace street facade with red columns, teal eaves, gold trim and lantern chains. It is a frontage landmark, not an enterable replica of the actual complex.
- Taiping: low tiled pitched roofs, joined ridges, stepped walls, wooden shutters and a much narrower street wall.
- Wuyi: curved planted islands, connected paving and furnished edges. Office/shop frontages replace bare hub blocks.
- Heiwado: the completed 2025 silver perforated upper facade, warm three-storey windows on the front and side, projecting slab edges, rounded glazing and red UNIQLO identities. Window racks are actual shirt/hanger geometry. The commercial entrance remains visibly open.
- IFS: glazed display floors, opaque upper panels, articulated podium edges, unequal finned towers and stepped crowns, plus frozen rooftop-art silhouettes. Indoor oval galleries, escalators and mall/garage links retain their actual walkable routes.
- Interiors: clothes have necklines and sleeves, hangers meet the rail, folded stock rests on shelving, and curtain folds/mirrors/fixtures are modeled. Balustrades are glass. Floor, wood, metal and fabric finishes use appropriate shared materials. School milk-ice purchase/heal and saved outfits remain functional.

## Rendering and load

Physical world-coordinate tiling preserves a four-metre material period on scaled rigid instances. It adds vertex UV projection, not a fragment triplanar pass or extra geometry pass. The paving/brick/asphalt maps are shared; brick's vertical wrap is clamped for the short ground plinths because generated border continuity cannot be assumed. Glass and metal share a small six-face canvas environment. PNG completion requests a bounded redraw even on a paused start screen.

Only Chapter IV outdoor opaque rigid instances are consolidated into conservative spatial cells. Instances with compatible geometry/material finish share a draw using per-instance colour. Materials retain map, bump, roughness, metalness, UV hooks and shadow flags. Glass, actors, movable objects, interior geometry and other chapters keep their existing hierarchy. Repeated sign planes also share geometry and batches. Street lamps use at most three local, non-shadow point lights; nearest anchors refresh at bounded intervals without sorting the entire lamp list each frame.

Final allocation checks measure 56.6 MiB of Chapter IV base 2D maps, including original PNG dimensions rather than mocked fallback canvases; mipmaps, environment filtering, other chapters and driver overhead are additional. The three PNGs total 10.1 MiB on disk. Exact colour/material/transform checks pass. The final opaque/sign rigid instances consolidate from 5,386 source meshes to 1,781 cell meshes while retaining all instances; this is a geometry/draw-candidate count, not a timing measurement.

The existing maximum of 60 rendered frames per second, default resolution cap/native-resolution choice, idle/background sleep, 2048 shadow map and population budgets are retained. Allocation and mesh counts describe resources; they are not a measured FPS, GPU-memory total or temperature reduction.

## Review and checks

- `chapter4-visuals`: real isolated visual-entry button, actual walking/refresh, untouched normal slot, full clear centreline of every advertised road/alley, exact rigid colour/geometry/transform preservation, retained world-UV shader hook and original PNG dimensions/bytes.
- `chapter4-route`: continuous production-input C3→Nanhu→C4 and return; school/milk ice, main shopping districts, malls, purchase/heal and refresh. Same vehicle and damage state across the tunnel.
- `chapter4-interiors`: all 18 real E entries/exits, both three-floor escalators up/down, higher-floor refresh, wardrobe wallet/equip, glass/rail collision, underground stairs with visible mesh support, mall connections and B1 lift.
- `chapter4-systems`: area/time crowds, moving traffic restricted to motor roads, pedestrian restrictions, bounded population, chunk visibility, maps, tunnel camera, adopted car in B1, transfer roundtrip and suspended Chapter III retry/death.
- Affected shared checks: startup, render resolution, model/caption audit, 60 FPS and sleeping-loop behavior, visible scene matrices and generic rigid-instance partitioning.
- Final generated Worker and all image/module assets are built and packaged together. The build archive is checked against the tested checkout before publication.

The actual meshes were additionally inspected through the offline depth renderer from walk-height viewpoints for the main spine, plaza, Pozi, Taiping, both malls and school. Those views omit GPU shaders, maps, transparency, shadows, UI and sound. This environment has no supported real browser/GPU preview for the existing static-ESM/Worker project. Shader compilation, final lighting/readability, landscape phone usability, frame rate and audio need a real supported device review. Do not call the offline views gameplay screenshots or certify the PS3 visual target from automated checks.

## Original image-generation assets

Three bounded imagegen requests, all **new images**, no reference/edit mode, no variants/retries. Original generated PNG bytes were inspected and copied unchanged. Each output is **1254 × 1254 RGB PNG**, although the requested square size was 1024. They are texture sources, not published factual photographs. Granite repeat joints, brick wrap and asphalt grain still need normal real-device visual review.

### `dist/assets/chapter4/huangxing-granite.png`

Exact prompt:

```text
Use case: stylized-concept
Asset type: seamless square 1024 × 1024 diffuse/albedo texture for a Three.js game material, PS3-era high-quality stylized-realistic downtown Changsha pedestrian street.
Primary request: an original tileable 4m × 4m sample of cool medium-light gray granite rectangular pedestrian paving. Identical 2:1 slabs in staggered running bond, long edges horizontal, straight axis-aligned seams. Very thin charcoal joints. Restrained fine mineral grain and subtle everyday wear. Plausible human-scale paving, a regular repeating arrangement.
Composition/framing: top-down orthographic flat material scan, fills the complete square edge to edge. A flat 2D albedo map, not a scene or concept illustration.
Lighting/mood: perfectly consistent even diffuse lighting across the entire texture; neutral white balance, no baked directional lighting.
Constraints: seamless repeat in both axes; opposite borders continue the same slab layout, joint spacing and mineral pattern exactly. Choose an integer number of running-bond row pairs and slab widths within the 4m square so the layout wraps without a jump. No gradient, edge darkening, border or vignette. No camera perspective, depth effects, rendered bevels, directional shadows, ambient-occlusion shadows, highlights, objects, plants, dirt piles, text, logos or watermark. Opaque background.
```

### `dist/assets/chapter4/city-brick.png`

Exact prompt:

```text
Use case: stylized-concept
Asset type: seamless square 1024 × 1024 diffuse/albedo texture for a Three.js game material, PS3-era high-quality stylized-realistic downtown Changsha.
Primary request: an original tileable 4m × 4m sample of warm neutral reddish brown old-city brick masonry. Realistic small fired bricks in regular running bond, horizontal rows and straight axis-aligned seams. Narrow pale mortar. Restrained variation in brick firing color, grain and grime. Natural old-city masonry while remaining regular, usable and visually quiet as a game material.
Composition/framing: flat orthographic material scan facing the masonry surface directly, fills the complete square edge to edge. A flat 2D albedo map, not a scene or concept illustration.
Lighting/mood: perfectly consistent even diffuse lighting across the entire texture; neutral white balance, no baked directional lighting.
Constraints: seamless repeat in both axes; opposite borders continue the same brick layout, mortar spacing and surface pattern exactly. Choose an integer number of running-bond row pairs and brick widths within the 4m square so the layout wraps without a jump. No gradient, edge darkening, border or vignette. No perspective, dimensional relief, directional shadows, ambient-occlusion shadows, highlights, objects, graffiti, plants, text, logos or watermark. Opaque background.
```

### `dist/assets/chapter4/city-asphalt.png`

Exact prompt:

```text
Use case: stylized-concept
Asset type: seamless square 1024 × 1024 diffuse/albedo texture for a Three.js game material, PS3-era high-quality stylized-realistic downtown Changsha streets.
Primary request: an original tileable 4m × 4m sample of dry charcoal asphalt aggregate. Ultra-subtle faded aggregate, tiny restrained wear cracks, evenly neutral charcoal gray throughout. Fine realistic aggregate scaled appropriately to a 4m street surface sample. Quiet diffuse texture suitable for many repeated road tiles.
Composition/framing: top-down orthographic flat material scan, fills the complete square edge to edge. A flat 2D albedo map, not a scene or concept illustration.
Lighting/mood: perfectly consistent even diffuse lighting across the entire texture; neutral white balance, no baked directional lighting.
Constraints: seamless repeat in both axes; all grain and tiny crack patterns that cross one edge continue at the opposite edge exactly. No large distinctive features, gradients, edge darkening, border, vignette, scene, camera perspective, depth effects, directional shadows, ambient-occlusion shadows, highlights, objects, lane markings, painted lines, puddles, wet sheen, leaf litter, plants, text, logos or watermark. Opaque background.
```
