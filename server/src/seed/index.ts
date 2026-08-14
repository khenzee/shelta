import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Shelta Organization',
      legalName: 'Shelta Real Estate Management',
      email: 'admin@shelta.local',
      phone: '+234801234567',
      address: '123 Victoria Island, Lagos',
      timezone: 'Africa/Lagos',
      currency: 'NGN',
      locale: 'en-NG',
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: org.id,
        email: 'admin@shelta.local',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      email: 'admin@shelta.local',
      passwordHash,
      name: 'Super Admin',
      type: 'AGENCY',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  const superAdminRole = await prisma.role.upsert({
    where: {
      organizationId_name: { organizationId: org.id, name: 'Super Admin' },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Super Admin',
      description: 'Full system access',
      isSystem: true,
    },
  });

  const permissions = [
    { resource: 'properties', action: 'view' },
    { resource: 'properties', action: 'create' },
    { resource: 'properties', action: 'edit' },
    { resource: 'properties', action: 'delete' },
    { resource: 'units', action: 'view' },
    { resource: 'units', action: 'create' },
    { resource: 'units', action: 'edit' },
    { resource: 'units', action: 'delete' },
    { resource: 'landlords', action: 'view' },
    { resource: 'landlords', action: 'create' },
    { resource: 'landlords', action: 'edit' },
    { resource: 'landlords', action: 'archive' },
    { resource: 'tenants', action: 'view' },
    { resource: 'tenants', action: 'create' },
    { resource: 'tenants', action: 'edit' },
    { resource: 'tenants', action: 'delete' },
    { resource: 'leases', action: 'view' },
    { resource: 'leases', action: 'create' },
    { resource: 'leases', action: 'edit' },
    { resource: 'leases', action: 'terminate' },
    { resource: 'leases', action: 'renew' },
    { resource: 'transactions', action: 'view' },
    { resource: 'transactions', action: 'create' },
    { resource: 'transactions', action: 'edit' },
    { resource: 'transactions', action: 'void' },
    { resource: 'rent', action: 'view' },
    { resource: 'rent', action: 'record' },
    { resource: 'rent', action: 'reconcile' },
    { resource: 'reports', action: 'view' },
    { resource: 'reports', action: 'export' },
    { resource: 'documents', action: 'view' },
    { resource: 'documents', action: 'upload' },
    { resource: 'documents', action: 'send' },
    { resource: 'documents', action: 'delete' },
    { resource: 'maintenance', action: 'view' },
    { resource: 'maintenance', action: 'create' },
    { resource: 'maintenance', action: 'assign' },
    { resource: 'maintenance', action: 'edit' },
    { resource: 'maintenance', action: 'verify' },
    { resource: 'employees', action: 'view' },
    { resource: 'employees', action: 'manage' },
    { resource: 'audit', action: 'view' },
  ];

  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: {
        organizationId_resource_action: {
          organizationId: org.id,
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: {},
      create: { organizationId: org.id, ...perm },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: permission.id },
    });
  }

  await prisma.employee.upsert({
    where: { userId: superAdmin.id },
    update: { roleId: superAdminRole.id },
    create: {
      organizationId: org.id,
      userId: superAdmin.id,
      roleId: superAdminRole.id,
      status: 'ACTIVE',
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
