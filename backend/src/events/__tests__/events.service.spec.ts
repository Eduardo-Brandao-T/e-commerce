import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../events.service';
import { ConfigService } from '@nestjs/config';

describe('EventsService', () => {
  let service: EventsService;
  let clientMock: { emit: jest.Mock };

  beforeEach(async () => {
    clientMock = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        ConfigService,
        {
          provide: 'RABBITMQ_SERVICE',
          useValue: clientMock,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should emit event', () => {
    service.emit('TEST_EVENT' as any, { a: 1 });
    expect(clientMock.emit).toHaveBeenCalledWith('TEST_EVENT', { a: 1 });
  });
});
