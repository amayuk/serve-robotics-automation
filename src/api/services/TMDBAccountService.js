import { BaseApiClient } from '../base/BaseApiClient.js';

export class TMDBAccountService extends BaseApiClient {
  constructor(baseURL, apiKey, readAccessToken) {
    super(baseURL, apiKey, readAccessToken);
  }

  // bearer token handles auth, accountId ignored in url
  async getAccountDetails(accountId = null, queryParams = {}) {
    return await this.get('/account', queryParams);
  }

  async getFavoriteMovies(accountId, queryParams = {}) {
    return await this.get(`/account/${accountId}/favorite/movies`, queryParams);
  }

  async getFavoriteTVShows(accountId, queryParams = {}) {
    return await this.get(`/account/${accountId}/favorite/tv`, queryParams);
  }

  async getRatedMovies(accountId, queryParams = {}) {
    return await this.get(`/account/${accountId}/rated/movies`, queryParams);
  }

  async getRatedTVShows(accountId, queryParams = {}) {
    return await this.get(`/account/${accountId}/rated/tv`, queryParams);
  }

  async getWatchlistMovies(accountId, queryParams = {}) {
    return await this.get(`/account/${accountId}/watchlist/movies`, queryParams);
  }

  async getWatchlistTVShows(accountId, queryParams = {}) {
    return await this.get(`/account/${accountId}/watchlist/tv`, queryParams);
  }

  async addToFavorites(accountId, movieId, favorite = true, queryParams = {}) {
    const body = {
      media_type: 'movie',
      media_id: movieId,
      favorite: favorite
    };
    return await this.post(`/account/${accountId}/favorite`, body, queryParams);
  }

  async addTVToFavorites(accountId, tvId, favorite = true, queryParams = {}) {
    const body = {
      media_type: 'tv',
      media_id: tvId,
      favorite: favorite
    };
    return await this.post(`/account/${accountId}/favorite`, body, queryParams);
  }

  async addMovieToWatchlist(accountId, movieId, watchlist = true, queryParams = {}) {
    const body = {
      media_type: 'movie',
      media_id: movieId,
      watchlist: watchlist
    };
    return await this.post(`/account/${accountId}/watchlist`, body, queryParams);
  }

  async addTVShowToWatchlist(accountId, tvId, watchlist = true, queryParams = {}) {
    const body = {
      media_type: 'tv',
      media_id: tvId,
      watchlist: watchlist
    };
    return await this.post(`/account/${accountId}/watchlist`, body, queryParams);
  }

  async addToWatchlist(accountId, mediaId, mediaType = 'movie', watchlist = true, queryParams = {}) {
    const body = {
      media_type: mediaType,
      media_id: mediaId,
      watchlist: watchlist
    };
    return await this.post(`/account/${accountId}/watchlist`, body, queryParams);
  }

  async rateMovie(accountId = null, movieId, rating, queryParams = {}) {
    const body = { value: rating };
    return await this.post(`/movie/${movieId}/rating`, body, queryParams);
  }

  async deleteMovieRating(accountId = null, movieId, queryParams = {}) {
    return await this.delete(`/movie/${movieId}/rating`, queryParams);
  }
}
