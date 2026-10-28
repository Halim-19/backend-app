import { prisma } from '../config/db.js';

const user = await prisma.user.findFirst();

if (!user) {
  console.log('Register a user first.');
  process.exit(1);
}

await prisma.post.createMany({
  data: Array.from({ length: 45 }, (_, i) => ({
    data: `Sample post number ${i + 1}${i % 5 === 0 ? ' about hello world' : ''}`,
    authorId: user.id,
  })),
});

console.log(`Created 45 posts for ${user.email}`);
await prisma.$disconnect();