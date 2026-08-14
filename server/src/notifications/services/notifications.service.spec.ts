import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../database/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              findMany: jest.fn(),
              count: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);
  });

  it('should list notifications', async () => {
    const mockNotifications = [{ id: '1', title: 'Test' }];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    prisma.notification.findMany.mockResolvedValue(mockNotifications as any);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    prisma.notification.count.mockResolvedValue(1);

    const result = await service.list('user-1');
    expect(result.items).toEqual(mockNotifications);
    expect(result.total).toBe(1);
  });
});
