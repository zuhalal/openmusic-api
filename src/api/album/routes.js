const routes = (handler) => [
  {
    method: 'POST',
    path: '/album',
    handler: handler.postAlbumHandler,
  },
  {
    method: 'GET',
    path: '/album/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/album/{id}',
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/album/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
];

module.exports = routes;