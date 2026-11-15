# Carbon theme for Claude

A look for the Claude desktop app, in the same Carbon language as my apps Pulsar and Spazio.

- **Dark:** near black graphite (`#121013`, cards `#1C191D`, text `#EEEBF0`), monochrome choices, lighter borders.
- **Light:** white and cool gray, no accent color.
- **Background:** a small pixel ship floating over a slowly scrolling pixel landscape, under frosted glass panels.
- **`/vetro`** switches the veil over the background: frosted glass, a plain veil, or solid panels.

The theme follows the app's own light or dark setting.

## Install

In a terminal session of Claude Code:

```
/plugin install spazio-tema --marketplace juliendesigncraft/carbon-theme-for-claude
```

From a shell:

```
claude plugin install spazio-tema --marketplace juliendesigncraft/carbon-theme-for-claude
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `juliendesigncraft/carbon-theme-for-claude`, then Add plugin.

Sessions already open pick it up with `/reload-plugins`.

## Change the background

The scene is generated: edit `strumenti/genera-scena.mjs` and run

```
node strumenti/genera-scena.mjs
```

Made by [@juliendesigncraft](https://www.instagram.com/juliendesigncraft/). MIT license.
