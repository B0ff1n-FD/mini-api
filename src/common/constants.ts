enum ResponseMessages {
  NOT_FOUND = 'Not found',
  BAD_REQUEST = 'Bad Request',
  CONFLICT = 'Already exist',
  UNAUTHORIZED = 'User is not authorized',
  INCORRECT_ID = 'Incorrect ID',
  FORBIDDEN = 'Access Denied',
  SERVER_ERROR = 'Internal error',
  AUTH_ERROR = 'Authorization error',
}

enum Endpoints {
  AUTH = 'auth',
  USERS = 'users',
  PRODUCTS = 'products',
  STATISTIC = 'stats',
  FILES = 'files',
}

export { ResponseMessages, Endpoints };
