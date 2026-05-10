# ASSET_SPEC

## Purpose
Define the minimum asset and upload rules for the MVP.

## Input assets for generation
Each dish submission should include:
- dish name
- 5-15 source photos
- optional short description
- optional allergens / ingredients / price

## Photo requirements
### Recommended capture rules
- take photos around the dish from multiple angles
- keep the full plate visible
- use even lighting when possible
- avoid heavy motion blur
- avoid hands/utensils covering the dish
- use a plain or low-noise background when possible
- keep the same dish/plating during one capture set

### File rules
- accepted formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- max file size per image: 10 MB
- recommended max count per dish for MVP: 15
- minimum count to submit: 5

## Generated output assets
Preferred output for MVP:
- primary preview asset: `.glb`
- poster image: `.jpg` / `.webp`
- optional iOS AR asset: `.usdz`

## Output quality rules
- target GLB size: under 15 MB if possible
- poster image required before publish
- asset should be upright by default
- asset should be centered enough for clean preview
- approximate scale should be stored in centimeters

## MVP reality
For MVP, output quality can be:
- generated automatically
- cleaned manually
- replaced manually if generation is poor

The admin workflow should not depend on perfect automation.

## Publish gate
A dish can only be published when:
- generation status is `ready`
- preview asset exists
- poster image exists
- dish has a public name

## Retry rules
A dish can be retried when:
- generation status is `failed`
- preview quality is unacceptable
- source photo set has been replaced or updated

## Nice-to-have later
- auto background cleanup
- auto texture/model optimization
- multiple quality tiers
- auto USDZ conversion
