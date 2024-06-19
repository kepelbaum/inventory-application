const Item = require("../models/item");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");


exports.item_list = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find({}, "name price category")
    .sort({ name: 1 })
    .populate("category")
    .exec();

  res.render("item_list", { title: "Item List", item_list: allItems });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    item: item,
  });
}); 

exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  res.render("item_form", {
    title: "Create Item",
    categories: allCategories,
  });
}); 

exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "Category must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty").trim().isLength({ min: 1 }).escape(),
  body("stock", "Stock quantity must not be empty").trim().isLength({ min: 1 }).escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
    });


    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      // Mark our selected categories as checked.
      allCategories.forEach((category) => {
        // if (item.category.includes(category._id)) category.checked = "true";
        item.category.forEach((cat) => {
          if (category._id.toString() === cat._id.toString()) {
            category.checked = 'true';
          }
        })
      });
      res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save item.
      await item.save();
      res.redirect(item.url);
    }
  }),
]

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    // No results.
    res.redirect("/item");
  }

  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });

}); 

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndDelete(req.body.itemid);
  res.redirect("/item");
}); 

exports.item_update_get = asyncHandler(async (req, res, next) => {  
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find().sort({ name: 1 }).exec(),
  ]);

  if (item === null) {
    const err = new Error("item not found");
    err.status = 404;
    return next(err);
  }

  allCategories.forEach((category) => {
    // if (item.category.includes(category._id)) category.checked = "true";
    item.category.forEach((cat) => {
      if (category._id.toString() === cat._id.toString()) {
        category.checked = 'true';
      }
    })
  });

  res.render("item_form", {
    title: "Update item",
    categories: allCategories,
    item: item,
  });
}); 

exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty").trim().isLength({ min: 1 }).escape(),
  body("stock", "Stock quantity must not be empty").trim().isLength({ min: 1 }).escape(),


  asyncHandler(async (req, res, next) => {

    const errors = validationResult(req);

     const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: typeof req.body.category === "undefined" ? [] : req.body.category,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {

      const allCategories = await Category.find().sort({ name: 1 }).exec();

      allCategories.forEach((category) => {
        // if (item.category.includes(category._id)) category.checked = "true";
        item.category.forEach((cat) => {
          if (category._id.toString() === cat._id.toString()) {
            category.checked = 'true';
          }
        })
      });
      res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      res.redirect(updatedItem.url);
    }
  }),
]
