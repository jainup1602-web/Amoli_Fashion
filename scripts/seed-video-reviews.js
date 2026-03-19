const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Using publicly embeddable YouTube shorts / videos as videoUrl
// thumbnailUrl = Unsplash portrait images as poster
const reviews = [
  {
    customerName: 'Priya Sharma',
    customerLocation: 'Mumbai',
    rating: 5,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
    order: 1,
  },
  {
    customerName: 'Ananya Gupta',
    customerLocation: 'Delhi',
    rating: 5,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80',
    order: 2,
  },
  {
    customerName: 'Meera Patel',
    customerLocation: 'Ahmedabad',
    rating: 5,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=400&q=80',
    order: 3,
  },
  {
    customerName: 'Kavya Reddy',
    customerLocation: 'Bangalore',
    rating: 4,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&q=80',
    order: 4,
  },
  {
    customerName: 'Sneha Joshi',
    customerLocation: 'Pune',
    rating: 5,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80',
    order: 5,
  },
  {
    customerName: 'Riya Singh',
    customerLocation: 'Jaipur',
    rating: 5,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80',
    order: 6,
  },
  {
    customerName: 'Divya Nair',
    customerLocation: 'Chennai',
    rating: 4,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&q=80',
    order: 7,
  },
  {
    customerName: 'Nisha Verma',
    customerLocation: 'Kolkata',
    rating: 5,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&q=80',
    order: 8,
  },
];

async function main() {
  console.log('Seeding video reviews...');
  await prisma.videoreview.deleteMany({});
  console.log('Cleared existing video reviews');

  for (const r of reviews) {
    await prisma.videoreview.create({ data: { ...r, isActive: true } });
    console.log(`✅ Added: ${r.customerName}`);
  }
  console.log('\n✅ Video reviews seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
