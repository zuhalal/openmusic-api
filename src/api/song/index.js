const SongsHandler = require('./handler');
const routes = require('./routes');
 
module.exports = {
  name: 'song',
  version: '1.0.0',
  register: async (server, { service }) => {
    const songHandler = new SongsHandler(service);
    server.route(routes(songHandler));
  },
};