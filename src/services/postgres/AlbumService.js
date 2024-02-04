const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumDBToModel } = require('../../utils');
const ClientError = require('../../exceptions/ClientError');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO album VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM album WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const querySong = {
      text: 'SELECT id, title, performer FROM song WHERE album_id = $1',
      values: [id],
    };
    const allSong = await this._pool.query(querySong);

    const finalRes = {
      ...mapAlbumDBToModel(result.rows[0]),
      songs: allSong.rowCount ? allSong.rows : [],
    };

    return finalRes;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE album SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async editAlbumCoverById(id, { coverUrl }) {
    const query = {
      text: 'UPDATE album SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM album WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addAlbumLikeById(idAlbum, { owner }) {
    await this.getAlbumById(idAlbum);

    await this.checkAlbumLikeById(idAlbum, { owner });

    const id = `user_album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_like VALUES($1, $2, $3) RETURNING id',
      values: [id, idAlbum, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menambahkan like pada album');
    }

    await this._cacheService.delete(`album:${id}`);
    return result.rows[0].id;
  }

  async getAlbumLikeCountById(idAlbum) {
    let source;
    try {
      const cacheResult = await this._cacheService.get(`album:${idAlbum}`);
      const result = JSON.parse(cacheResult);
      source = 'cache';
      return {
        data: result,
        source,
      };
    } catch (error) {
      await this.getAlbumById(idAlbum);

      const query = {
        text: 'select count(*) as likes from user_album_like where album_id = $1',
        values: [idAlbum],
      };

      const result = await this._pool.query(query);

      const finalRes = {
        likes: result.rows[0]?.likes ? +result.rows[0].likes : 0,
      };

      source = 'db';

      await this._cacheService.set(`album:${idAlbum}`, JSON.stringify(finalRes));

      return {
        data: finalRes,
        source,
      };
    }
  }

  async checkAlbumLikeById(idAlbum, { owner }) {
    const query = {
      text: 'SELECT * from user_album_like WHERE album_id = $1 AND user_id = $2',
      values: [idAlbum, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      throw new ClientError('Anda telah menyukai album ini');
    }
  }

  async deleteAlbumLikeById(id, { owner }) {
    const query = {
      text: 'DELETE FROM user_album_like WHERE album_id = $1 AND user_id = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak bisa batal disukai karena belum disukai');
    }

    await this._cacheService.delete(`album:${id}`);
  }
}

module.exports = AlbumService;
