const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = Schema({
  email: {
    type: String,
    required: true,
  },
  // username and passport are by default implicitly defined in passport-local-mongoose
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
