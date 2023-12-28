export type UserRegisterRequest = {
  username: string;
  password: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type UserLoginRequest = {
  username: string;
  password: string;
};

export type UserGetRequest = {
  userId: string;
};

export type AuthInfo = {
  accessToken: string;
  type: string;
  expiresIn: number;
  refreshToken: string;
};
