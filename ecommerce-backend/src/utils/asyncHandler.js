// src/utils/asyncHandler.js
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
});
