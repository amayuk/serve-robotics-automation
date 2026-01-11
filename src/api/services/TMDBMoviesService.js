import { BaseApiClient } from '../base/BaseApiClient.js';

export class TMDBMoviesService extends BaseApiClient {
  constructor(baseURL, apiKey, readAccessToken) {
    super(baseURL, apiKey, readAccessToken);
    this.basePath = '/movie';
  }

  async getMovieDetails(movieId, queryParams = {}) {
    return await this.get(`${this.basePath}/${movieId}`, queryParams);
  }

  async getPopularMovies(queryParams = {}) {
    return await this.get(`${this.basePath}/popular`, queryParams);
  }

  async getTopRatedMovies(queryParams = {}) {
    return await this.get(`${this.basePath}/top_rated`, queryParams);
  }

  async getUpcomingMovies(queryParams = {}) {
    return await this.get(`${this.basePath}/upcoming`, queryParams);
  }

  async getNowPlayingMovies(queryParams = {}) {
    return await this.get(`${this.basePath}/now_playing`, queryParams);
  }

  async getMovieCredits(movieId, queryParams = {}) {
    return await this.get(`${this.basePath}/${movieId}/credits`, queryParams);
  }

  async getMovieReviews(movieId, queryParams = {}) {
    return await this.get(`${this.basePath}/${movieId}/reviews`, queryParams);
  }

  async getSimilarMovies(movieId, queryParams = {}) {
    return await this.get(`${this.basePath}/${movieId}/similar`, queryParams);
  }

  async getMovieRecommendations(movieId, queryParams = {}) {
    return await this.get(`${this.basePath}/${movieId}/recommendations`, queryParams);
  }

  async getMovieVideos(movieId, queryParams = {}) {
    return await this.get(`${this.basePath}/${movieId}/videos`, queryParams);
  }

  async getMovieImages(movieId, queryParams = {}) {
    return await this.get(`${this.basePath}/${movieId}/images`, queryParams);
  }

  async getMovieReleaseDates(movieId) {
    return await this.get(`${this.basePath}/${movieId}/release_dates`);
  }
}
