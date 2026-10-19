# Playroom Arcade

Playroom Arcade opens as its own desktop window and contains twenty-five games.

## Run from this folder

Install the app dependencies once with `npm install`, then launch it with `npm start`.

## Build the Windows installer

Run `npm run dist`. The installer is written to `dist/Playroom-Setup-1.1.1.exe`. It creates Start Menu and desktop shortcuts.

The app loads the local game files; an internet connection is only needed for optional Google Fonts and update checks.

## Publish an update

The packaged app checks GitHub Releases when it starts and installs downloaded updates after the app closes. To publish an update, increase the version in `package.json`, commit and push to `main`. GitHub Actions creates a matching tag, builds the Windows installer, and publishes the release automatically. Commits that keep the same version do not create duplicate releases.

