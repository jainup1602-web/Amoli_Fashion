const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/settings',    require('./routes/settings'));
app.use('/api/products',    require('./routes/products'));
app.use('/api/categories',  require('./routes/categories'));
app.use('/api/subcategories', require('./routes/subcategories'));
app.use('/api/banners',     require('./routes/banners'));
app.use('/api/cart',        require('./routes/cart'));
app.use('/api/wishlist',    require('./routes/wishlist'));
app.use('/api/orders',      require('./routes/orders'));
app.use('/api/reviews',     require('./routes/reviews'));
app.use('/api/coupons',     require('./routes/coupons'));
app.use('/api/newsletter',  require('./routes/newsletter'));
app.use('/api/enquiries',   require('./routes/enquiries'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/cms-pages',   require('./routes/cmsPages'));
app.use('/api/showcases',   require('./routes/showcases'));
app.use('/api/model-gallery', require('./routes/modelGallery'));
app.use('/api/video-reviews', require('./routes/videoReviews'));
app.use('/api/marquee',      require('./routes/marquee'));
app.use('/api/popup',       require('./routes/popup'));
app.use('/api/sections',    require('./routes/sections'));
app.use('/api/make-admin',  require('./routes/makeAdmin'));

// Admin routes
app.use('/api/admin/dashboard',    require('./routes/admin/dashboard'));
app.use('/api/admin/products',     require('./routes/admin/products'));
app.use('/api/admin/categories',   require('./routes/admin/categories'));
app.use('/api/admin/orders',       require('./routes/admin/orders'));
app.use('/api/admin/users',        require('./routes/admin/users'));
app.use('/api/admin/banners',      require('./routes/admin/banners'));
app.use('/api/admin/reviews',      require('./routes/admin/reviews'));
app.use('/api/admin/coupons',      require('./routes/admin/coupons'));
app.use('/api/admin/newsletter',   require('./routes/admin/newsletter'));
app.use('/api/admin/shipping',     require('./routes/admin/shipping'));
app.use('/api/admin/settings',     require('./routes/admin/settings'));
app.use('/api/admin/cms-pages',    require('./routes/admin/cmsPages'));
app.use('/api/admin/showcases',    require('./routes/admin/showcases'));
app.use('/api/admin/model-gallery', require('./routes/admin/modelGallery'));
app.use('/api/admin/video-reviews', require('./routes/admin/videoReviews'));
app.use('/api/admin/marquee',      require('./routes/admin/marquee'));
app.use('/api/admin/popups',       require('./routes/admin/popups'));
app.use('/api/admin/sections',     require('./routes/admin/sections'));
app.use('/api/admin/reports',      require('./routes/admin/reports'));

app.use('/api/admin/returns',      require('./routes/admin/returns'));

// Webhooks
app.use('/api/webhooks/shiprocket', require('./routes/webhooks/shiprocket'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
