import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/founderbrief';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('Connected to MongoDB database');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Seed default categories if they do not exist
    try {
      const Category = (await import('./models/Category')).default;
      const count = await Category.countDocuments();
      if (count === 0) {
        console.log('Seeding default categories...');
        const defaultCategories = [
          { name: 'Startups', slug: 'startups' },
          { name: 'AI', slug: 'ai' },
          { name: 'Marketing', slug: 'marketing' },
          { name: 'Fundraising', slug: 'fundraising' },
          { name: 'Operations', slug: 'operations' },
          { name: 'Growth', slug: 'growth' }
        ];
        await Category.insertMany(defaultCategories);
        console.log('Seeding default categories completed successfully.');
      }
    } catch (seedErr) {
      console.error('Error seeding default categories:', seedErr);
    }
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
