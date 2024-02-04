/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('user_album_like', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"album"',
      onDelete: 'cascade',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"user"',
      onDelete: 'cascade',
    },
  });

  pgm.createIndex('user_album_like', 'user_id');
  pgm.createIndex('user_album_like', 'album_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('user_album_like', 'album_id');
  pgm.dropIndex('user_album_like', 'user_id');

  pgm.dropTable('user_album_like');
};
