import { expect } from '@playwright/test';

export class ApiTestHelpers {
  static validateResponseStatus(response, expectedStatus) {
    expect(response.status).toBe(expectedStatus);
  }

  static validateRequiredFields(data, requiredFields) {
    requiredFields.forEach(field => {
      expect(data).toHaveProperty(field);
      expect(data[field]).toBeDefined();
    });
  }

  static validatePaginationStructure(data) {
    expect(data).toHaveProperty('page');
    expect(data).toHaveProperty('total_pages');
    expect(data).toHaveProperty('total_results');
    expect(data.page).toBeGreaterThanOrEqual(1);
    expect(data.total_pages).toBeGreaterThanOrEqual(0);
    expect(data.total_results).toBeGreaterThanOrEqual(0);
  }

  static validateNonEmptyArray(array, fieldName = 'results') {
    expect(array).toBeDefined();
    expect(Array.isArray(array)).toBe(true);
    expect(array.length).toBeGreaterThan(0);
  }

  static validateMovieStructure(movie) {
    const requiredFields = [
      'id', 'title', 'overview', 'release_date',
      'vote_average', 'vote_count', 'popularity'
    ];
    this.validateRequiredFields(movie, requiredFields);
    
    expect(typeof movie.id).toBe('number');
    expect(typeof movie.title).toBe('string');
    expect(typeof movie.vote_average).toBe('number');
    expect(movie.vote_average).toBeGreaterThanOrEqual(0);
    expect(movie.vote_average).toBeLessThanOrEqual(10);
  }

  static validateGenreStructure(genre) {
    expect(genre).toHaveProperty('id');
    expect(genre).toHaveProperty('name');
    expect(typeof genre.id).toBe('number');
    expect(typeof genre.name).toBe('string');
    expect(genre.name.length).toBeGreaterThan(0);
  }

  static validateCreditsStructure(credits) {
    expect(credits).toHaveProperty('cast');
    expect(credits).toHaveProperty('crew');
    expect(Array.isArray(credits.cast)).toBe(true);
    expect(Array.isArray(credits.crew)).toBe(true);
  }

  static validateCastMemberStructure(castMember) {
    const requiredFields = ['id', 'name', 'character', 'order'];
    this.validateRequiredFields(castMember, requiredFields);
    expect(typeof castMember.order).toBe('number');
  }

  static validateSearchResultsStructure(searchResults) {
    this.validatePaginationStructure(searchResults);
    expect(searchResults).toHaveProperty('results');
    expect(Array.isArray(searchResults.results)).toBe(true);
  }

  static validateErrorResponse(data) {
    expect(data).toHaveProperty('status_message');
    expect(data).toHaveProperty('status_code');
    expect(typeof data.status_message).toBe('string');
    expect(typeof data.status_code).toBe('number');
  }

  static validateResponseTime(startTime, maxResponseTime = 5000) {
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(maxResponseTime);
  }

  static validateNonEmptyString(value, fieldName) {
    expect(value).toBeDefined();
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  }

  static validateDateFormat(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(dateString).toMatch(dateRegex);
  }

  static validateArrayItems(array, validationFunction) {
    expect(Array.isArray(array)).toBe(true);
    array.forEach(item => validationFunction(item));
  }

  static validateAccountStructure(account) {
    const requiredFields = ['id', 'name', 'username', 'include_adult'];
    this.validateRequiredFields(account, requiredFields);
    
    expect(typeof account.id).toBe('number');
    expect(typeof account.username).toBe('string');
    expect(typeof account.include_adult).toBe('boolean');
    
    if (account.avatar) {
      expect(account.avatar).toHaveProperty('gravatar');
      expect(account.avatar).toHaveProperty('tmdb');
    }
    
    if (account.iso_639_1) {
      expect(typeof account.iso_639_1).toBe('string');
      expect(account.iso_639_1.length).toBe(2);
    }
    if (account.iso_3166_1) {
      expect(typeof account.iso_3166_1).toBe('string');
      expect(account.iso_3166_1.length).toBe(2);
    }
  }

  static validateNumericRange(value, min, max) {
    expect(typeof value).toBe('number');
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  }
}
