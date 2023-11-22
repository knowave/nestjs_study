export const USER_EXCEPTION = {
  USER_NOT_EXIST_TOKEN: {
    code: 'USER_NOT_EXIST_TOKEN',
    message: 'Token이 존재하지 않습니다.',
  },
  USER_NOT_EXIST_REFRESH_TOKEN: {
    code: 'USER_NOT_EXIST_REFRESH_TOKEN',
    message: 'RefreshToken이 존재하지 않습니다.',
  },
  EXIST_USER: {
    code: 'EXIST_USER',
    message: '이미 존재하는 사용자입니다.',
  },
  NOT_FOUND_USER: {
    code: 'NOT_FOUND_USER',
    message: '존재하는 사용자가 없습니다.',
  },
};

export const AUTH_EXCEPTION = {
  INVALID_TOKEN: {
    code: 'AUTH_INVALID_TOKEN',
    message: '유효하지 않은 토큰입니다.',
  },
  JWT_EXPIRED: {
    code: 'AUTH_JWT_EXPIRED',
    message: '토큰이 만료되었습니다.',
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message: '잘못된 경로입니다.',
  },
};

export const JWT_EXCEPTION = {
  JWT_NOT_REISSUED: {
    code: 'JWT_NOT_REISSUED',
    message: '재발급을 실패했습니다.',
  },
};
