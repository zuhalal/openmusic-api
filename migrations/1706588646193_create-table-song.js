/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.createTable('song', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    performer: {
      type: 'TEXT',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
      notNull: false,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: '"album"',
      onDelete: 'cascade',
    },
  });
  pgm.createIndex('song', 'album_id');
};

exports.down = pgm => {
  pgm.dropIndex('song', 'album_id');

  pgm.dropTable('song');
};
