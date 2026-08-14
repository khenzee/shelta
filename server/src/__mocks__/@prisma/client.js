const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
};

module.exports = {
  PrismaClient: jest.fn(() => mockPrismaClient),
};
