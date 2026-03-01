# Refactor Wave 1

## Scope Summary
This wave focused on extracting non-UI responsibilities from `src/pages/index.tsx` into dedicated hook/utility modules while preserving runtime behavior.

### Extracted Units
- `src/hooks/useViewsCounter.ts`
  - Extracted: page views state + mounted guard + GET/POST `/api/views` effect + sessionStorage one-time increment behavior.
- `src/hooks/useIsSidebarBottom.ts`
  - Extracted: responsive media-query state logic for sidebar placement.
- `src/utils/geo.ts`
  - Extracted: `haversineDistance`, `normalizeLatLng`, `countyByCoords`.
- `src/utils/clinicMapper.ts`
  - Extracted: clinic row normalization/enrichment mapping logic.
  - Exported shared type: `ClinicWithGeo`.

## Why This Improves Structure
- Reduces page-level responsibility concentration in `index.tsx`.
- Separates pure computation from React lifecycle/state effects.
- Makes domain transforms (`clinic -> ClinicWithGeo[]`) explicit and reusable.
- Improves type ownership by moving `ClinicWithGeo` to mapper boundary.

## Layering: Before vs After
### Before
- `index.tsx` mixed:
  - UI composition
  - side effects (view counting, media query)
  - geo computation
  - raw data mapping/enrichment
  - type alias ownership

### After
- `index.tsx`: orchestration/composition only.
- `hooks/`: stateful browser/runtime concerns.
- `utils/`: pure deterministic transformations/computations.
- `types at boundary`: `ClinicWithGeo` exported from mapping module.

## Architectural Benefits
- Clearer responsibility boundaries and lower cognitive load in page component.
- Better testability surface (pure utilities/hooks isolated).
- Reduced coupling between view layer and domain logic.
- Safer incremental refactor path: behavior preserved with smaller, atomic modules.
