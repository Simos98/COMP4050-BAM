import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('Starting database seeding...');

  const saltRounds = 10;
  const adminPlain = 'adminpass123'; // Test Password
  const teacherPlain = 'teacherpass123';
  const studentPlain = 'studentpass123';

  const adminHash = await bcrypt.hash(adminPlain, saltRounds);
  const teacherHash = await bcrypt.hash(teacherPlain, saltRounds);
  const studentHash = await bcrypt.hash(studentPlain, saltRounds);

  try {
    // Default Admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@comp4050.edu' },
      update: { password: adminHash },
      create: {
        studentId: '00000000',
        email: 'admin@comp4050.edu',
        password: adminHash, // Use hashed password
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin user ready:', admin.email);

    // Sample teacher (for development)
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@comp4050.edu' },
      update: {},
      create: {
        studentId: '11111111',
        email: 'teacher@comp4050.edu',
        password: teacherHash, // Use hashed password
        firstName: 'Jane',
        lastName: 'Professor',
        role: 'TEACHER'
      }
    });
    console.log('✅ Sample teacher ready:', teacher.email);

    // Sample Students (for development)
    const students = await Promise.all([
      prisma.user.upsert({
        where: { email: 'student1@comp4050.edu' },
        update: {},
        create: {
          studentId: '12345678',
          email: 'student1@comp4050.edu',
          password: studentHash, // Use hashed password
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
          password: studentHash, // Use hashed password
          firstName: 'Bob',
          lastName: 'Smith',
          role: 'STUDENT'
        }
      })
    ]);
    console.log('✅ Sample students ready:', students.length);

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
