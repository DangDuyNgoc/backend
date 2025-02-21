import mongoose from "mongoose";

const categoriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  }
});

const categoriesModel = mongoose.model("categories", categoriesSchema);

export default categoriesModel;
