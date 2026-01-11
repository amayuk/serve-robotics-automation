export class TestDataProvider {
  static MOVIES = {
    THE_SHAWSHANK_REDEMPTION: 278,
    THE_GODFATHER: 238,
    THE_DARK_KNIGHT: 155,
    INCEPTION: 27205,
    PULP_FICTION: 680,
    FORREST_GUMP: 13,
    THE_MATRIX: 603,
    INVALID_ID: 999999999
  };

  static ACCOUNTS = {
    TEST_ACCOUNT: 22644815,
    INVALID_ACCOUNT: 999999999
  };

  static LISTS = {
    TEST_LIST: 5861,
  };

  static SEARCH_QUERIES = {
    POPULAR_MOVIE: 'Inception',
    POPULAR_ACTOR: 'Tom Hanks',
    POPULAR_TV_SHOW: 'Breaking Bad',
    EMPTY_QUERY: '',
    SPECIAL_CHARS: '@#$%^&*()',
    VERY_LONG_QUERY: 'a'.repeat(500)
  };

  static GENRES = {
    ACTION: 28,
    ADVENTURE: 12,
    ANIMATION: 16,
    COMEDY: 35,
    CRIME: 80,
    DOCUMENTARY: 99,
    DRAMA: 18,
    FAMILY: 10751,
    FANTASY: 14,
    HORROR: 27,
    SCIENCE_FICTION: 878,
    THRILLER: 53
  };

  static QUERY_PARAMS = {
    LANGUAGE: {
      ENGLISH: 'en-US',
      SPANISH: 'es-ES',
      FRENCH: 'fr-FR',
      INVALID: 'xx-XX'
    },
    PAGE: {
      FIRST: 1,
      SECOND: 2,
      LARGE: 500,
      ZERO: 0,
      NEGATIVE: -1
    },
    REGION: {
      US: 'US',
      GB: 'GB',
      INVALID: 'ZZ'
    }
  };

  static HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
  };

  static SAUCE_DEMO = {
    USERS: {
      STANDARD: {
        username: process.env.STANDARD_USER || 'standard_user',
        password: process.env.STANDARD_PASSWORD || 'secret_sauce'
      },
      LOCKED_OUT: {
        username: 'locked_out_user',
        password: 'secret_sauce'
      },
      PROBLEM: {
        username: 'problem_user',
        password: 'secret_sauce'
      },
      PERFORMANCE_GLITCH: {
        username: 'performance_glitch_user',
        password: 'secret_sauce'
      },
      INVALID: {
        username: 'invalid_user',
        password: 'invalid_password'
      }
    },
    PRODUCTS: {
      FLEECE_JACKET: {
        name: 'Sauce Labs Fleece Jacket',
        price: 49.99
      },
      ONESIE: {
        name: 'Sauce Labs Onesie',
        price: 7.99
      },
      BACKPACK: {
        name: 'Sauce Labs Backpack',
        price: 29.99
      }
    },
    SORT_OPTIONS: {
      NAME_ASC: 'az',
      NAME_DESC: 'za',
      PRICE_LOW_HIGH: 'lohi',
      PRICE_HIGH_LOW: 'hilo'
    }
  };

  static getRandomMovieId() {
    const movieIds = Object.values(this.MOVIES).filter(id => id !== this.MOVIES.INVALID_ID);
    return movieIds[Math.floor(Math.random() * movieIds.length)];
  }

  static getRandomSearchQuery() {
    const queries = [
      this.SEARCH_QUERIES.POPULAR_MOVIE,
      this.SEARCH_QUERIES.POPULAR_ACTOR,
      this.SEARCH_QUERIES.POPULAR_TV_SHOW
    ];
    return queries[Math.floor(Math.random() * queries.length)];
  }
}
