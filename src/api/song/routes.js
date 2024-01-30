const routes = (handler) => [
  {
    method: 'POST',
    path: '/song',
    handler: handler.postSongHandler,
  },
  {
    method: 'GET',
    path: '/song',
    handler: handler.getSongsHandler,
  },
  {
    method: 'GET',
    path: '/song/{id}',
    handler: handler.getSongByIdHandler,
  },
  {
    method: 'PUT',
    path: '/song/{id}',
    handler: handler.putSongByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/song/{id}',
    handler: handler.deleteSongByIdHandler,
  },
];

module.exports = routes;