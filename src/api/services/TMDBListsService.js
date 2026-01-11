import { BaseApiClient } from '../base/BaseApiClient.js';

export class TMDBListsService extends BaseApiClient {
  constructor(baseURL, apiKey, readAccessToken) {
    super(baseURL, apiKey, readAccessToken);
  }

  async addMovieToList(listId, mediaId, queryParams = {}) {
    const body = { media_id: mediaId };
    return await this.post(`/list/${listId}/add_item`, body, queryParams);
  }

  async removeMovieFromList(listId, mediaId, queryParams = {}) {
    const body = { media_id: mediaId };
    return await this.post(`/list/${listId}/remove_item`, body, queryParams);
  }

  async clearList(listId, queryParams = {}) {
    const params = { confirm: false, ...queryParams };
    return await this.post(`/list/${listId}/clear`, {}, params);
  }

  async getListDetails(listId, queryParams = {}) {
    return await this.get(`/list/${listId}`, queryParams);
  }

  async createList(name, description = '', language = 'en', queryParams = {}) {
    const body = { name, description, language };
    return await this.post('/list', body, queryParams);
  }

  async deleteList(listId, queryParams = {}) {
    return await this.delete(`/list/${listId}`, queryParams);
  }

  async checkMovieInList(listId, movieId) {
    return await this.get(`/list/${listId}/item_status`, { movie_id: movieId });
  }
}
