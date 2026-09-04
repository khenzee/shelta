import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

type UnitPlan = {
  no: string;
  type: string;
  beds: number;
  baths: number;
  rent: number;
  occupied: boolean;
};

type PropPlan = {
  code: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  units: UnitPlan[];
};

type LandlordPlan = {
  code: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  props: PropPlan[];
};

const unitConfig = [
  { type: 'STUDIO', beds: 0, baths: 1, rent: 250_000 },
  { type: '1 BEDROOM', beds: 1, baths: 1, rent: 400_000 },
  { type: '2 BEDROOM', beds: 2, baths: 2, rent: 650_000 },
  { type: '3 BEDROOM', beds: 3, baths: 3, rent: 1_000_000 },
  { type: '4 BEDROOM', beds: 4, baths: 4, rent: 1_500_000 },
] as const;

const tenants = [
  'Chinedu Okafor',
  'Blessing Adams',
  'Ibrahim Musa',
  'Yetunde Alabi',
  'Samuel Johnson',
  'Patience Eze',
  'Funmilayo Adekunle',
  'Kelechi Nwankwo',
  'Omotola Ajayi',
  'Adewale Ogunleye',
  'Halima Suleiman',
  'Victor Osei',
  'Ronke Fashola',
  'Ifeanyi Uche',
  'Rashidat Balogun',
  'Emeka Obi',
  'Esther Bassey',
  'Damilare Cole',
  'Segun Adewale',
  'Zainab Yusuf',
  'Tobiloba Adeyemo',
  'Femi Adeyemi',
  'Chiamaka Uba',
  'Kolawole Ajayi',
  'Mariam Abubakar',
  'Ikenna Umeh',
  'Simisola Osho',
  'Babatunde Lawal',
  'Amina Sani',
  'Tayo Adebayo',
  'Chukwudi Agbogu',
  'Kemi Oluwole',
  'Yusuf Ibrahim',
  'Adaeze Nwosu',
];

const landlords: LandlordPlan[] = [
  {
    code: 'LL-0001',
    name: 'Folake Adeyemi',
    company: 'Adeyemi Properties',
    email: 'folake.adeyemi@example.com',
    phone: '+2348012345001',
    address: '12 Isaac John Street, Ikeja, Lagos',
    props: [
      {
        code: 'PR-0001',
        name: 'Greenview Towers',
        type: 'APARTMENT',
        address: '12 Admiralty Way, Lekki Phase 1',
        city: 'Lekki',
        state: 'Lagos',
        units: [
          {
            no: '1A',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: '1B',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: '2A',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: true,
          },
          {
            no: '2B',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: false,
          },
        ],
      },
      {
        code: 'PR-0002',
        name: 'Maple Court Apartments',
        type: 'APARTMENT',
        address: '45 Isaac John Street, Ikeja',
        city: 'Ikeja',
        state: 'Lagos',
        units: [
          {
            no: 'A1',
            type: 'STUDIO',
            beds: 0,
            baths: 1,
            rent: 250_000,
            occupied: true,
          },
          {
            no: 'A2',
            type: 'STUDIO',
            beds: 0,
            baths: 1,
            rent: 250_000,
            occupied: false,
          },
          {
            no: 'B1',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: true,
          },
          {
            no: 'B2',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: true,
          },
          {
            no: 'C1',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: false,
          },
        ],
      },
    ],
  },
  {
    code: 'LL-0002',
    name: 'Chukwuemeka Okafor',
    company: 'Okafor Realty',
    email: 'chuka.okafor@example.com',
    phone: '+2348023456002',
    address: '8 Bourdillon Road, Ikoyi, Lagos',
    props: [
      {
        code: 'PR-0003',
        name: 'Okafor Residences',
        type: 'DUPLEX',
        address: '8 Bourdillon Road, Ikoyi',
        city: 'Ikoyi',
        state: 'Lagos',
        units: [
          {
            no: 'D1',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: true,
          },
          {
            no: 'D2',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: true,
          },
          {
            no: 'D3',
            type: '4 BEDROOM',
            beds: 4,
            baths: 4,
            rent: 1_500_000,
            occupied: true,
          },
          {
            no: 'D4',
            type: '4 BEDROOM',
            beds: 4,
            baths: 4,
            rent: 1_500_000,
            occupied: false,
          },
          {
            no: 'D5',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: false,
          },
        ],
      },
      {
        code: 'PR-0004',
        name: 'Victoria Crest',
        type: 'APARTMENT',
        address: '3 Akin Adesola Street, Victoria Island',
        city: 'Victoria Island',
        state: 'Lagos',
        units: [
          {
            no: '1A',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: true,
          },
          {
            no: '1B',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: true,
          },
          {
            no: '2A',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: '2B',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: false,
          },
        ],
      },
      {
        code: 'PR-0005',
        name: 'Parkview Terrace',
        type: 'TERRACE',
        address: '21 Yaba Road, Yaba',
        city: 'Yaba',
        state: 'Lagos',
        units: [
          {
            no: 'T1',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: 'T2',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: false,
          },
          {
            no: 'T3',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: false,
          },
        ],
      },
    ],
  },
  {
    code: 'LL-0003',
    name: 'Aisha Bello',
    company: 'Bello Estates',
    email: 'aisha.bello@example.com',
    phone: '+2348034567003',
    address: '9 Bayo Osibelu Street, Lekki Phase 1, Lagos',
    props: [
      {
        code: 'PR-0006',
        name: 'Bello Garden Estate',
        type: 'TERRACE',
        address: '9 Bayo Osibelu Street, Lekki Phase 1',
        city: 'Lekki',
        state: 'Lagos',
        units: [
          {
            no: 'G1',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: 'G2',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: 'G3',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: 'G4',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: true,
          },
          {
            no: 'G5',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: false,
          },
          {
            no: 'G6',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: false,
          },
        ],
      },
    ],
  },
  {
    code: 'LL-0004',
    name: 'Tunde Balogun',
    company: 'Balogun Homes',
    email: 'tunde.balogun@example.com',
    phone: '+2348045678004',
    address: '7 Bode Thomas Street, Surulere, Lagos',
    props: [
      {
        code: 'PR-0007',
        name: 'Balogun Court',
        type: 'APARTMENT',
        address: '7 Bode Thomas Street, Surulere',
        city: 'Surulere',
        state: 'Lagos',
        units: [
          {
            no: '1A',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: true,
          },
          {
            no: '2A',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: true,
          },
          {
            no: '3A',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: '3B',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: false,
          },
        ],
      },
      {
        code: 'PR-0008',
        name: 'Osborne Lodge',
        type: 'BUNGALOW',
        address: '25 Glover Road, Ikoyi',
        city: 'Ikoyi',
        state: 'Lagos',
        units: [
          {
            no: 'B1',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: true,
          },
          {
            no: 'B2',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: false,
          },
          {
            no: 'B3',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: false,
          },
        ],
      },
    ],
  },
  {
    code: 'LL-0005',
    name: 'Ngozi Obi',
    company: 'Obi Investment Ltd',
    email: 'ngozi.obi@example.com',
    phone: '+2348056789005',
    address: '16 Freedom Way, Lekki Phase 1, Lagos',
    props: [
      {
        code: 'PR-0009',
        name: 'Obi Residences',
        type: 'APARTMENT',
        address: '16 Freedom Way, Lekki Phase 1',
        city: 'Lekki',
        state: 'Lagos',
        units: [
          {
            no: 'A1',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: true,
          },
          {
            no: 'A2',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: true,
          },
          {
            no: 'B1',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: 'B2',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: false,
          },
          {
            no: 'C1',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: false,
          },
        ],
      },
      {
        code: 'PR-0010',
        name: 'Ajah Gateway Apartments',
        type: 'APARTMENT',
        address: '2 Akin Ogunlewe Road, Agungi, Ajah',
        city: 'Ajah',
        state: 'Lagos',
        units: [
          {
            no: 'A1',
            type: 'STUDIO',
            beds: 0,
            baths: 1,
            rent: 250_000,
            occupied: true,
          },
          {
            no: 'B1',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: true,
          },
          {
            no: 'B2',
            type: '1 BEDROOM',
            beds: 1,
            baths: 1,
            rent: 400_000,
            occupied: true,
          },
          {
            no: 'C1',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: false,
          },
        ],
      },
      {
        code: 'PR-0011',
        name: 'Coastal Villa',
        type: 'VILLA',
        address: '11 Adeola Odeku Street, Victoria Island',
        city: 'Victoria Island',
        state: 'Lagos',
        units: [
          {
            no: 'V1',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: true,
          },
          {
            no: 'V2',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: true,
          },
          {
            no: 'V3',
            type: '4 BEDROOM',
            beds: 4,
            baths: 4,
            rent: 1_500_000,
            occupied: false,
          },
          {
            no: 'V4',
            type: '4 BEDROOM',
            beds: 4,
            baths: 4,
            rent: 1_500_000,
            occupied: false,
          },
        ],
      },
    ],
  },
  {
    code: 'LL-0006',
    name: 'Ibrahim Danjuma',
    company: 'Danjuma Holdings',
    email: 'ibrahim.danjuma@example.com',
    phone: '+2348067890006',
    address: '5 Williams Avenue, Magodo, Lagos',
    props: [
      {
        code: 'PR-0012',
        name: 'Magodo Estate Row',
        type: 'TERRACE',
        address: '5 Williams Avenue, Magodo',
        city: 'Magodo',
        state: 'Lagos',
        units: [
          {
            no: 'M1',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: 'M2',
            type: '2 BEDROOM',
            beds: 2,
            baths: 2,
            rent: 650_000,
            occupied: true,
          },
          {
            no: 'M3',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: true,
          },
          {
            no: 'M4',
            type: '3 BEDROOM',
            beds: 3,
            baths: 3,
            rent: 1_000_000,
            occupied: false,
          },
        ],
      },
    ],
  },
];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

async function main() {
  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: '00000000-0000-0000-0000-000000000001' },
  });

  await prisma.paymentAllocation.deleteMany();
  await prisma.rentCharge.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.maintenanceStatusHistory.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.complaintMessage.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.communicationDocument.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.documentGrant.deleteMany();
  await prisma.document.deleteMany();
  await prisma.employeeProperty.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.landlord.deleteMany();

  let tenantIndex = 0;
  let landlordCount = 0;
  let propertyCount = 0;
  let unitCount = 0;
  let occupiedUnitCount = 0;
  let tenantCount = 0;
  let leaseCount = 0;
  let rentChargeCount = 0;
  let transactionCount = 0;

  for (const landlord of landlords) {
    const createdLandlord = await prisma.landlord.create({
      data: {
        organizationId: org.id,
        code: landlord.code,
        name: landlord.company,
        email: landlord.email,
        phone: landlord.phone,
        address: landlord.address,
        status: 'ACTIVE',
        portalStatus: 'INACTIVE',
      },
    });

    for (const prop of landlord.props) {
      const property = await prisma.property.create({
        data: {
          organizationId: org.id,
          landlordId: createdLandlord.id,
          code: prop.code,
          name: prop.name,
          type: prop.type,
          address: prop.address,
          city: prop.city,
          state: prop.state,
          status: 'ACTIVE',
        },
      });

      for (const unitPlan of prop.units) {
        const unitConfigMatch =
          unitConfig.find((c) => c.type === unitPlan.type) ?? unitConfig[0];
        const deposit = unitPlan.rent * 2;

        const unit = await prisma.unit.create({
          data: {
            propertyId: property.id,
            number: unitPlan.no,
            type: unitPlan.type,
            bedrooms: unitConfigMatch.beds,
            bathrooms: unitConfigMatch.baths,
            monthlyRent: unitPlan.rent,
            securityDeposit: deposit,
            status: unitPlan.occupied ? 'OCCUPIED' : 'VACANT',
          },
        });

        if (unitPlan.occupied) {
          const [first, ...rest] =
            tenants[tenantIndex % tenants.length].split(' ');
          const emailSafe = `${first}.${rest.join('')}`
            .toLowerCase()
            .replace(/[^a-z.]/g, '');
          const tenant = await prisma.tenant.create({
            data: {
              organizationId: org.id,
              landlordId: createdLandlord.id,
              propertyId: property.id,
              unitId: unit.id,
              firstName: first,
              lastName: rest.join(' '),
              email: `${emailSafe}@example.com`,
              phone: `+2348${String(((tenantIndex * 7919) % 90000000) + 10000000)}`,
              status: 'ACTIVE',
            },
          });
          tenantIndex++;

          const startedAt = firstOfMonth(
            addMonths(new Date(), -(4 + (tenantIndex % 8))),
          );
          const endedAt = addMonths(startedAt, 12);
          const lease = await prisma.lease.create({
            data: {
              organizationId: org.id,
              landlordId: createdLandlord.id,
              propertyId: property.id,
              unitId: unit.id,
              tenantId: tenant.id,
              startDate: startedAt,
              endDate: endedAt,
              rentAmount: unitPlan.rent,
              securityDeposit: deposit,
              paymentSchedule: 'monthly',
              status: 'ACTIVE',
            },
          });

          const now = new Date();
          let periodStart = startedAt;
          while (periodStart.getTime() <= now.getTime()) {
            const periodEnd = addMonths(firstOfMonth(periodStart), 1);
            const isPaid = periodEnd.getTime() < now.getTime();
            await prisma.rentCharge.create({
              data: {
                leaseId: lease.id,
                dueDate: firstOfMonth(periodStart),
                amountDue: unitPlan.rent,
                amountPaid: isPaid ? unitPlan.rent : 0,
                status: isPaid ? 'paid' : 'pending',
                periodStart: firstOfMonth(periodStart),
                periodEnd: new Date(periodEnd.getTime() - 1),
              },
            });
            rentChargeCount++;
            if (isPaid) {
              await prisma.transaction.create({
                data: {
                  organizationId: org.id,
                  landlordId: createdLandlord.id,
                  propertyId: property.id,
                  unitId: unit.id,
                  tenantId: tenant.id,
                  type: 'INCOME',
                  category: 'Rent',
                  amount: unitPlan.rent,
                  transactionDate: firstOfMonth(periodStart),
                  paymentMethod: 'BANK_TRANSFER',
                  reference: `RENT-${prop.code}-${unitPlan.no}-${firstOfMonth(
                    periodStart,
                  )
                    .toISOString()
                    .slice(0, 7)}`,
                  status: 'COMPLETED',
                },
              });
              transactionCount++;
            }
            periodStart = periodEnd;
          }

          leaseCount++;
          tenantCount++;
          occupiedUnitCount++;
        }

        unitCount++;
      }

      const expenseMonth = firstOfMonth(
        addMonths(new Date(), -(landlordCount % 6) - 1),
      );
      const expenseAmount = 35_000 + propertyCount * 10_000;
      await prisma.transaction.create({
        data: {
          organizationId: org.id,
          landlordId: createdLandlord.id,
          propertyId: property.id,
          type: 'EXPENSE',
          category: 'Maintenance',
          amount: expenseAmount,
          transactionDate: expenseMonth,
          paymentMethod: 'BANK_TRANSFER',
          reference: `MNT-${prop.code}-${expenseMonth.toISOString().slice(0, 7)}`,
          status: 'COMPLETED',
        },
      });
      transactionCount++;

      propertyCount++;
    }

    landlordCount++;
  }

  console.log('Demo seed completed');
  console.table({
    landlords: landlordCount,
    properties: propertyCount,
    units: unitCount,
    occupiedUnits: occupiedUnitCount,
    tenants: tenantCount,
    leases: leaseCount,
    rentCharges: rentChargeCount,
    transactions: transactionCount,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
