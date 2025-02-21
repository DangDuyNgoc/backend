import mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

const reviewModel = mongoose.model("reviews", reviewsSchema);
export default reviewModel;
