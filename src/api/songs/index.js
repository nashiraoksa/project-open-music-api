const SongsHanlder = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songsHandler = new SongsHanlder(service, validator);
    server.route(routes(songsHandler));
  }
};
