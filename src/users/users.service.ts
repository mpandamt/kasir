import { Injectable } from '@nestjs/common';

export type User = {
  username: string;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'pandam',
      password: 'password',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
  async findOneById(id: number): Promise<User | undefined> {
    return this.users.find((user) => user.userId === id);
  }
}
