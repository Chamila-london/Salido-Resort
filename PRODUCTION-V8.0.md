# Salido Resort V8.0

Production-focused upgrade based on V7.0.2 Design 02.

## Changes
- Refined compact Design 02 navigation to 58px desktop height with identical sticky sizing.
- Improved sticky separation, active state, hover and keyboard focus styling.
- Added Escape-key mobile menu closing and safer mobile viewport behavior.
- Added cinematic but lightweight hero image drift with reduced-motion fallback.
- Improved gallery hover/filter transitions and rendering containment.
- Added map rendering containment and delayed non-critical iframe loading.
- Added date validation/minimum dates to quick-book and contact forms.
- Added main landmark, corrected skip link, stronger focus states and high-contrast support.
- Added preconnect/dns-prefetch hints and lazy image decoding defaults.
- Removed unstable rating/price claims from hero metadata.
- Updated version and cache identifiers to 8.0.0.

## Deployment checks
Run `npm run qa`, then test login/publishing with production environment variables on the selected host.
