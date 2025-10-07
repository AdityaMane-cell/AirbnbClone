const Listing = require("../models/listing.js");
const cloudinary = require("cloudinary").v2;
const NodeGeocoder = require("node-geocoder");
const geocoder = NodeGeocoder({ provider: "openstreetmap" });

// index
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// new
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// show
module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "listing does not exist");
    return res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

// create
module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  // much better to import as an array rather than destructuring objects== // let {title, description, image, price, country, location} = req.body;
  const newListing = new Listing(req.body.listing);
  // to get coordinates by forward geocoding
  let coordinates = [];
  try {
    const geoData = await geocoder.geocode(
      `${newListing.location}, ${newListing.country}`
    );
    if (geoData.length > 0) {
      coordinates = [geoData[0].longitude, geoData[0].latitude]; //[lng, lat]
    } else {
      req.flash(
        "error",
        `could not find location for ${newListing.location}, ${newListing.country}`
      );
      console.error(
        `No geocoding resu}lt for : ${newListing.location}, ${newListing.country}`
      );
    }
  } catch (error) {
    req.flash("error", "failed to geocode location. Please try again.");
    console.error("geocoding faild : ", error);
  }

  newListing.owner = req.user._id; // assigning owner of the listing
  newListing.image = { url, filename }; // saving image
  newListing.geometry = { type: "Point", coordinates };
  await newListing.save();
  req.flash("success", "new listing created");
  res.redirect("/listings");
};

// edit
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "listing does not exist for editing");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace(
    "/upload/",
    "/upload/h_300,w_350/e_blur:100/"
  );
  console.log(originalImageUrl);
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// update
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // updated only form data

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save(); // file image updated here
  }

  req.flash("success", "listing Updated");
  res.redirect(`/listings/${id}`);
};

// delete
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findById(id);
  if (!deleteListing) {
    req.flash("error", "Listing not Found!");
    return res.redirect("/listings");
  }

  // delete image from Cloudinary
  if (deleteListing.image && deleteListing.image.filename) {
    try {
      const publicId = `${deleteListing.image.filename}`;
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted image from Cloudinary: ${publicId}`);
    } catch (err) {
      console.error("Error, deleting the image from Cloudinary: ", err);
      req.flash("error", "Listing deleted but failed to remove image");
    }
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "listing deleted");
  res.redirect("/listings");
};
