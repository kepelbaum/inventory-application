const Item = require("../models/item");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.main_page = asyncHandler(async (req, res, next) => {
    const [
        numCategories,
        numItems,
      ] = await Promise.all([
        Category.countDocuments({}).exec(),
        Item.countDocuments({}).exec(),
      ]);
    
      res.render("index", {
        title: "Inventory Application",
        category_count: numCategories,
        item_count: numItems,
      });
});

exports.category_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().sort({ name: 1 }).exec();
    res.render("category_list", {
      title: "Category List",
      category_list: allCategories, 
    });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name price").exec(),
      ]);
      if (category === null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
    
      res.render("category_detail", {
        title: "Category Detail",
        category: category,
        category_items: itemsInCategory,
      });
}); 

exports.category_create_get = asyncHandler(async (req, res, next) => {
    res.render("category_form", { title: "Create Category" });
}); 

exports.category_create_post = asyncHandler(async (req, res, next) => {
    body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })   
    .escape();

  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    const category = new Category({ name: req.body.name });

    if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("category_form", {
          title: "Create category",
          category: category,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if category with same name already exists.
        const categoryExists = await Category.findOne({ name: req.body.name })
          .collation({ locale: "en", strength: 2 })
          .exec();
        if (categoryExists) {
          // category exists, redirect to its detail page.
          res.redirect(categoryExists.url);
        } else {
          await category.save();
          // New category saved. Redirect to category detail page.
          res.redirect(category.url);
        }
      }
  })
}); 

exports.category_delete_get = asyncHandler(async (req, res, next) => {
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name price").exec(),
      ]);
      if (category === null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
    
      res.render("category_delete", {
        title: "Delete Category",
        category: category,
        category_items: itemsInCategory,
      });
}); 

exports.category_delete_post = asyncHandler(async (req, res, next) => {
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name price").exec(),
      ]);
    
      if (itemsInCategory.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render("category_delete", {
          title: "Delete Category",
          category: category,
          category_items: itemsInCategory,
        });
        return;
      } else {
        // Author has no books. Delete object and redirect to the list of authors.
        await Category.findByIdAndDelete(req.body.categoryid);
        res.redirect("/category");
      }
}); 

exports.category_update_get = asyncHandler(async (req, res, next) => {
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name price").exec(),
      ]);
      if (category === null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      res.render("category_form", { title: "Update Category", category: category, });
}); 

exports.category_update_post = [
    body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })   
    .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
    
        const category = new Category({ name: req.body.name, _id: req.params.id, });
    
        if (!errors.isEmpty()) {
          res.render("category_form", {
            title: "Update Category",
            category: category,
            errors: errors.array(),
          });
          return;
        } else {
          const categoryExists = await Category.findOne({ name: req.body.name })
            .collation({ locale: "en", strength: 2 })
            .exec();
          if (categoryExists) {
            res.redirect(categoryExists.url);
          } else {
         const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
         res.redirect(updatedCategory.url);
          }
        }
      }),
]