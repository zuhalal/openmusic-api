require('dotenv').config();
const Jwt = require('@hapi/jwt');
const Hapi = require('@hapi/hapi');
const album = require('./api/album');
const song = require('./api/song');
const user = require('./api/user');

const ClientError = require('./exceptions/ClientError');

const AlbumService = require('./services/postgres/AlbumService');
const SongService = require('./services/postgres/SongService');

const AlbumsValidator = require('./validator/album');
const SongsValidator = require('./validator/song');

// users
const UserService = require('./services/postgres/UserService');
const UserValidator = require('./validator/user');

// users
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlist');

// authentications
const authentications = require('./api/authentication');
const AuthenticationService = require('./services/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentication');
const playlist = require('./api/playlist');

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();
  const usersService = new UserService();
  const authenticationsService = new AuthenticationService();
  const playlistService = new PlaylistService(songService);

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

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: album,
      options: {
        service: albumService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: song,
      options: {
        service: songService,
        validator: SongsValidator,
      },
    },
    {
      plugin: user,
      options: {
        service: usersService,
        validator: UserValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
