class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.getPlaylistsSongHandler = this.getPlaylistsSongHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.deleteSongInPlaylistByIdHandler = this.deleteSongInPlaylistByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, owner });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { songId } = request.payload;
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._service.addPlaylistToSong({ playlist_id: id, song_id: songId, owner });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke Playlist',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;

    const playlists = await this._service.getPlaylists({ owner });
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async getPlaylistsSongHandler(request) {
    const { id: owner } = request.auth.credentials;
    const { id } = request.params;

    const playlist = await this._service.getSongByPlaylistId({ id, owner });
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongInPlaylistByIdHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload || {};
    const { id: owner } = request.auth.credentials;


    await this._service.deleteSongInPlaylistById({ playlistId, songId, owner });
    return {
      status: 'success',
      message: 'Lagu dalam Playlist berhasil dihapus',
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id: owner } = request.auth.credentials;

    const { id } = request.params;
    await this._service.deletePlaylistById({ id, owner });
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
