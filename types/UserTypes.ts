export type UserRegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type UserLoginRequest = {
  username: string;
  password: string;
};

export type UserGetRequest = {
  userId: string;
}