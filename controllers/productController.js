import productModel from "./../models/productModel.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      imageUrl,
      category,
      quantity,
      discountedPercent,
      brand,
      color,
    } = req.body;

    let discountedPrice = null;
    if (discountedPercent) {
      discountedPrice = price - (price * discountedPercent) / 100;
    }

    const newProduct = new productModel({
      name,
      description,
      price,
      imageUrl,
      category,
      quantity,
      discountedPrice,
      brand,
      color,
    });

    await newProduct.save();

    res.status(200).send({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};
