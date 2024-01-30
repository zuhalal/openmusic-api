require('dotenv').config();
const Hapi = require('@hapi/hapi');
const album = require('./api/album');
const song = require('./api/song');
const ClientError = require('./exceptions/ClientError');

const AlbumService = require('./services/postgres/AlbumService');
const SongService = require('./services/postgres/SongService');

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
  
    // penanganan client error secara internal.
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
      
    return h.continue;
  });

  await server.register([
    {
      plugin: album,
      options: {
        service: albumService,
      },
    },
    {
      plugin: song,
      options: {
        service: songService,
      },
    }
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();