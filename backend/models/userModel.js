const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userModel =new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  {
    timestamps: true,
  }
);

// userModel.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

//Below code is a mongoDB middleware that will run before the user is saved to the database
//Middleware values are save, remove, validate, count, aggregate
//Model.pre() - runs before the save() method
//Model.post() - runs after the save() method
userModel.pre("save", async function (next) {
  //If the password is not changed, then we don't need to hash it again, we move ahead
  if (!this.isModified("password")) return next();
  //If the password is changed, then we need to hash the new password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userModel);
module.exports = User;
