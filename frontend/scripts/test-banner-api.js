async function testBannerAPI() {
  try {
    const res = await fetch('http://localhost:3000/api/banners');
    const data = await res.json();
    
    console.log('API Response Status:', res.status);
    console.log('API Response:', JSON.stringify(data, null, 2).substring(0, 500));
    
    if (data.success && data.banners) {
      console.log('\nBanners count:', data.banners.length);
      data.banners.forEach((b, i) => {
        console.log(`\nBanner ${i + 1}:`);
        console.log('  ID:', b.id);
        console.log('  Title:', b.title);
        console.log('  Active:', b.isActive);
        console.log('  Image type:', b.image?.startsWith('data:') ? 'base64' : 'URL');
        console.log('  Image preview:', b.image?.substring(0, 80));
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBannerAPI();
