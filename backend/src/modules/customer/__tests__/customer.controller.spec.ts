import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from '../customer.controller';
import { CustomerService } from '../customer.service';
import { NotFoundException } from '@nestjs/common';

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: CustomerService;

  const mockCustomerService = {
    getCustomerById: jest.fn(),
    createCustomer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [{ provide: CustomerService, useValue: mockCustomerService }],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    service = module.get<CustomerService>(CustomerService);
  });

  it('should return a customer by id', async () => {
    const customer = {
      id: 1,
      name: 'John',
      email: 'john@mail.com',
      document: '123',
    };
    mockCustomerService.getCustomerById.mockResolvedValue(customer);

    const result = await controller.getCustomerById(1);
    expect(result).toEqual(customer);
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    mockCustomerService.getCustomerById.mockResolvedValue(null);

    await expect(controller.getCustomerById(999)).rejects.toThrow(
      NotFoundException,
    );
  });
});
