/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('album', {
    cover_url: {
      type: 'TEXT',
      notNull: false,
      default: null,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('album', 'cover_url');
};
