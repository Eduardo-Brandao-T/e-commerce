import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../events.service';
import { ConfigService } from '@nestjs/config';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, ConfigService],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should emit event', () => {
    const spy = jest.spyOn((service as any).client, 'emit');
    service.emit('TEST_EVENT' as any, { a: 1 });
    expect(spy).toHaveBeenCalledWith('TEST_EVENT', { a: 1 });
  });
});
