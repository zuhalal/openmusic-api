const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor(songService) {
    this._pool = new Pool();
    this._songService = songService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async addPlaylistToSong({ playlistId, songId, owner }) {
    const id = `playlist_song-${nanoid(16)}`;

    const song = await this._songService.getSongById(songId);

    if (!song?.id) {
      throw new InvariantError('Lagu tidak ditemukan');
    }

    await this.verifyPlaylistOwner(playlistId, owner);

    const query = {
      text: 'INSERT INTO playlist_song VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows?.[0]?.id) {
      throw new InvariantError('Lagu gagal ditambahkan ke Playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylists({ owner }) {
    const query = {
      text: 'select p.id, p.name, u.username from playlist p, public.user u WHERE u.id=p.owner AND owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById({ id }) {
    const query = {
      text: 'SELECT p.id, p.name, u.username FROM playlist p, public.user u WHERE p.id = $1 AND u.id=p.owner',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async getPlaylistByIdAndOwner({ id, owner }) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1 AND owner = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async getSongByPlaylistId({ id, owner }) {
    await this.verifyPlaylistOwner(id, owner);

    let result = await this.getPlaylistById({ id });

    result = {
      id: result.id,
      name: result.name,
      username: result.username,
    };

    const querySong = {
      text: 'SELECT s.id, s.title, s.performer from playlist_song ps, song s WHERE s.id=ps.song_id AND ps.playlist_id=$1',
      values: [id],
    };

    const resultSongInPlaylist = await this._pool.query(querySong);

    return {
      ...result,
      songs: resultSongInPlaylist.rows,
    };
  }

  async deleteSongInPlaylistById({ playlistId, songId, owner }) {
    const song = await this._songService.getSongById(songId);

    if (!song?.id) {
      throw new InvariantError('Lagu tidak ditemukan');
    }

    await this.verifyPlaylistOwner(playlistId, owner);

    const query = {
      text: 'DELETE FROM playlist_song WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu di dalam Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async deletePlaylistById({ id, owner }) {
    await this.verifyPlaylistOwner(id, owner);

    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Resource yang Anda minta tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistService;
