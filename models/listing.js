const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  geometry: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number] }, // [lng, lat]
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  category: {
    type: String,
    enum: [
      "trending",
      "room",
      "iconic cities",
      "surfing",
      "castles",
      "pools",
      "beaches",
      "cabins",
      "omg",
      "lake",
      "camping",
      "farms",
      "mountains",
      "arctic",
    ],
  },
});

// to delete listing along with all it's reviews
listingSchema.post("findONeAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
