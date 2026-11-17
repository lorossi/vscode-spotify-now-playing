// Pure helpers (no vscode dependency) so they can be unit-tested.

// Parses "artist<TAB>title<TAB>album" (Linux playerctl and macOS AppleScript output).
// Podcast episodes have no artist; the "album" is the show name.
function parseTabbed(out) {
  if (!out) return null;
  const [artist, title = '', album = ''] = out.split('\t').map((s) => s.trim());
  if (!title) return null;
  return { artist: artist || album, title };
}

// Parses Spotify's Windows window title: "Artist - Title" while playing,
// otherwise just "Spotify" / "Spotify Free" / "Spotify Premium".
function parseWindowTitle(out) {
  if (!out) return null;
  const i = out.indexOf(' - ');
  if (i < 0) return null; // idle/paused
  return { artist: out.slice(0, i), title: out.slice(i + 3) };
}

function formatText(track) {
  if (!track) return 'not playing';
  if (!track.artist) return track.title;
  return `${track.title} - ${track.artist}`;
}

module.exports = { parseTabbed, parseWindowTitle, formatText };
