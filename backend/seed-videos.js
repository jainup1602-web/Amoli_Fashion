const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const videos = [
  {
    customerName: "Ayesha Sharma",
    customerLocation: "Mumbai",
    rating: 5,
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1599643478524-fb66f7f6f1c4?w=400&q=80",
    order: 1
  },
  {
    customerName: "Priya Rajan",
    customerLocation: "Delhi",
    rating: 5,
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1515562141207-7a8efbd8ce71?w=400&q=80",
    order: 2
  },
  {
    customerName: "Neha Kapoor",
    customerLocation: "Bangalore",
    rating: 4,
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80",
    order: 3
  },
  {
    customerName: "Simran Kaur",
    customerLocation: "Chandigarh",
    rating: 5,
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&q=80",
    order: 4
  }
];

async function seed() {
  console.log("Seeding video reviews...");
  await prisma.videoreview.deleteMany({}); // clear existing just in case
  for (const video of videos) {
    await prisma.videoreview.create({ data: video });
  }
  console.log("Seeded successfully!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
