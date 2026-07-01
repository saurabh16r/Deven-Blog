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

    // Seed default author and update blogs without authorId
    try {
      const Author = (await import('./models/Author')).default;
      const Blog = (await import('./models/Blog')).default;
      
      const authorCount = await Author.countDocuments();
      let defaultAuthorId = null;
      
      if (authorCount === 0) {
        console.log('Seeding default author...');
        const newAuthor = await Author.create({
          name: 'Saurabh Rathore',
          role: 'Founder',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          bio: 'Founder, product designer, and startup enthusiast writing about AI, business strategy, and entrepreneurship.',
          linkedin: 'https://linkedin.com/in/saurabh-rathore',
          twitter: 'https://x.com/saurabh',
          website: 'https://deven.blog'
        });
        defaultAuthorId = newAuthor._id;
        console.log('Seeding default author completed successfully.');
      } else {
        const defaultAuthor = await Author.findOne().sort({ createdAt: 1 });
        if (defaultAuthor) {
          defaultAuthorId = defaultAuthor._id;
        }
      }

      if (defaultAuthorId) {
        const blogsWithoutAuthor = await Blog.countDocuments({ authorId: { $exists: false } });
        if (blogsWithoutAuthor > 0) {
          console.log(`Migrating ${blogsWithoutAuthor} blogs to reference the default author...`);
          await Blog.updateMany({ authorId: { $exists: false } }, { authorId: defaultAuthorId });
          console.log('Blog author migration completed.');
        }
      }
    } catch (authorErr) {
      console.error('Error seeding default author or migrating blogs:', authorErr);
    }
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
