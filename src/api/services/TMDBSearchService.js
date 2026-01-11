import { BaseApiClient } from '../base/BaseApiClient.js';

export class TMDBSearchService extends BaseApiClient {
  constructor(baseURL, apiKey, readAccessToken) {
    super(baseURL, apiKey, readAccessToken);
    this.basePath = '/search';
  }

  async searchMovies(query, queryParams = {}) {
    return await this.get(`${this.basePath}/movie`, { query, ...queryParams });
  }

  async searchTVShows(query, queryParams = {}) {
    return await this.get(`${this.basePath}/tv`, { query, ...queryParams });
  }

  async searchPeople(query, queryParams = {}) {
    return await this.get(`${this.basePath}/person`, { query, ...queryParams });
  }

  async multiSearch(query, queryParams = {}) {
    return await this.get(`${this.basePath}/multi`, { query, ...queryParams });
  }

  async searchCollections(query, queryParams = {}) {
    return await this.get(`${this.basePath}/collection`, { query, ...queryParams });
  }

  async searchKeywords(query, queryParams = {}) {
    return await this.get(`${this.basePath}/keyword`, { query, ...queryParams });
  }

  async searchCompanies(query, queryParams = {}) {
    return await this.get(`${this.basePath}/company`, { query, ...queryParams });
  }
}
