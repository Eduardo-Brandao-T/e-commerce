import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { Role } from '@prisma/client';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;
  const currentUser = { userId: 10, role: 'CUSTOMER' };

  const mockUser = {
    id: 1,
    name: 'Eduardo',
    email: 'eduardo@example.com',
    document: '9999999999',
    password: 'hashedpassword',
    role: Role.CUSTOMER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getUserById', () => {
    it('deve retornar um usuário existente', async () => {
      userService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(1);

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      userService.getUserById.mockResolvedValue(null);

      await expect(controller.getUserById(999)).rejects.toThrow(
        new NotFoundException(MESSAGES.CUSTOMER.NOT_FOUND),
      );
    });
  });

  describe('createUser', () => {
    it('deve criar um novo usuário', async () => {
      const dto = {
        name: 'Novo',
        email: 'novo@example.com',
        password: '123',
        document: '8888888888',
      };
      const createdUser = { ...mockUser, ...dto, id: 2 };
      userService.createUser.mockResolvedValue(createdUser);

      const result = await controller.createUser(dto, currentUser);

      expect(userService.createUser).toHaveBeenCalledWith(dto, currentUser);
      expect(result).toEqual(createdUser);
    });
  });

  describe('updateUser', () => {
    it('deve atualizar um usuário existente', async () => {
      const dto = { name: 'Atualizado' };
      const updatedUser = { ...mockUser, ...dto };
      userService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateUser(1, dto, currentUser);

      expect(userService.updateUser).toHaveBeenCalledWith(1, dto, currentUser);
      expect(result).toEqual(updatedUser);
    });

    it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
      userService.updateUser.mockResolvedValue(null);

      await expect(controller.updateUser(999, {}, currentUser)).rejects.toThrow(
        new NotFoundException(MESSAGES.CUSTOMER.NOT_FOUND),
      );
    });
  });
});
