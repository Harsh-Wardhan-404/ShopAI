/**
 * Run this script to seed products with categories
 * 
 * Usage: node scripts/seed-products.js
 */

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
    const response = await fetch('http://localhost:3000/api/seed/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: productsData
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Success:', result);
    } else {
      console.error('Error:', result);
    }
  } catch (error) {
    console.error('Failed to seed products:', error);
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  console.log('Seeding products...');
  seedProducts();
}
