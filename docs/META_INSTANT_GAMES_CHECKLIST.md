# Meta Instant Games — submission checklist

Use this when your app is feature-complete and you are preparing to ship on Facebook / Messenger / FB Gaming.

## Developer console

- [ ] App created in [Meta for Developers](https://developers.facebook.com/) with **Instant Games** product enabled.
- [ ] **Privacy policy URL** and **terms** (if required) filled in app settings.
- [ ] **App domains** and **allowed domains** for your game bundle host match where you upload or serve the build.
- [ ] **Instant Games** tab: game name, category, screenshots / video as required by current review rules.

## Client bundle

- [ ] `fbapp-config.json` is present in the deployed root (see `client/public/fbapp-config.json`).
- [ ] Vite `base: "./"` so assets load when hosted from a subpath or packaged upload.
- [ ] FBInstant SDK script version matches the API you tested (`fbinstant.6.3.js` or current documented URL).
- [ ] `VITE_API_URL` (or production equivalent) points to your **HTTPS** API in production.

## Backend

- [ ] `META_APP_SECRET` set on the server; **never** ship it to the client.
- [ ] `DEV_AUTH_BYPASS` is **off** in production (`0` or unset).
- [ ] MySQL (or production DB) reachable from the API host; migrations applied.

## Testing before submit

- [ ] Play a full **solo** round in the Instant Games test / sandbox environment.
- [ ] Create an **async** match and have a second account join the same context; confirm turns and `updateAsync` behavior.
- [ ] Confirm `/health` and authenticated `/api/me` against production-like config.

## Notes

Exact Instant Games review requirements change over time; always verify against the latest Meta documentation for **Instant Games** and **Messenger Platform** policies.
