const vscode = require('vscode');
const { execFile } = require('child_process');
const { parseTabbed, parseWindowTitle, formatText } = require('./parse');

let item, timer;
const LOGO = '$(spotify-logo)';

const run = (cmd, args) =>
  new Promise((resolve) => {
    execFile(cmd, args, { timeout: 5000, windowsHide: true }, (err, stdout) =>
      // Strip only the trailing newline: a leading tab means "empty artist" (podcasts).
      resolve(err ? null : stdout.replace(/\r?\n$/, ''))
    );
  });

// Each backend resolves to { artist, title } or null.
const backends = {
  // Linux: MPRIS via playerctl (pacman -S playerctl / apt install playerctl)
  async linux() {
    const out = await run('playerctl', ['--player=spotify', 'metadata', '--format', '{{artist}}\t{{title}}\t{{album}}']);
    return parseTabbed(out);
  },

  // macOS: AppleScript talking to the Spotify app
  async darwin() {
    const out = await run('osascript', [
      '-e', 'if application "Spotify" is running then',
      '-e', 'tell application "Spotify" to return (artist of current track) & tab & (name of current track) & tab & (album of current track)',
      '-e', 'end if',
    ]);
    return parseTabbed(out);
  },

  // Windows: Spotify puts "Artist - Title" in its window title while playing
  // (and just "Spotify" / "Spotify Free" / "Spotify Premium" otherwise).
  async win32() {
    const out = await run('powershell.exe', [
      '-NoProfile', '-NonInteractive', '-Command',
      '(Get-Process Spotify -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle } | Select-Object -First 1).MainWindowTitle',
    ]);
    return parseWindowTitle(out);
  },
};

async function update() {
  const reader = backends[process.platform];
  if (!reader) return;

  item.text = `${formatText(await reader())} ${LOGO}`;
}

async function openSpotify() {
  // "spotify:" is registered by the desktop app on every OS; fall back to the web player.
  const ok = await vscode.env.openExternal(vscode.Uri.parse('spotify:'));
  if (!ok) vscode.env.openExternal(vscode.Uri.parse('https://open.spotify.com'));
}

function activate(context) {
  item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  item.tooltip = 'Open Spotify';
  item.command = 'spotifyNowPlaying.open';
  item.text = LOGO;
  item.show();

  context.subscriptions.push(
    item,
    vscode.commands.registerCommand('spotifyNowPlaying.open', openSpotify),
    { dispose: () => clearInterval(timer) }
  );

  update();
  // PowerShell is slow to start, so poll less often on Windows.
  const updateInterval = process.platform === 'win32' ? 5000 : 1000;
  timer = setInterval(update, updateInterval);
}

function deactivate() { }

module.exports = { activate, deactivate };
