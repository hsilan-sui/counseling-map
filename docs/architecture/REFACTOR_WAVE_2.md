# Refactor Wave 2

## Scope Summary
This wave focused on extracting clinic list derivation and geolocation/distance orchestration from `src/pages/index.tsx`, then sealing the hook boundary to remove direct setter access from Home while preserving runtime behavior.

### Extracted Units
- `src/utils/clinicSelectors.ts`
  - Extracted: filter + prioritized list selection (`sortedByDistance ?? clinics`) for `clinicsToShow` derivation.
- `src/hooks/useClinicLocation.ts`
  - Extracted: geolocation bootstrap effect, distance sorting flow, map centering, preferred county handling, and sorted result reset behavior.
  - Encapsulation refinement: replaced raw setter exposure with named actions (`onUserLocate`, `moveMapTo`, `clearPreferredSort`, `clearDistanceSort`).

## Why This Improves Structure
- Removes location/sorting orchestration from page-level composition code.
- Centralizes location-related side effects and state transitions in one hook boundary.
- Converts imperative setter calls in Home into semantic actions, clarifying intent at call sites.
- Keeps clinic derivation logic reusable and independent from React component structure.

## Layering: Before vs After
### Before
- `index.tsx` mixed:
  - UI composition
  - clinic filtering/display derivation
  - geolocation side effects
  - distance sorting orchestration
  - direct writes to hook-owned state via raw setters

### After
- `index.tsx`: orchestration/composition + action dispatch (`moveMapTo`, `clearPreferredSort`, etc.).
- `hooks/useClinicLocation`: location state, side effects, distance sorting, and boundary-safe action API.
- `utils/clinicSelectors`: pure clinic list selection for filtered and sorted display states.

## Architectural Benefits
- Stronger encapsulation: Home no longer mutates hook internals through raw setters.
- Clearer responsibility boundaries between composition, side effects, and derivation logic.
- Lower coupling at integration points via semantic actions instead of implementation-detail setters.
- Safer evolution path: internal hook state handling can change without touching Home call sites.
