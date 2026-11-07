import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    profileImage: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    },

    resetOTP: {
   type: String,
  default: null
  },

resetOTPExpires: {
  type: Date,
  default: null
}

  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;