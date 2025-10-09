import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create default admin user (if doesn't exist)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@comp4050.edu' },
      update: {}, // Don't update if exists
      create: {
        studentId: '00000000',
        email: 'admin@comp4050.edu',
        password: 'hashedAdminPassword', // In real app, hash this properly
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin user ready:', admin.email);

    // 2. Create sample teacher (for development)
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@comp4050.edu' },
      update: {},
      create: {
        studentId: '11111111',
        email: 'teacher@comp4050.edu',
        password: 'hashedTeacherPassword',
        firstName: 'Jane',
        lastName: 'Professor',
        role: 'TEACHER'
      }
    });
    console.log('✅ Sample teacher ready:', teacher.email);

    // 3. Create sample students (for development)
    const students = await Promise.all([
      prisma.user.upsert({
        where: { email: 'student1@comp4050.edu' },
        update: {},
        create: {
          studentId: '12345678',
          email: 'student1@comp4050.edu',
          password: 'hashedStudentPassword',
          firstName: 'Alice',
          lastName: 'Johnson',
          role: 'STUDENT'
        }
      }),
      prisma.user.upsert({
        where: { email: 'student2@comp4050.edu' },
        update: {},
        create: {
          studentId: '87654321',
          email: 'student2@comp4050.edu',
          password: 'hashedStudentPassword',
          firstName: 'Bob',
          lastName: 'Smith',
          role: 'STUDENT'
        }
      })
    ]);
    console.log('✅ Sample students ready:', students.length);

    // 4. Summary
    const totalUsers = await prisma.user.count();
    console.log(`🌱 Seeding completed! Total users: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .catch((e) => {
    console.error('❌ Seed process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  });
