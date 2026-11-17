# Spotify Now Playing

A tiny VS Code extension. It shows the current Spotify track (`Title - Artist`) in the status bar, plus a **Spotify** button that opens Spotify. Nothing else.

It reads the local Spotify desktop app, so there is no login, no API key and no network access.

## Install

You need the Spotify **desktop app** running, plus the OS-specific step below.

### Windows

No extra setup.

1. Package and install the extension (see [Building](#building)).
2. Open Spotify and play something.

Notes:
- The track comes from Spotify's window title, which only contains the song while it is **playing**. Paused or idle shows "not playing".
- If Spotify is closed to the system tray, the window may have no title, so it shows "not playing". Keep the window open or minimized to the taskbar.
- An artist name containing ` - ` is split wrongly.

### macOS

No extra setup.

1. Package and install the extension (see [Building](#building)).$$$$$
2. The first time it runs, macOS may ask whether VS Code can control Spotify. Click **OK**. If you refused, enable it in *System Settings > Privacy & Security > Automation*.

### Linux

Install `playerctl`, which reads Spotify over MPRIS:

```sh
sudo pacman -S playerctl        # Arch
sudo apt install playerctl      # Debian / Ubuntu
sudo dnf install playerctl      # Fedora
```

Check it works while Spotify plays:

```sh
playerctl --player=spotify metadata --format '{{artist}} - {{title}}'
```

The Flatpak/Snap builds of Spotify work too, as long as `playerctl` can see them (`playerctl -l` should list `spotify`).

## Building

```sh
npx @vscode/vsce package --allow-missing-repository
code --install-extension spotify-now-playing-0.1.0.vsix
```

Reload VS Code afterwards.

To try it without installing:

```sh
code --extensionDevelopmentPath=/path/to/this/folder
```

## Usage

- The status bar (right) shows `Title - Artist` followed by the Spotify logo, or `not playing`. It refreshes every second (every 5 seconds on Windows).
- Click anywhere on the status bar item (or run `Spotify Now Playing: Open Spotify` from the command palette) to open the desktop app. If the app can't be opened, it opens open.spotify.com.

## Troubleshooting

| Symptom                              | Likely cause                                                       |
| ------------------------------------ | ------------------------------------------------------------------ |
| Always "not playing" on Linux        | `playerctl` missing, or Spotify not listed in `playerctl -l`       |
| Always "not playing" on Windows      | Nothing playing, or Spotify window closed to the tray              |
| Always "not playing" on macOS        | Automation permission refused for VS Code                          |
| Clicking the item opens the website | The desktop app isn't installed or doesn't handle `spotify:` links |

## Disclaimer

This is an independent project and is not affiliated with or endorsed by Spotify. "Spotify" is a trademark of Spotify AB.

## License

MIT, see the `LICENSE` file.
