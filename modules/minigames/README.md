# Mini-games — extracted and disabled

VERA 1.1.1 no longer loads or packages this module. The main page has no game canvas, settings toggle, activation callbacks or free-layout game descriptor. A saved `showGame: true` therefore cannot enable it or reserve layout space.

Preserved here:

- `game.js`: original snake/cube implementation, unchanged bytes.
- `assets/`: original game covers, unchanged bytes.
- `widget.html`, `settings.html`, `game.css`: extracted UI and game-only styles.
- `script-integration.js.reference`: pre-extraction main script, for restoring integrations selectively. Do not load or replace the current main script with this snapshot.
- `game.test.cjs.reference`: original enabled-game regression, retained for future reintegration.
- `archive.json`: disabled status and original hashes.

This is a dormant module, not a standalone app. Its implementation expects VERA helpers and root-relative `assets/game-cover-*.webp` URLs. To restore it, reconnect the widget/settings/style fragments and free-layout descriptor, restore the activation callbacks, then explicitly add the script/assets to the page and package allowlist (adjust cover URLs if loading directly from this folder). Restore the archived game regression before release.

Existing `showGame`, game layout coordinates and `vera_cube_state_v1` storage are intentionally left untouched. No user data is deleted. Shared theme selectors and translations that mention games remain harmless compatibility definitions.
