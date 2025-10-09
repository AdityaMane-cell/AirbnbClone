const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js"); // ✅ You forgot to import Review
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // ✅ Make sure environment variables are loaded

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ MongoDB connection
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dburl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dburl); // initializing data to cloud storage
}

main()
  .then(() => {
    console.log("✅ Connected to MongoDB successfully.");
    initDB(); // ✅ Start seeding after connection
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// ✅ Seeding function
const initDB = async () => {
  try {
    await Listing.deleteMany({});
    console.log("🗑️ Listings deleted.");

    await Review.deleteMany({});
    console.log("🗑️ Reviews deleted.");

    // ✅ Upload images to Cloudinary and prepare new listing data
    const listingsWithOwner = await Promise.all(
      initData.data.map(async (obj) => {
        const uploadedResponse = await cloudinary.uploader.upload(
          obj.image.url,
          {
            folder: "Wanderlust",
          }
        );

        return {
          ...obj,
          image: {
            url: uploadedResponse.secure_url,
            filename: uploadedResponse.public_id,
          },
          owner: "68e7b61caf72085eff77a426", // admin user ID from atlas
        };
      })
    );

    await Listing.insertMany(listingsWithOwner);
    console.log("✅ Listings inserted successfully.");
  } catch (err) {
    console.error("❌ Error during DB initialization:", err);
  } finally {
    mongoose.connection.close(); // ✅ Clean exit
    console.log("🔌 MongoDB connection closed.");
  }
};
