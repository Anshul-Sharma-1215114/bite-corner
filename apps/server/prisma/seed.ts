import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding shop config...");
  await prisma.shopConfig.upsert({
    where: { id: "shop_config" },
    update: {},
    create: {
      id: "shop_config",
      name: "Bite Corner",
      deliveryFee: 40,
      minOrderValue: 149,
      taxPercent: 5,
      openTime: "11:00",
      closeTime: "23:00",
      // Placeholder — replace with the real address once available.
      address: "45 MG Road, Indore 452001",
      // Placeholder VPA — replace with the real one in Settings.
      upiId: "bitecorner@upi",
      whatsappNumber: "+919999900000",
    },
  });

  // Real Bite Corner menu, transcribed from the shop's printed menu board.
  console.log("Seeding categories...");
  const categoryNames = ["Pizza", "Pizza Mania", "Add-ons", "Pasta", "Sides", "Noodles", "Starters", "Rice", "Rolls", "Burgers", "Fries"];
  const categories: Record<string, string> = {};
  for (const [i, name] of categoryNames.entries()) {
    const category = await prisma.category.upsert({
      where: { name },
      update: { sortOrder: i },
      create: { name, sortOrder: i },
    });
    categories[name] = category.id;
  }

  console.log("Seeding menu items...");
  // Free-to-use Unsplash photos, one per dish concept and reused across
  // its Regular/Medium or Gravy/Dry variants — not a unique photo per SKU,
  // but real, appetizing photos instead of the blank placeholder icon.
  const IMG_PIZZA_VEG = "https://images.unsplash.com/photo-1551978129-b73f45d132eb?auto=format&fit=crop&w=800&q=70";
  const IMG_PIZZA_CLASSIC = "https://images.unsplash.com/photo-1517685645259-c6caddb7165d?auto=format&fit=crop&w=800&q=70";
  const IMG_PASTA_RED = "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=70";
  const IMG_PASTA_WHITE = "https://images.unsplash.com/photo-1484325881845-65073528922e?auto=format&fit=crop&w=800&q=70";
  const IMG_GARLIC_BREAD = "https://images.unsplash.com/photo-1556008531-57e6eefc7be4?auto=format&fit=crop&w=800&q=70";
  const IMG_NOODLES = "https://images.unsplash.com/photo-1578419997901-b409e7e400b8?auto=format&fit=crop&w=800&q=70";
  const IMG_FRIED_RICE = "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=70";
  const IMG_SPRING_ROLL = "https://images.unsplash.com/photo-1515022376298-7333f33e704b?auto=format&fit=crop&w=800&q=70";
  const IMG_BURGER = "https://images.unsplash.com/photo-1569691802417-e5e1ec314e81?auto=format&fit=crop&w=800&q=70";
  const IMG_FRIES = "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=70";

  const menuItemsData = [
    // Pizza (Regular / Medium)
    { name: "Veggie Paradise Pizza (Regular)", description: "A loaded classic veggie mix on a hand-tossed regular base.", price: 170, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Veggie Paradise Pizza (Medium)", description: "A loaded classic veggie mix on a hand-tossed medium base.", price: 280, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Fresh Veggie Pizza (Regular)", description: "Crisp seasonal vegetables on a regular base.", price: 170, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Fresh Veggie Pizza (Medium)", description: "Crisp seasonal vegetables on a medium base.", price: 280, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Achari Do Pyaaza Pizza (Regular)", description: "Tangy achari sauce loaded with double onions, regular base.", price: 170, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Achari Do Pyaaza Pizza (Medium)", description: "Tangy achari sauce loaded with double onions, medium base.", price: 280, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Mexican Green Wave Pizza (Regular)", description: "Mexican herbs, jalapeño and bell peppers, regular base.", price: 170, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Mexican Green Wave Pizza (Medium)", description: "Mexican herbs, jalapeño and bell peppers, medium base.", price: 280, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Deluxe Veggie Pizza (Regular)", description: "An extra-loaded veggie pizza, regular base.", price: 170, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Deluxe Veggie Pizza (Medium)", description: "An extra-loaded veggie pizza, medium base.", price: 280, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Veg Extravaganza Pizza (Regular)", description: "The works — every veggie topping, regular base.", price: 170, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Veg Extravaganza Pizza (Medium)", description: "The works — every veggie topping, medium base.", price: 280, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_VEG },
    { name: "Farm House Pizza (Regular)", description: "Onion, capsicum, tomato and sweet corn, regular base.", price: 240, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Farm House Pizza (Medium)", description: "Onion, capsicum, tomato and sweet corn, medium base.", price: 370, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Pasta Pizza (Regular)", description: "Creamy pasta-topped fusion pizza, regular base.", price: 240, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Pasta Pizza (Medium)", description: "Creamy pasta-topped fusion pizza, medium base.", price: 370, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Margarita Pizza (Regular)", description: "Classic tomato and mozzarella, regular base.", price: 240, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Margarita Pizza (Medium)", description: "Classic tomato and mozzarella, medium base.", price: 370, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Paneer Makhani Pizza (Regular)", description: "Rich makhani-spiced paneer, regular base.", price: 250, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Paneer Makhani Pizza (Medium)", description: "Rich makhani-spiced paneer, medium base.", price: 400, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Peppy Paneer Pizza (Regular)", description: "Paneer and bell peppers with a peppy kick, regular base.", price: 250, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Peppy Paneer Pizza (Medium)", description: "Paneer and bell peppers with a peppy kick, medium base.", price: 400, isVeg: true, category: "Pizza", imageUrl: IMG_PIZZA_CLASSIC },
    // Pizza Mania
    { name: "Onion Pizza", description: "Simple and classic, topped with fresh onion.", price: 99, isVeg: true, category: "Pizza Mania", imageUrl: IMG_PIZZA_VEG },
    { name: "Tomato Pizza", description: "Simple and classic, topped with fresh tomato.", price: 99, isVeg: true, category: "Pizza Mania", imageUrl: IMG_PIZZA_VEG },
    { name: "Capsicum Pizza", description: "Topped with crisp capsicum.", price: 109, isVeg: true, category: "Pizza Mania", imageUrl: IMG_PIZZA_VEG },
    { name: "Golden Corn Pizza", description: "Topped with sweet golden corn.", price: 119, isVeg: true, category: "Pizza Mania", imageUrl: IMG_PIZZA_VEG },
    { name: "Paneer Pizza", description: "Topped with soft paneer cubes.", price: 129, isVeg: true, category: "Pizza Mania", imageUrl: IMG_PIZZA_VEG },
    { name: "Tomato Golden Corn Pizza", description: "Tomato and sweet corn together.", price: 139, isVeg: true, category: "Pizza Mania", imageUrl: IMG_PIZZA_VEG },
    { name: "Paneer Onion Pizza", description: "Paneer and onion combo.", price: 149, isVeg: true, category: "Pizza Mania", imageUrl: IMG_PIZZA_VEG },
    { name: "Capsicum Onion Tomato Pizza", description: "A triple-veggie classic.", price: 170, isVeg: true, category: "Pizza Mania", imageUrl: IMG_PIZZA_VEG },
    // Add-ons
    { name: "Extra Cheese (Regular)", description: "Extra layer of mozzarella on a regular pizza.", price: 40, isVeg: true, category: "Add-ons", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Extra Cheese (Medium)", description: "Extra layer of mozzarella on a medium pizza.", price: 70, isVeg: true, category: "Add-ons", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Cheese Burst (Regular)", description: "Molten cheese stuffed into the crust, regular.", price: 70, isVeg: true, category: "Add-ons", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Cheese Burst (Medium)", description: "Molten cheese stuffed into the crust, medium.", price: 99, isVeg: true, category: "Add-ons", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Cheddar Cheese Burst (Regular)", description: "Cheddar-stuffed crust, regular.", price: 99, isVeg: true, category: "Add-ons", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Cheddar Cheese Burst (Medium)", description: "Cheddar-stuffed crust, medium.", price: 119, isVeg: true, category: "Add-ons", imageUrl: IMG_PIZZA_CLASSIC },
    { name: "Cheddar Cheese Dip", description: "Side dip of melted cheddar.", price: 35, isVeg: true, category: "Add-ons", imageUrl: IMG_GARLIC_BREAD },
    { name: "White Cheese Dip", description: "Creamy white cheese dip.", price: 25, isVeg: true, category: "Add-ons", imageUrl: IMG_GARLIC_BREAD },
    // Pasta
    { name: "Red Sauce Pasta", description: "Penne tossed in a tangy tomato-basil sauce.", price: 139, isVeg: true, category: "Pasta", imageUrl: IMG_PASTA_RED },
    { name: "White Sauce Pasta", description: "Penne in a creamy white sauce with herbs.", price: 159, isVeg: true, category: "Pasta", imageUrl: IMG_PASTA_WHITE },
    { name: "Bite Corner Special Pasta", description: "House-special pasta in a mixed red-white sauce.", price: 199, isVeg: true, category: "Pasta", imageUrl: IMG_PASTA_RED },
    // Sides
    { name: "Garlic Bread", description: "Toasted bread with garlic butter.", price: 90, isVeg: true, category: "Sides", imageUrl: IMG_GARLIC_BREAD },
    { name: "Cheese Garlic Bread", description: "Garlic bread topped with molten cheese.", price: 130, isVeg: true, category: "Sides", imageUrl: IMG_GARLIC_BREAD },
    { name: "Stuffed Garlic Bread", description: "Garlic bread stuffed with a cheesy filling.", price: 159, isVeg: true, category: "Sides", imageUrl: IMG_GARLIC_BREAD },
    // Noodles
    { name: "Veg Noodles", description: "Classic stir-fried noodles with vegetables.", price: 89, isVeg: true, category: "Noodles", imageUrl: IMG_NOODLES },
    { name: "Hakka Noodles", description: "Wok-tossed Hakka-style noodles.", price: 99, isVeg: true, category: "Noodles", imageUrl: IMG_NOODLES },
    { name: "Red Chilli Garlic Noodles", description: "Noodles tossed in a fiery red chilli-garlic sauce.", price: 99, isVeg: true, category: "Noodles", imageUrl: IMG_NOODLES },
    { name: "Schezwan Noodles", description: "Spicy schezwan-style stir-fried noodles.", price: 99, isVeg: true, category: "Noodles", imageUrl: IMG_NOODLES },
    { name: "Noodles Manchurian", description: "Noodles topped with veg Manchurian sauce.", price: 119, isVeg: true, category: "Noodles", imageUrl: IMG_NOODLES },
    { name: "Lemon Coriander Noodles", description: "Noodles tossed with zesty lemon and coriander.", price: 119, isVeg: true, category: "Noodles", imageUrl: IMG_NOODLES },
    { name: "Mushroom Chilli Noodles", description: "Noodles tossed with mushroom and chilli.", price: 119, isVeg: true, category: "Noodles", imageUrl: IMG_NOODLES },
    { name: "Thecha Noodles", description: "Noodles with a fiery Maharashtrian thecha kick.", price: 129, isVeg: true, category: "Noodles", imageUrl: IMG_NOODLES },
    { name: "Burn Garlic Noodles", description: "Noodles loaded with charred garlic.", price: 129, isVeg: true, category: "Noodles", imageUrl: IMG_NOODLES },
    { name: "Noodle Manchurian With Paneer", description: "Noodles topped with paneer Manchurian.", price: 159, isVeg: true, category: "Noodles", imageUrl: IMG_NOODLES },
    // Starters
    { name: "Manchurian (Gravy)", description: "Veg Manchurian balls in a tangy gravy.", price: 99, isVeg: true, category: "Starters", imageUrl: IMG_NOODLES },
    { name: "Manchurian (Dry)", description: "Veg Manchurian balls tossed dry.", price: 119, isVeg: true, category: "Starters", imageUrl: IMG_NOODLES },
    { name: "Chilli Paneer (Gravy)", description: "Crispy paneer in a spicy Indo-Chinese gravy.", price: 149, isVeg: true, category: "Starters", imageUrl: IMG_NOODLES },
    { name: "Chilli Paneer (Dry)", description: "Crispy paneer tossed dry with chilli and peppers.", price: 159, isVeg: true, category: "Starters", imageUrl: IMG_NOODLES },
    { name: "Honey Chilli Potato", description: "Crispy potato tossed in sweet-spicy honey chilli glaze.", price: 139, isVeg: true, category: "Starters", imageUrl: IMG_FRIES },
    { name: "Crispy Corn", description: "Golden fried crispy corn kernels.", price: 139, isVeg: true, category: "Starters", imageUrl: IMG_FRIED_RICE },
    { name: "Chinese Bhel", description: "Crunchy Indo-Chinese street-style bhel.", price: 149, isVeg: true, category: "Starters", imageUrl: IMG_FRIED_RICE },
    // Rice
    { name: "Fried Rice", description: "Classic wok-fried rice with vegetables.", price: 99, isVeg: true, category: "Rice", imageUrl: IMG_FRIED_RICE },
    { name: "Schezwan Rice", description: "Spicy schezwan-style fried rice.", price: 109, isVeg: true, category: "Rice", imageUrl: IMG_FRIED_RICE },
    { name: "Rice Manchurian", description: "Fried rice topped with veg Manchurian sauce.", price: 129, isVeg: true, category: "Rice", imageUrl: IMG_FRIED_RICE },
    { name: "Burn Garlic Rice", description: "Fried rice loaded with charred garlic.", price: 139, isVeg: true, category: "Rice", imageUrl: IMG_FRIED_RICE },
    { name: "Chilli Garlic Rice", description: "Fried rice tossed in chilli-garlic sauce.", price: 129, isVeg: true, category: "Rice", imageUrl: IMG_FRIED_RICE },
    { name: "Paneer Fried Rice", description: "Fried rice tossed with paneer cubes.", price: 149, isVeg: true, category: "Rice", imageUrl: IMG_FRIED_RICE },
    { name: "Rice Manchurian With Paneer", description: "Fried rice topped with paneer Manchurian.", price: 169, isVeg: true, category: "Rice", imageUrl: IMG_FRIED_RICE },
    // Rolls
    { name: "Noodle Roll", description: "Stir-fried noodles rolled in a soft paratha.", price: 90, isVeg: true, category: "Rolls", imageUrl: IMG_SPRING_ROLL },
    { name: "Manchurian Roll", description: "Veg Manchurian rolled in a soft paratha.", price: 90, isVeg: true, category: "Rolls", imageUrl: IMG_SPRING_ROLL },
    { name: "Spring Roll", description: "Crispy rolls stuffed with stir-fried vegetables.", price: 100, isVeg: true, category: "Rolls", imageUrl: IMG_SPRING_ROLL },
    { name: "Tandoori Paneer Roll", description: "Tandoori-spiced paneer rolled in a soft paratha.", price: 120, isVeg: true, category: "Rolls", imageUrl: IMG_SPRING_ROLL },
    { name: "Paneer Makhni Roll", description: "Makhani-spiced paneer rolled in a soft paratha.", price: 140, isVeg: true, category: "Rolls", imageUrl: IMG_SPRING_ROLL },
    { name: "Paneer Cheese Cigar Roll (6 Pcs)", description: "Crispy cigar rolls stuffed with paneer and cheese.", price: 180, isVeg: true, category: "Rolls", imageUrl: IMG_SPRING_ROLL },
    { name: "Cheese Corn Cigar Roll (6 Pcs)", description: "Crispy cigar rolls stuffed with cheese and corn.", price: 160, isVeg: true, category: "Rolls", imageUrl: IMG_SPRING_ROLL },
    // Burgers
    { name: "Crispy Veg Burger", description: "Crispy veg patty with fresh veggies and sauces.", price: 60, isVeg: true, category: "Burgers", imageUrl: IMG_BURGER },
    { name: "Makhani Burger", description: "Makhani-spiced patty burger.", price: 80, isVeg: true, category: "Burgers", imageUrl: IMG_BURGER },
    { name: "BC Veg Burger", description: "The house special Bite Corner veg burger.", price: 90, isVeg: true, category: "Burgers", imageUrl: IMG_BURGER },
    { name: "Veg Whopper Burger", description: "A hearty, extra-large veg patty burger.", price: 110, isVeg: true, category: "Burgers", imageUrl: IMG_BURGER },
    // Fries
    { name: "Salted Fries", description: "Classic crispy salted fries.", price: 80, isVeg: true, category: "Fries", imageUrl: IMG_FRIES },
    { name: "Peri-Peri Fries", description: "Crispy fries tossed in peri-peri seasoning.", price: 120, isVeg: true, category: "Fries", imageUrl: IMG_FRIES },
    { name: "Cheese Fries", description: "Crispy fries loaded with melted cheese.", price: 140, isVeg: true, category: "Fries", imageUrl: IMG_FRIES },
  ];

  const currentMenuItemIds = new Set<string>();
  for (const item of menuItemsData) {
    const id = `${item.category}-${item.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    currentMenuItemIds.add(id);
    await prisma.menuItem.upsert({
      where: { id },
      update: { description: item.description, price: item.price, isVeg: item.isVeg, categoryId: categories[item.category], available: true, imageUrl: item.imageUrl },
      create: { id, name: item.name, description: item.description, price: item.price, isVeg: item.isVeg, categoryId: categories[item.category], imageUrl: item.imageUrl },
    });
  }

  // Drop earlier placeholder combos, menu items and categories that aren't
  // part of the real menu above (safe pre-launch, before any real orders
  // reference them).
  console.log("Removing stale placeholder data...");
  await prisma.combo.deleteMany({});
  await prisma.menuItem.deleteMany({ where: { id: { notIn: Array.from(currentMenuItemIds) } } });
  await prisma.category.deleteMany({ where: { name: { notIn: categoryNames } } });

  console.log("Seeding coupons...");
  const now = new Date();
  const oneYearOut = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  await prisma.coupon.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: { code: "WELCOME20", type: "PERCENT", value: 20, minOrderValue: 199, maxDiscount: 100, validFrom: now, validTo: oneYearOut, usageLimit: null },
  });
  await prisma.coupon.upsert({
    where: { code: "FLAT50" },
    update: {},
    create: { code: "FLAT50", type: "FLAT", value: 50, minOrderValue: 299, validFrom: now, validTo: oneYearOut, usageLimit: null },
  });

  console.log("Seeding admin and delivery agent accounts...");
  // Overridable via env so production (Render) can seed strong, private
  // passwords instead of these local-dev-only defaults — never hardcode
  // the real production password here, since this file is public.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const agentPassword = process.env.SEED_AGENT_PASSWORD ?? "agent123";

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: "admin@bitecorner.local" },
    update: { passwordHash: adminPasswordHash },
    create: { role: "ADMIN", name: "Bite Corner Admin", email: "admin@bitecorner.local", passwordHash: adminPasswordHash },
  });

  const agentPasswordHash = await bcrypt.hash(agentPassword, 10);
  const agent = await prisma.user.upsert({
    where: { email: "agent1@bitecorner.local" },
    update: { passwordHash: agentPasswordHash },
    create: { role: "DELIVERY_AGENT", name: "Raj Kumar", email: "agent1@bitecorner.local", phone: "9000000011", passwordHash: agentPasswordHash },
  });
  await prisma.deliveryAgentProfile.upsert({
    where: { userId: agent.id },
    update: {},
    create: { userId: agent.id, isAvailable: true, isActive: true },
  });

  console.log("Seed complete.");
  console.log(`  Admin login:  admin@bitecorner.local / ${adminPassword}`);
  console.log(`  Agent login:  agent1@bitecorner.local / ${agentPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
