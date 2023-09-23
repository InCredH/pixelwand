const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let sessionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // One day in the future
      index: { expires: "1d" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);
