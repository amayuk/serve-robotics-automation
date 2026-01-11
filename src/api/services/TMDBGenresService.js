import { BaseApiClient } from '../base/BaseApiClient.js';

export class TMDBGenresService extends BaseApiClient {
  constructor(baseURL, apiKey, readAccessToken) {
    super(baseURL, apiKey, readAccessToken);
    this.basePath = '/genre';
  }

  async getMovieGenres(queryParams = {}) {
    return await this.get(`${this.basePath}/movie/list`, queryParams);
  }

  async getTVGenres(queryParams = {}) {
    return await this.get(`${this.basePath}/tv/list`, queryParams);
  }
}
