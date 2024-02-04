/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_song', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"playlist"',
      onDelete: 'cascade',
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"song"',
      onDelete: 'cascade',
    },
  });

  pgm.createIndex('playlist_song', 'playlist_id');
  pgm.createIndex('playlist_song', 'song_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('playlist_song', 'playlist_id');
  pgm.dropIndex('playlist_song', 'song_id');

  pgm.dropTable('playlist_song');
};
