#! /usr/bin/env node

  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Category = require("./models/category");
  const Item = require("./models/item");
  
  const categories = [];
  const items = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }

  async function categoryCreate(index, name) {
    const category = new Category({ name: name });
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${name}`);
  }
  
  async function itemCreate(index, name, description, price, stock, category) {
    const itemdetail = {
      name: name, 
      description: description, 
      price: price,
      stock: stock,
    };
    if (category != false) itemdetail.category = category;
  
    const item = new Item(itemdetail);
    await item.save();
    items[index] = item;
    console.log(`Added item: ${name}`);
  }
  
  async function createCategories() {
    console.log("Adding categories");
    await Promise.all([
      categoryCreate(0, "Clothing"),
      categoryCreate(1, "Electronics"),
      categoryCreate(2, "Jewelry"),
    ]);
  }
  
  async function createItems() {
    console.log("Adding Items");
    await Promise.all([
      itemCreate(0,
        "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops)",
        "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
        109.95,
        5,
        [categories[0]]
      ),
      itemCreate(1,
        "Mens Cotton Jacket",
        "great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day.",
        55.99,
        8,
        [categories[0]]
      ),
      itemCreate(2,
        "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
        "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance, or outward for protection.",
        695,
        3,
        [categories[2]]
      ),
      itemCreate(3,
        "WD 2TB Elements Portable External Hard Drive - USB 3.0",
        "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity; Compatibility Formatted NTFS for Windows 10, Windows 8.1, Windows 7; Reformatting may be required for other operating systems; Compatibility may vary depending on user’s hardware configuration and operating system",
        64,
        23,
        [categories[1]]
      ),
      itemCreate(4,
        "Acer SB220Q bi 21.5 inches Full HD (1920 x 1080) IPS Ultra-Thin",
        "21. 5 inches Full HD (1920 x 1080) widescreen IPS display And Radeon free Sync technology. No compatibility for VESA Mount Refresh Rate: 75Hz - Using HDMI port Zero-frame design | ultra-thin | 4ms response time | IPS panel Aspect ratio - 16: 9. Color Supported - 16. 7 million colors. Brightness - 250 nit Tilt angle -5 degree to 15 degree. Horizontal viewing angle-178 degree. Vertical viewing angle-178 degree 75 hertz",
        599,
        2,
        [categories[1]]
      ),
      itemCreate(5,
        "Test Item 1",
        "Summary of test item 1",
        20,
        242,
        [categories[0], categories[1]]
      ),
      itemCreate(6,
        "Test Item 2",
        "Summary of test item 2",
        50,
        50,
        false
      ),
    ]);
  }
  
 