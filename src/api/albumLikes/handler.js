const ClientError = require('../../exceptions/ClientError');

class AlbumLikesHandler {
  constructor (service, albumsService) {
    this._service = service;
    this._albumsService = albumsService;

    this.postAlbumLikesHandler = this.postAlbumLikesHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumLikesHandler (request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._albumsService.getAlbumById(albumId);

      const isLiked = await this._service.checkIsLiked(userId, albumId);

      if (!isLiked) {
        await this._service.addAlbumLike(userId, albumId);

        const response = h.response({
          status: 'success',
          message: 'Berhasil melakukan  pada album'
        });
        response.code(201);
        return response;
      }

      await this._service.deleteAlbumLike(userId, albumId);

      const response = h.response({
        status: 'success',
        message: 'Berhasil menghapus like pada album'
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumLikesHandler (request, h) {
    try {
      const { id: albumId } = request.params;

      const data = await this._service.getNumberOfLikes(albumId);
      const likes = data.count;

      const response = h.response({
        status: 'success',
        data: {
          likes
        }
      });
      response.header('X-Data-Source', data.source);
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AlbumLikesHandler;
