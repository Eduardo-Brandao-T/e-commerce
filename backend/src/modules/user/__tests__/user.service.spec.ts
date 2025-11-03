import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  const mockUserRepository = {
    findUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserByDocument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user by id', async () => {
    const user = {
      id: 1,
      name: 'John',
      email: 'john@mail.com',
      document: '123',
    };
    mockUserRepository.findUserById.mockResolvedValue(user);

    const result = await service.getUserById(1);
    expect(result).toEqual(user);
    expect(mockUserRepository.findUserById).toHaveBeenCalledWith(1);
  });

  it('should create a user', async () => {
    const data = {
      name: 'Jane',
      email: 'jane@mail.com',
      document: '456',
      password: 'password',
    };
    const createdUser = {
      id: 2,
      ...data,
      password: 'hashed_password',
    };
    mockUserRepository.createUser.mockResolvedValue(createdUser);

    const result = await service.createUser(data);
    expect(result).toEqual(createdUser);
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(mockUserRepository.createUser).toHaveBeenCalledWith({
      ...data,
      password: 'hashed_password',
    });
  });
});
