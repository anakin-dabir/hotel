import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: String,
    isSuperAdmin: { type: Boolean, default: false },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
  },
  {
    collection: "User",
  }
);

userSchema.methods.isMatchedPassword = function (password) {
  return password === this.password;
};

export default mongoose.model("User", userSchema);
