// Test: fetch /api/banners and check what image URLs come back
const res = await fetch('http://localhost:3000/api/banners');
const data = await res.json();
console.log('Status:', res.status);
console.log('Success:', data.success);
if (data.banners) {
  data.banners.forEach(b => {
    console.log(`Banner: "${b.title}" | image: ${b.image}`);
  });
} else {
  console.log('Error:', data.message);
}
