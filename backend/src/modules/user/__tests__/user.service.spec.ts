import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import * as bcrypt from 'bcrypt';
import { LogService } from 'src/modules/log/log.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  let logService: LogService;
  const currentUser = { userId: 10, role: 'CUSTOMER' };

  const mockLogService = { createLog: jest.fn() };
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
        { provide: LogService, useValue: mockLogService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
    logService = module.get(LogService);
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

    const result = await service.createUser(data, currentUser);
    expect(result).toEqual(createdUser);
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(mockUserRepository.createUser).toHaveBeenCalledWith({
      ...data,
      password: 'hashed_password',
    });
  });
});
