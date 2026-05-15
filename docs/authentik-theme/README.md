# PopPlate Authentik Theme

This folder contains the Authentik-side styling for the PopPlate login flow.

## Files

- `popplate-authentik.css` - paste this into the PopPlate Authentik Brand custom CSS field.

## Authentik Setup

1. Open Authentik Admin.
2. Go to System -> Brands.
3. Create or edit the brand used by the PopPlate login domain.
4. Set:
   - Branding title: `PopPlate`
   - Logo: PopPlate logo asset, if available
   - Favicon: PopPlate favicon, if available
   - Default flow background: leave empty unless a real food/plate image is available
   - Custom CSS: contents of `popplate-authentik.css`
5. Make sure the brand domain matches the Authentik domain users see during login.
6. Test login, signup/enrollment, password reset, MFA, and access-denied flows before production use.

## Design Notes

The CSS mirrors the current PopPlate site:

- stone page background
- slate primary buttons
- orange accent pill
- white rounded login surface
- dense, simple platform copy

The OIDC redirect model stays intact. Authentik still owns credentials, MFA, sessions, and user provisioning.
