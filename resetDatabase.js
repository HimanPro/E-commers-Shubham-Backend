const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const mongoose = require('mongoose');

async function resetDatabase() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is undefined. Check your .env file path.");
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const collections = await mongoose.connection.db.listCollections().toArray();

    for (let collection of collections) {
      console.log(`Dropping collection: ${collection.name}`);
      await mongoose.connection.db.dropCollection(collection.name);
    }

    console.log("✅ All collections dropped successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error dropping collections:", error.message);
    process.exit(1);
  }
}

resetDatabase();
