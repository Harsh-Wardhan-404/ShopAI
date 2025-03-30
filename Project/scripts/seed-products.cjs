const { PrismaClient } = require('@prisma/client');
// const fetch = require('node-fetch');

const prisma = new PrismaClient();

// Your products data array
const productsData = [
  // Electronics category
  {
    name: "Smart 4K TV 55-inch",
    description: "Ultra HD Smart TV with HDR and built-in streaming apps",
    price: "499.99",
    stock: 15,
    category: "Electronics",
    imageUrl: "https://placehold.co/600x400?text=Smart+TV"
  },
  {
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium over-ear headphones with 30-hour battery life",
    price: "199.99",
    stock: 25,
    category: "Electronics",
    imageUrl: "https://placehold.co/600x400?text=Headphones"
  },
  {
    name: "Gaming Laptop 15.6-inch",
    description: "High-performance gaming laptop with RGB keyboard and dedicated GPU",
    price: "1299.99",
    stock: 8,
    category: "Electronics",
    imageUrl: "https://placehold.co/600x400?text=Gaming+Laptop"
  },

  // Clothing category
  {
    name: "Men's Casual Jacket",
    description: "Lightweight waterproof jacket perfect for spring and autumn",
    price: "69.99",
    stock: 30,
    category: "Clothing",
    imageUrl: "https://placehold.co/600x400?text=Casual+Jacket"
  },
  {
    name: "Women's Running Shoes",
    description: "Breathable and comfortable shoes for running and everyday use",
    price: "89.99",
    stock: 40,
    category: "Clothing",
    imageUrl: "https://placehold.co/600x400?text=Running+Shoes"
  },
  {
    name: "Unisex Cotton T-shirt",
    description: "Classic fit crew neck t-shirt made from organic cotton",
    price: "19.99",
    stock: 100,
    category: "Clothing",
    imageUrl: "https://placehold.co/600x400?text=Cotton+T-shirt"
  },

  // Home & Kitchen category
  {
    name: "Non-Stick Cookware Set",
    description: "10-piece cookware set with glass lids and ergonomic handles",
    price: "149.99",
    stock: 20,
    category: "Home & Kitchen",
    imageUrl: "https://placehold.co/600x400?text=Cookware+Set"
  },
  {
    name: "Robot Vacuum Cleaner",
    description: "Smart vacuum with mapping technology and app control",
    price: "299.99",
    stock: 15,
    category: "Home & Kitchen",
    imageUrl: "https://placehold.co/600x400?text=Robot+Vacuum"
  },
  {
    name: "Bamboo Cutting Board Set",
    description: "Set of 3 eco-friendly cutting boards in different sizes",
    price: "34.99",
    stock: 45,
    category: "Home & Kitchen",
    imageUrl: "https://placehold.co/600x400?text=Cutting+Board+Set"
  },

  // Books category
  {
    name: "The Art of Programming",
    description: "Comprehensive guide to modern programming techniques",
    price: "29.99",
    stock: 50,
    category: "Books",
    imageUrl: "https://placehold.co/600x400?text=Programming+Book"
  },
  {
    name: "Historical Fiction Bestseller",
    description: "Award-winning novel set in ancient Rome",
    price: "15.99",
    stock: 75,
    category: "Books",
    imageUrl: "https://placehold.co/600x400?text=Historical+Fiction"
  },

  // Sports & Outdoors category
  {
    name: "Camping Tent 4-Person",
    description: "Waterproof tent with easy setup for family camping trips",
    price: "129.99",
    stock: 18,
    category: "Sports & Outdoors",
    imageUrl: "https://placehold.co/600x400?text=Camping+Tent"
  },
  {
    name: "Mountain Bike",
    description: "All-terrain bike with 21 speeds and front suspension",
    price: "349.99",
    stock: 10,
    category: "Sports & Outdoors",
    imageUrl: "https://placehold.co/600x400?text=Mountain+Bike"
  },

  // Health & Beauty category
  {
    name: "Vitamin C Serum",
    description: "Anti-aging facial serum with hyaluronic acid",
    price: "24.99",
    stock: 60,
    category: "Health & Beauty",
    imageUrl: "https://placehold.co/600x400?text=Vitamin+C+Serum"
  },
  {
    name: "Electric Toothbrush",
    description: "Rechargeable toothbrush with multiple brushing modes",
    price: "49.99",
    stock: 35,
    category: "Health & Beauty",
    imageUrl: "https://placehold.co/600x400?text=Electric+Toothbrush"
  }
];


async function seedProducts() {
  try {
    console.log("Clearing existing data...");
    // Delete existing data in the proper order to avoid constraint violations
    await prisma.productSimilarity.deleteMany({});
    await prisma.productView.deleteMany({});
    await prisma.sentimentSummary.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    console.log("Existing data cleared successfully");

    // Create a default seller if none exists
    console.log("Finding or creating default seller...");
    let seller = await prisma.user.findFirst({
      where: { email: "seller@example.com" }
    });

    if (!seller) {
      try {
        seller = await prisma.user.create({
          data: {
            name: "Default Seller",
            email: "seller@example.com",
            // Add any other required fields based on your User model
            // If you're using NextAuth, you'll need an email verification and possibly a hashed password
            emailVerified: new Date(),
            role: "SELLER", // If your schema has roles
            image: "https://example.com/default-avatar.png" // Optional profile image
          }
        });
        console.log("Created default seller with ID:", seller.id);
      } catch (userError) {
        console.error("Error creating default seller:", userError);
        // If User model requires fields we don't know about, display the error
        console.error("You may need to add required fields to the User creation");
        throw new Error("Failed to create default seller");
      }
    } else {
      console.log("Using existing seller with ID:", seller.id);
    }

    // Create categories
    console.log("Creating categories...");
    const categoryNames = [...new Set(productsData.map(p => p.category))];
    for (const name of categoryNames) {
      await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
    console.log(`Created ${categoryNames.length} categories`);

    // Get all categories for connecting products
    console.log("Creating products...");
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.name, c]));

    // Create products
    let productsCreated = 0;
    for (const productData of productsData) {
      const { category, ...productDetails } = productData;
      const categoryObject = categoryMap.get(category);

      if (!categoryObject) {
        console.warn(`Category "${category}" not found, skipping relation`);
        continue;
      }

      try {
        await prisma.product.create({
          data: {
            ...productDetails,
            price: parseFloat(productDetails.price),
            stock: parseInt(productDetails.stock || "0"),
            sellerId: seller.id,
            category: category, // Keep string version for backward compatibility
            categories: {
              connect: {
                id: categoryObject.id
              }
            }
          }
        });
        productsCreated++;
      } catch (productError) {
        console.error(`Error creating product "${productData.name}":`, productError);
      }
    }

    console.log(`Successfully created ${productsCreated} products`);

    // Calculate product similarities
    console.log("Calculating product similarities...");
    await calculateProductSimilarities();
    console.log("Product similarities calculated successfully");

    // REMOVED: API call is unnecessary and causing auth issues
  } catch (error) {
    console.error('Failed to seed products:', error);
    console.error(error.stack); // Print the full stack trace
  }
  finally {
    await prisma.$disconnect();
  }
}

// Product similarities calculation function
export async function calculateProductSimilarities() {
  // Get all products
  const products = await prisma.product.findMany({
    include: {
      categories: true,
    },
  });

  // Calculate similarities between all product pairs
  for (const product of products) {
    for (const otherProduct of products) {
      // Don't compare product with itself
      if (product.id === otherProduct.id) continue;

      // Calculate similarity score based on shared categories
      const productCategoryIds = product.categories.map(c => c.id);
      const otherCategoryIds = otherProduct.categories.map(c => c.id);

      // Find shared categories using array methods instead of Set
      const sharedCategories = productCategoryIds.filter(id =>
        otherCategoryIds.includes(id)
      );

      // Simple similarity score calculation
      const categoryScore = sharedCategories.length /
        Math.max(productCategoryIds.length, otherCategoryIds.length);

      // Store or update similarity
      await prisma.productSimilarity.upsert({
        where: {
          productId_similarId: {
            productId: product.id,
            similarId: otherProduct.id,
          }
        },
        update: {
          score: categoryScore,
        },
        create: {
          productId: product.id,
          similarId: otherProduct.id,
          score: categoryScore,
        },
      });
    }
  }
}

// Run the seed function
seedProducts()
  .then(() => console.log("Seeding complete"))
  .catch(e => {
    console.error("Seeding failed:", e);
    process.exit(1);
  });