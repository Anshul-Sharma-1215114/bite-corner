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

  // PLACEHOLDER MENU — Italian + Chinese fast food, standing in until the
  // real Bite Corner logo/menu image is provided. Swap this array (and the
  // logo component) once it arrives; nothing else needs to change.
  console.log("Seeding categories...");
  const categoryNames = ["Pizza", "Pasta", "Starters", "Chinese Mains", "Noodles & Rice", "Beverages"];
  const categories: Record<string, string> = {};
  for (const [i, name] of categoryNames.entries()) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: i },
    });
    categories[name] = category.id;
  }

  console.log("Seeding menu items...");
  const menuItemsData = [
    // Pizza
    { name: "Margherita Pizza", description: "Classic tomato, mozzarella and basil on a hand-tossed base.", price: 199, isVeg: true, category: "Pizza" },
    { name: "Pepperoni Pizza", description: "Loaded with spicy pepperoni and extra cheese.", price: 279, isVeg: false, category: "Pizza" },
    { name: "Farmhouse Pizza", description: "Onion, capsicum, tomato, mushroom and sweet corn.", price: 249, isVeg: true, category: "Pizza" },
    // Pasta
    { name: "Penne Alfredo", description: "Creamy white sauce pasta with garlic and herbs.", price: 219, isVeg: true, category: "Pasta" },
    { name: "Arrabiata Pasta", description: "Penne in a spicy red tomato-chilli sauce.", price: 209, isVeg: true, category: "Pasta" },
    { name: "Chicken Alfredo", description: "Alfredo pasta tossed with grilled chicken chunks.", price: 259, isVeg: false, category: "Pasta" },
    // Starters
    { name: "Garlic Bread", description: "Toasted baguette with garlic butter and herbs.", price: 129, isVeg: true, category: "Starters" },
    { name: "Cheese Nachos", description: "Crispy nachos loaded with molten cheese and salsa.", price: 159, isVeg: true, category: "Starters" },
    { name: "Chicken Wings", description: "Crispy fried wings tossed in a smoky glaze.", price: 199, isVeg: false, category: "Starters" },
    { name: "Veg Spring Rolls (6 pcs)", description: "Crispy rolls stuffed with stir-fried vegetables.", price: 149, isVeg: true, category: "Starters" },
    // Chinese Mains
    { name: "Veg Manchurian", description: "Deep-fried veg balls in a tangy Indo-Chinese sauce.", price: 179, isVeg: true, category: "Chinese Mains" },
    { name: "Chilli Chicken", description: "Wok-tossed chicken with onions, peppers and chilli.", price: 229, isVeg: false, category: "Chinese Mains" },
    { name: "Paneer Chilli", description: "Crispy paneer tossed in a spicy Indo-Chinese glaze.", price: 209, isVeg: true, category: "Chinese Mains" },
    { name: "Momos (Steamed, 8 pcs)", description: "Steamed veg momos served with spicy chutney.", price: 139, isVeg: true, category: "Chinese Mains" },
    // Noodles & Rice
    { name: "Veg Hakka Noodles", description: "Stir-fried noodles with fresh vegetables.", price: 159, isVeg: true, category: "Noodles & Rice" },
    { name: "Chicken Fried Rice", description: "Classic wok-fried rice with chicken and egg.", price: 199, isVeg: false, category: "Noodles & Rice" },
    { name: "Schezwan Fried Rice", description: "Spicy schezwan-style fried rice with vegetables.", price: 179, isVeg: true, category: "Noodles & Rice" },
    // Beverages
    { name: "Coke (500ml)", description: "Chilled Coca-Cola.", price: 60, isVeg: true, category: "Beverages" },
    { name: "Fresh Lime Soda", description: "Sweet, salty or mixed — served ice cold.", price: 70, isVeg: true, category: "Beverages" },
    { name: "Cold Coffee", description: "Blended cold coffee topped with ice cream.", price: 99, isVeg: true, category: "Beverages" },
  ];

  const menuItemIdByName: Record<string, string> = {};
  for (const item of menuItemsData) {
    const id = `${item.category}-${item.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const created = await prisma.menuItem.upsert({
      where: { id },
      update: { description: item.description, price: item.price, isVeg: item.isVeg, categoryId: categories[item.category], available: true },
      create: { id, name: item.name, description: item.description, price: item.price, isVeg: item.isVeg, categoryId: categories[item.category] },
    });
    menuItemIdByName[item.name] = created.id;
  }

  console.log("Seeding combos...");
  await prisma.combo.upsert({
    where: { id: "combo-italian-feast" },
    update: {},
    create: {
      id: "combo-italian-feast",
      name: "Italian Feast Combo",
      description: "Margherita Pizza + Penne Alfredo + Garlic Bread — a complete Italian meal for one.",
      price: 449,
      items: {
        create: [
          { menuItemId: menuItemIdByName["Margherita Pizza"], quantity: 1, swappable: true },
          { menuItemId: menuItemIdByName["Penne Alfredo"], quantity: 1, swappable: true },
          { menuItemId: menuItemIdByName["Garlic Bread"], quantity: 1, swappable: false },
        ],
      },
    },
  });
  await prisma.combo.upsert({
    where: { id: "combo-chinese-platter" },
    update: {},
    create: {
      id: "combo-chinese-platter",
      name: "Chinese Platter Combo",
      description: "Veg Hakka Noodles + Veg Manchurian + Spring Rolls — Indo-Chinese favorites in one box.",
      price: 379,
      items: {
        create: [
          { menuItemId: menuItemIdByName["Veg Hakka Noodles"], quantity: 1, swappable: true },
          { menuItemId: menuItemIdByName["Veg Manchurian"], quantity: 1, swappable: true },
          { menuItemId: menuItemIdByName["Veg Spring Rolls (6 pcs)"], quantity: 1, swappable: false },
        ],
      },
    },
  });

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
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@bitecorner.local" },
    update: {},
    create: { role: "ADMIN", name: "Bite Corner Admin", email: "admin@bitecorner.local", passwordHash: adminPasswordHash },
  });

  const agentPasswordHash = await bcrypt.hash("agent123", 10);
  const agent = await prisma.user.upsert({
    where: { email: "agent1@bitecorner.local" },
    update: {},
    create: { role: "DELIVERY_AGENT", name: "Raj Kumar", email: "agent1@bitecorner.local", phone: "9000000011", passwordHash: agentPasswordHash },
  });
  await prisma.deliveryAgentProfile.upsert({
    where: { userId: agent.id },
    update: {},
    create: { userId: agent.id, isAvailable: true, isActive: true },
  });

  console.log("Seed complete.");
  console.log("  Admin login:  admin@bitecorner.local / admin123");
  console.log("  Agent login:  agent1@bitecorner.local / agent123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
