import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from '../customer.service';
import { CustomerRepository } from '../customer.repository';

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: CustomerRepository;

  const mockCustomerRepository = {
    findCustomerById: jest.fn(),
    createCustomer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: CustomerRepository, useValue: mockCustomerRepository },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get<CustomerRepository>(CustomerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a customer by id', async () => {
    const customer = {
      id: 1,
      name: 'John',
      email: 'john@mail.com',
      document: '123',
    };
    mockCustomerRepository.findCustomerById.mockResolvedValue(customer);

    const result = await service.getCustomerById(1);
    expect(result).toEqual(customer);
    expect(mockCustomerRepository.findCustomerById).toHaveBeenCalledWith(1);
  });

  it('should create a customer', async () => {
    const data = { name: 'Jane', email: 'jane@mail.com', document: '456' };
    const createdCustomer = {
      id: 2,
      ...data,
    };
    mockCustomerRepository.createCustomer.mockResolvedValue(createdCustomer);

    const result = await service.createCustomer(data);
    expect(result).toEqual(createdCustomer);
    expect(mockCustomerRepository.createCustomer).toHaveBeenCalledWith(data);
  });
});
