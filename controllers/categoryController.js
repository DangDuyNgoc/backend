import categoriesModel from "../models/categoryModel.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(404).send({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await categoriesModel.findOne({ name });
    if (existingCategory) {
      return res.status(201).send({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await new categoriesModel({
      name,
    }).save();

    res.status(200).send({
      success: true,
      message: "Category created successfully",
      category: category,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};
