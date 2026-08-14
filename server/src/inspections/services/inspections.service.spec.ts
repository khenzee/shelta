import { Test, TestingModule } from '@nestjs/testing';
import { InspectionsService } from './inspections.service';
import { PrismaService } from '../../database/prisma.service';
import type { CreateInspectionDto } from '../dtos/create-inspection.dto';

describe('InspectionsService', () => {
  let service: InspectionsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InspectionsService,
        {
          provide: PrismaService,
          useValue: {
            property: {
              findFirst: jest.fn(),
            },
            user: {
              findFirst: jest.fn(),
            },
            inspection: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<InspectionsService>(InspectionsService);
    prisma = module.get(PrismaService);
  });

  it('should create an inspection', async () => {
    const createDto: CreateInspectionDto = {
      propertyId: 'prop-1',
      type: 'PERIODIC',
      inspectorId: 'user-1',
      scheduledDate: '2024-01-01',
    };
    const mockInspection = { id: '1', ...createDto, organizationId: 'org-1' };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    prisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    prisma.inspection.create.mockResolvedValue(mockInspection as any);

    const result = await service.create('org-1', createDto);
    expect(result).toEqual(mockInspection);
  });
});
