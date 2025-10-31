import { CustomerRepository } from './customer.repository';
import { CreateCustomerDTO } from './createCustomer.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerService {
  constructor(private customerRepository: CustomerRepository) {}

  async getCustomerById(id: number) {
    return this.customerRepository.findCustomerById(id);
  }

  async createCustomer(data: CreateCustomerDTO) {
    return this.customerRepository.createCustomer(data);
  }

  async updateCustomer(id: number, data: Partial<CreateCustomerDTO>) {
    return this.customerRepository.updateCustomer(id, data);
  }
}
