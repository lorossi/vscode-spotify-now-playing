const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTabbed, parseWindowTitle, formatText } = require('../parse');

test('parseTabbed: music track', () => {
  assert.deepEqual(parseTabbed('Daft Punk\tAround the World\tHomework'), {
    artist: 'Daft Punk',
    title: 'Around the World',
  });
});

test('parseTabbed: podcast with empty artist falls back to the show name', () => {
  // Leading tab = empty artist; the title also has a stray leading space (seen on real Spotify output).
  assert.deepEqual(parseTabbed('\t La Zanzara del 17 novembre 2026\tLa Zanzara'), {
    artist: 'La Zanzara',
    title: 'La Zanzara del 17 novembre 2026',
  });
});

test('parseTabbed: no artist and no album gives an empty artist', () => {
  assert.deepEqual(parseTabbed('\tSome title\t'), { artist: '', title: 'Some title' });
});

test('parseTabbed: empty or title-less output means nothing playing', () => {
  assert.equal(parseTabbed(''), null);
  assert.equal(parseTabbed(null), null);
  assert.equal(parseTabbed('Artist only'), null);
  assert.equal(parseTabbed('Artist\t\tAlbum'), null);
});

test('parseWindowTitle: "Artist - Title" while playing', () => {
  assert.deepEqual(parseWindowTitle('Daft Punk - Around the World'), {
    artist: 'Daft Punk',
    title: 'Around the World',
  });
});

test('parseWindowTitle: splits on the first separator only', () => {
  assert.deepEqual(parseWindowTitle('Artist - Song - Remastered 2011'), {
    artist: 'Artist',
    title: 'Song - Remastered 2011',
  });
});

test('parseWindowTitle: idle titles mean nothing playing', () => {
  for (const t of ['Spotify', 'Spotify Free', 'Spotify Premium', '', null]) {
    assert.equal(parseWindowTitle(t), null, String(t));
  }
});

test('formatText', () => {
  assert.equal(formatText(null), 'not playing');
  assert.equal(formatText({ artist: '', title: 'Episode' }), 'Episode');
  assert.equal(formatText({ artist: 'Artist', title: 'Song' }), 'Song - Artist');
});
