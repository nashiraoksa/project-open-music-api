const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumLikesService {
  constructor (cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike (userId, albumId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId]
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal melakukan like pada album');
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
    return result.rows[0].id;
  }

  async deleteAlbumLike (userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId]
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal membatalkan like. Id tidak ditemukan');
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
  }

  async checkIsLiked (userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }

  async getNumberOfLikes (albumId) {
    try {
      const result = await this._cacheService.get(`albumLikes:${albumId}`);

      return {
        source: 'cache',
        count: JSON.parse(result)
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId]
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new InvariantError('Tidak terdapat like pada album');
      }

      await this._cacheService.set(`albumLikes:${albumId}`, JSON.stringify(result.rows.length));

      return {
        count: result.rows.length
      };
    }
  }
}

module.exports = AlbumLikesService;
