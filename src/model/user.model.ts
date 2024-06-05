export class RegisterUserRequest {
  username: string;
  password: string;
  name: string;
  email: string;
}

export class UserResponse {
  name?: string;
  username?: string;
  email?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
