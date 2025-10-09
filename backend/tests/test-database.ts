import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Clean up any existing test data
    console.log('🧹 Cleaning up existing test data...');
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });

    // Create test users
    console.log('👤 Creating test users...');
    
    const student = await prisma.user.create({
      data: {
        studentId: '12345678',
        email: 'john.doe@student.edu',
        password: 'hashedPassword123', // In real app, this would be hashed
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT'
      }
    });
    console.log('✅ Student created:', student);

    const teacher = await prisma.user.create({
      data: {
        studentId: '87654321',
        email: 'jane.smith@teacher.edu',
        password: 'hashedPassword456',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'TEACHER'
      }
    });
    console.log('✅ Teacher created:', teacher);

    const admin = await prisma.user.create({
      data: {
        studentId: '11111111',
        email: 'admin@test.edu',
        password: 'hashedPassword789',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin created:', admin);

    // Query all users
    console.log('📋 Fetching all users...');
    const allUsers = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('👥 All users:');
    allUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
    });

    // Test unique constraints
    console.log('🔒 Testing unique constraints...');
    try {
      await prisma.user.create({
        data: {
          studentId: '12345678', // Duplicate student ID
          email: 'duplicate@test.edu',
          password: 'password',
          firstName: 'Duplicate',
          lastName: 'User',
          role: 'STUDENT'
        }
      });
    } catch (error) {
      console.log('✅ Unique constraint working - duplicate studentId rejected');
    }

    console.log('🎉 Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
}

testDatabase();
