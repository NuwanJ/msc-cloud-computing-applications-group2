export type UserRegisterRequest = {
  username: string;
  password: string;
  name: string;
  dob: Date;
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

export type UserAttribute = {
  Name: string;
  Value: string | number;
};
export type UserProfile = {
  username: string;
  email: string;
  status: "CONFIRMED" | string;
  enabled: boolean;
  attributes: UserAttribute[];
  createdAt: Date;
  modifiedAt: Date;
};
