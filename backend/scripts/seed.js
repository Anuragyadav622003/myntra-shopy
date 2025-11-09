import { connect } from 'mongoose';
import { config } from 'dotenv';
import User from '../models/user.js';
import Category from '';
import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';


config();

const categories = [
  {
    name: 'Men',
    description: 'Fashion for men',
    image: 'https://m.media-amazon.com/images/I/714ojRIFnfL._AC_UL480_FMwebp_QL65_.jpg'
  },
  {
    name: 'Women',
    description: 'Fashion for women',
    image: 'https://m.media-amazon.com/images/I/81LIK5N73OL._SX679_.jpg'
  },
  {
    name: 'Kids',
    description: 'Fashion for kids',
    image: 'https://m.media-amazon.com/images/I/81ciCaKZsyL._AC_UL480_FMwebp_QL65_.jpg'
  }
];

const products = [
  {
    name: 'Nike Air Max 270',
    description: 'Latest Nike Air Max shoes with premium comfort',
    price: 4999,
    originalPrice: 7999,
    images: [
      'https://m.media-amazon.com/images/I/51DZP83wBFL._SY535_.jpg',
      'https://m.media-amazon.com/images/I/51JceuUOhAL._SY535_.jpg'
    ],
    brand: 'Nike',
    sizes: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 5 }
    ],
    colors: [
      { name: 'Black', code: '#000000' },
      { name: 'White', code: '#FFFFFF' },
      { name: 'Blue', code: '#0000FF' }
    ],
    featured: true,
    rating: 4.5,
    numReviews: 25
  },
  {
    name: 'Adidas Ultraboost',
    description: 'Premium running shoes with boost technology',
    price: 8999,
    originalPrice: 11999,
    images: [
      'https://m.media-amazon.com/images/I/61amgHsKboL._SY535_.jpg',
      'https://m.media-amazon.com/images/I/81Kz2PNUKdL._SX535_.jpg'
    ],
    brand: 'Adidas',
    sizes: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 12 },
      { size: 'L', stock: 6 }
    ],
    colors: [
      { name: 'Black', code: '#000000' },
      { name: 'Red', code: '#FF0000' }
    ],
    featured: true,
    rating: 4.8,
    numReviews: 18
  },
  {
    name: 'Puma T-Shirt',
    description: 'Comfortable cotton t-shirt for daily wear',
    price: 1299,
    originalPrice: 1999,
    images: [
      'https://m.media-amazon.com/images/I/614gFfGPhpL._SX679_.jpg',
      'https://m.media-amazon.com/images/I/51KY72pGMUL._SX679_.jpg'
    ],
    brand: 'Puma',
    sizes: [
      { size: 'S', stock: 20 },
      { size: 'M', stock: 25 },
      { size: 'L', stock: 18 },
      { size: 'XL', stock: 12 }
    ],
    colors: [
      { name: 'White', code: '#FFFFFF' },
      { name: 'Gray', code: '#808080' },
      { name: 'Navy Blue', code: '#000080' }
    ],
    featured: false,
    rating: 4.2,
    numReviews: 32
  },
  {
    name: 'Levi\'s Jeans',
    description: 'Classic denim jeans for everyday wear',
    price: 2999,
    originalPrice: 3999,
    images: [
      'https://m.media-amazon.com/images/I/61q57agygeL._SX679_.jpg',
      'https://m.media-amazon.com/images/I/51qC5Bf-aaL._SX679_.jpg'
    ],
    brand: 'Levi\'s',
    sizes: [
      { size: '28', stock: 15 },
      { size: '30', stock: 20 },
      { size: '32', stock: 18 },
      { size: '34', stock: 12 }
    ],
    colors: [
      { name: 'Blue', code: '#0000FF' },
      { name: 'Black', code: '#000000' }
    ],
    featured: true,
    rating: 4.6,
    numReviews: 45
  },
  {
    name: 'Zara Dress',
    description: 'Elegant summer dress for women',
    price: 2599,
    originalPrice: 3599,
    images: [
      'https://m.media-amazon.com/images/I/7160TFxUO7L._SY879_.jpg',
      'https://m.media-amazon.com/images/I/61Ctdg-sGnL._SX522_.jpg'
    ],
    brand: 'Zara',
    sizes: [
      { size: 'XS', stock: 8 },
      { size: 'S', stock: 12 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 10 }
    ],
    colors: [
      { name: 'Red', code: '#FF0000' },
      { name: 'Yellow', code: '#FFFF00' },
      { name: 'Pink', code: '#FFC0CB' }
    ],
    featured: true,
    rating: 4.4,
    numReviews: 28
  }
];

const seedDatabase = async () => {
  try {
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myntra-clone');
    
    console.log('Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();

    console.log('Existing data cleared...');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created...');

    // Map products to categories
    const menCategory = createdCategories.find(cat => cat.name === 'Men');
    const womenCategory = createdCategories.find(cat => cat.name === 'Women');
    const kidsCategory = createdCategories.find(cat => cat.name === 'Kids');

    const productsWithCategories = products.map((product, index) => {
      // Distribute products across categories
      if (product.name.includes('Dress') || product.brand === 'Zara') {
        return { ...product, category: womenCategory._id };
      } else if (index % 3 === 0) {
        return { ...product, category: menCategory._id };
      } else if (index % 3 === 1) {
        return { ...product, category: womenCategory._id };
      } else {
        return { ...product, category: kidsCategory._id };
      }
    });

    // Create products
    await Product.insertMany(productsWithCategories);
    console.log('Products created...');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@myntra.com',
      password: hashedPassword,
      phone: '9876543210'
    });

    // Create regular user
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      phone: '9876543211'
    });

    console.log('Users created...');
    console.log('Database seeded successfully!');
    
    // Display seeded data
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`📁 Categories: ${categoryCount}`);
    console.log(`🛍️  Products: ${productCount}`);
    console.log(`👥 Users: ${userCount}`);
    console.log('\n✅ Database is ready!');
    
    process.exit();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();