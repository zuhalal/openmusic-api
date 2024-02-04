/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlist', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"user"',
      onDelete: 'cascade',
    }
  });

  pgm.createIndex('playlist', 'owner');
};

exports.down = (pgm) => {
  pgm.dropIndex('playlist', 'owner');

  pgm.dropTable('playlist');
};
