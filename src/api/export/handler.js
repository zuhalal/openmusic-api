class ExportsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    const { id } = request.params;
    this._validator.validateExportNotesPayload(request.payload);

    const message = {
      targetEmail: request.payload.targetEmail,
      playlistId: id,
    };

    const owner = request.auth.credentials.id;

    await this._service.sendMessage('export:playlist', JSON.stringify(message), owner);

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
