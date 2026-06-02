const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const tagDefinitions = [
  {
    name: "Thịt Bò",
    slug: "thit-bo",
    prefix: "BO",
    products: [
      "Ba chỉ bò Mỹ cắt lát",
      "Thăn ngoại bò Úc",
      "Lõi vai bò Mỹ",
      "Bắp bò hoa Úc",
      "Nạm bò Úc",
      "Sườn bò rút xương",
      "Diềm thăn bò Mỹ",
      "Thăn nội bò Úc",
      "Chuck roll bò Mỹ",
      "Short plate bò Úc",
      "Ribeye bò Mỹ",
      "Striploin bò Úc",
      "Tenderloin bò Mỹ",
      "Sườn bò Hàn Quốc",
      "Bắp hoa bò Úc",
      "Gân bò tươi",
      "Đuôi bò cắt khúc",
      "Phô mai bò viên",
      "Bò xay nguyên chất",
      "Lúc lắc bò Úc",
    ],
  },
  {
    name: "Thịt Heo",
    slug: "thit-heo",
    prefix: "HEO",
    products: [
      "Ba chỉ heo rút sườn",
      "Sườn non heo",
      "Cốt lết heo",
      "Nạc vai heo",
      "Nạc dăm heo",
      "Chân giò heo",
      "Tai heo tươi",
      "Móng giò heo",
      "Thịt heo xay",
      "Thịt đùi heo",
      "Thăn heo",
      "Sườn già heo",
      "Ba rọi heo xông khói",
      "Giò sống heo",
      "Tim heo",
      "Gan heo",
      "Lưỡi heo",
      "Mè sườn heo",
      "Thịt kho tàu cắt sẵn",
      "Heo quay cắt miếng",
    ],
  },
  {
    name: "Thịt Gà",
    slug: "thit-ga",
    prefix: "GA",
    products: [
      "Gà ta nguyên con",
      "Ức gà phi lê",
      "Đùi gà góc tư",
      "Cánh gà giữa",
      "Chân gà rút xương",
      "Lòng gà sạch",
      "Đùi gà rút xương",
      "Má đùi gà",
      "Gà ác nguyên con",
      "Gà tre nguyên con",
      "Gà thả vườn",
      "Ức gà xông khói",
      "Gà viên chiên",
      "Cánh gà sốt cay",
      "Đùi gà tẩm mật ong",
      "Gà xay nguyên chất",
      "Cổ gà cắt khúc",
      "Sườn sụn gà",
      "Gà nướng lá chanh",
      "Gà hầm thuốc bắc",
    ],
  },
  {
    name: "Xúc xích",
    slug: "xuc-xich",
    prefix: "XX",
    products: [
      "Xúc xích Đức Bratwurst",
      "Xúc xích Frankfurter",
      "Xúc xích Vienna",
      "Xúc xích phô mai",
      "Xúc xích xông khói",
      "Xúc xích bò tiêu đen",
      "Xúc xích gà ít béo",
      "Xúc xích heo truyền thống",
      "Xúc xích cay Mexico",
      "Xúc xích BBQ",
      "Xúc xích cocktail",
      "Xúc xích bí đỏ",
      "Xúc xích thịt nguội",
      "Xúc xích tỏi",
      "Xúc xích pepperoni",
      "Xúc xích Italian",
      "Xúc xích hồng khói",
      "Xúc xích premium",
      "Xúc xích trẻ em",
      "Xúc xích hotdog",
    ],
  },
  {
    name: "Đồ hộp",
    slug: "do-hop",
    prefix: "DH",
    products: [
      "Cá ngừ đồ hộp",
      "Cá hồi sốt cà",
      "Bò hầm đồ hộp",
      "Heo hầm đồ hộp",
      "Gà hầm đồ hộp",
      "Pate gan heo",
      "Pate gan gà",
      "Thịt xay đóng hộp",
      "Cá mòi sốt cà",
      "Cá trích ngâm dầu",
      "Spam thịt hộp",
      "Bò sốt tiêu hộp",
      "Heo kho trứng hộp",
      "Gà cà ri hộp",
      "Xúc xích hộp",
      "Thịt viên sốt cà hộp",
      "Cá thu sốt cà hộp",
      "Cá sardine hộp",
      "Thịt nguội hộp",
      "Bò lúc lắc hộp",
    ],
  },
  {
    name: "Nhập khẩu",
    slug: "nhap-khau",
    prefix: "NK",
    products: [
      "Wagyu A5 Nhật Bản",
      "Bò Angus Mỹ",
      "Bò Black Angus Úc",
      "Heo Iberico Tây Ban Nha",
      "Sườn cừu New Zealand",
      "Đùi cừu Úc",
      "Ức vịt Pháp",
      "Xúc xích Đức nhập khẩu",
      "Salami Ý",
      "Pepperoni Mỹ",
      "Thịt nguội Parma",
      "Bacon Canada",
      "Gà tây Mỹ",
      "Bò Kobe Nhật Bản",
      "Sườn bò Mỹ prime",
      "Thăn bò Argentina",
      "Bò Brazil cắt lát",
      "Heo Kurobuta Nhật",
      "Gà Pháp Label Rouge",
      "Cá hồi Na Uy đông lạnh",
    ],
  },
  {
    name: "Khuyến mãi",
    slug: "khuyen-mai",
    prefix: "KM",
    products: [
      "Combo lẩu bò giá tốt",
      "Combo BBQ gia đình",
      "Ba chỉ bò sale",
      "Sườn heo ưu đãi",
      "Ức gà tiết kiệm",
      "Xúc xích combo 5 gói",
      "Đồ hộp mua 2 tặng 1",
      "Bò xay giá sốc",
      "Gà viên combo",
      "Heo xay ưu đãi",
      "Cánh gà giá tốt",
      "Bắp bò khuyến mãi",
      "Cốt lết heo sale",
      "Ribeye bò ưu đãi",
      "Đùi gà combo",
      "Pate hộp sale",
      "Bacon giá tốt",
      "Sườn bò BBQ sale",
      "Hotdog combo",
      "Thịt nguội ưu đãi",
    ],
  },
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildProduct(tag, name, index, adminId) {
  const basePrice = 65000 + index * 12000 + tag.prefix.length * 5000;
  const salePrice =
    tag.slug === "khuyen-mai"
      ? Math.round(basePrice * 0.85)
      : index % 4 === 0
        ? Math.round(basePrice * 0.92)
        : null;

  return {
    name,
    slug: `${tag.slug}-${slugify(name)}`,
    description: `${name} được chọn lọc cho cửa hàng thịt sạch, phù hợp nấu ăn hằng ngày và tiệc gia đình.`,
    shortDescription: `${name} chất lượng cao, đóng gói tiện lợi.`,
    price: basePrice,
    salePrice,
    stock: 35 + index * 3,
    sku: `${tag.prefix}-${String(index).padStart(2, "0")}`,
    isPublished: true,
    createdById: adminId,
  };
}

async function main() {
  console.log("Bắt đầu seed dữ liệu...");

  await prisma.paymentTransaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.supportRequest.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.newsReaction.deleteMany();
  await prisma.newsComment.deleteMany();
  await prisma.news.deleteMany();
  await prisma.productTagOnProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.user.deleteMany();

  console.log("Đã xóa dữ liệu cũ");

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const commonPassword = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      fullName: "Super Admin",
      email: "admin@meatshop.vn",
      password: adminPassword,
      phone: "0901234567",
      address: "123 Lê Lợi, Quận 1, TP.HCM",
      role: "ADMIN",
      isVerified: true,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      fullName: "Nguyễn Văn Staff",
      email: "staff1@meatshop.vn",
      password: commonPassword,
      phone: "0912345678",
      address: "456 Nguyễn Huệ, Quận 1, TP.HCM",
      role: "STAFF",
      isVerified: true,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      fullName: "Trần Thị Staff",
      email: "staff2@meatshop.vn",
      password: commonPassword,
      phone: "0923456789",
      address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
      role: "STAFF",
      isVerified: true,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      fullName: "Lê Văn Khách",
      email: "user1@gmail.com",
      password: commonPassword,
      phone: "0934567890",
      address: "100 Đinh Tiên Hoàng, Quận Bình Thạnh, TP.HCM",
      role: "USER",
      isVerified: true,
    },
  });

  console.log("Đã tạo người dùng:", {
    admin: admin.email,
    staff1: staff1.email,
    staff2: staff2.email,
    user1: user1.email,
  });

  const tags = await Promise.all(
    tagDefinitions.map((tag) =>
      prisma.productTag.create({
        data: {
          name: tag.name,
          slug: tag.slug,
        },
      }),
    ),
  );

  const tagBySlug = new Map(tags.map((tag) => [tag.slug, tag]));
  console.log(
    "Đã tạo tag:",
    tags.map((tag) => tag.name),
  );

  let productCount = 0;

  for (const tagDefinition of tagDefinitions) {
    const tag = tagBySlug.get(tagDefinition.slug);

    for (const [index, productName] of tagDefinition.products.entries()) {
      await prisma.product.create({
        data: {
          ...buildProduct(tagDefinition, productName, index + 1, admin.id),
          images: "[]",
          tags: {
            create: {
              tagId: tag.id,
            },
          },
        },
      });
      productCount += 1;
    }
  }

  console.log(`Đã tạo ${productCount} sản phẩm`);

  const supportRequest = await prisma.supportRequest.create({
    data: {
      userId: user1.id,
      assignedStaffId: staff1.id,
      status: "ACTIVE",
      title: "Hỏi về sản phẩm",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        supportRequestId: supportRequest.id,
        senderId: user1.id,
        content: "Xin chào, tôi muốn hỏi về sản phẩm thịt bò.",
      },
      {
        supportRequestId: supportRequest.id,
        senderId: staff1.id,
        content: "Chào bạn, cửa hàng có nhiều sản phẩm thịt bò đang còn hàng.",
      },
    ],
  });

  console.log("Đã tạo yêu cầu hỗ trợ mẫu kèm tin nhắn");
  console.log("Seed dữ liệu thành công!");
}

main()
  .catch((err) => {
    console.error("Seed dữ liệu thất bại:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
