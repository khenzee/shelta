import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsService } from './complaints.service';
import { PrismaService } from '../../database/prisma.service';

describe('ComplaintsService', () => {
  let service: ComplaintsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintsService,
        {
          provide: PrismaService,
          useValue: {
            property: {
              findFirst: jest.fn(),
            },
            complaint: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ComplaintsService>(ComplaintsService);
    prisma = module.get(PrismaService);
  });

  it('should create a complaint', async () => {
    const createDto = {
      propertyId: 'prop-1',
      category: 'PLUMBING',
      title: 'Leaky pipe',
      description: 'Pipe is leaking in bathroom',
    };
    const mockComplaint = { id: '1', ...createDto, organizationId: 'org-1' };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    prisma.complaint.create.mockResolvedValue(mockComplaint as any);

    const result = await service.create('org-1', createDto);
    expect(result).toEqual(mockComplaint);
  });
});
