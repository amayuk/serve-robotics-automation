export class TMDBConstants {
  static HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  };

  static STATUS_CODES = {
    SUCCESS: 1,
    INVALID_SERVICE: 2,
    AUTHENTICATION_FAILED: 3,
    INVALID_FORMAT: 4,
    INVALID_PARAMETERS: 5,
    INVALID_ID: 6,
    INVALID_API_KEY: 7,
    DUPLICATE_ENTRY: 8,
    SERVICE_OFFLINE: 9,
    SUSPENDED_API_KEY: 10,
    INTERNAL_ERROR: 11,
    ITEM_UPDATED_SUCCESSFULLY: 12,
    ITEM_DELETED_SUCCESSFULLY: 13,
    AUTHENTICATION_FAILED_ALT: 14,
    FAILED: 15,
    DEVICE_DENIED: 16,
    SESSION_DENIED: 17,
    VALIDATION_FAILED: 18,
    INVALID_DATE_RANGE: 19,
    ENTRY_NOT_FOUND: 20,
    INVALID_PAGE: 22,
    INVALID_DATE: 23,
    REQUEST_TIMEOUT: 24,
    REQUEST_COUNT_EXCEEDED: 25,
    USERNAME_PASSWORD_REQUIRED: 26,
    TOO_MANY_APPEND_REQUESTS: 27,
    INVALID_TIMEZONE: 28,
    CONFIRMATION_REQUIRED: 29,
    INVALID_USERNAME_PASSWORD: 30,
    ACCOUNT_DISABLED: 31,
    EMAIL_NOT_VERIFIED: 32,
    INVALID_REQUEST_TOKEN: 33,
    RESOURCE_NOT_FOUND: 34,
  };

  static VALID_STATUS_CODES = {
    ADD_OPERATION: [
      TMDBConstants.STATUS_CODES.SUCCESS,
      TMDBConstants.STATUS_CODES.ITEM_UPDATED_SUCCESSFULLY
    ],
    REMOVE_OPERATION: [
      TMDBConstants.STATUS_CODES.SUCCESS,
      TMDBConstants.STATUS_CODES.ITEM_DELETED_SUCCESSFULLY
    ],
    GENERAL_SUCCESS: [
      TMDBConstants.STATUS_CODES.SUCCESS
    ]
  };

  static MEDIA_TYPES = {
    MOVIE: 'movie',
    TV: 'tv',
    PERSON: 'person'
  };

  static SORT_OPTIONS = {
    CREATED_AT_ASC: 'created_at.asc',
    CREATED_AT_DESC: 'created_at.desc'
  };

  static isAddOperationSuccess(statusCode) {
    return TMDBConstants.VALID_STATUS_CODES.ADD_OPERATION.includes(statusCode);
  }

  static isRemoveOperationSuccess(statusCode) {
    return TMDBConstants.VALID_STATUS_CODES.REMOVE_OPERATION.includes(statusCode);
  }

  static getStatusCodeDescription(statusCode) {
    const descriptions = {
      1: 'Success',
      12: 'Item updated successfully (already exists)',
      13: 'Item deleted successfully (already removed)',
    };
    return descriptions[statusCode] || `Unknown status code: ${statusCode}`;
  }
}
