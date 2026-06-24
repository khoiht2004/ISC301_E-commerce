const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const tags = [
  { name: "Thịt bò", slug: "thit-bo" },
  { name: "Thịt heo", slug: "thit-heo" },
  { name: "Thịt gà", slug: "thit-ga" },
  { name: "Xúc xích", slug: "xuc-xich" },
  { name: "Đồ hộp", slug: "do-hop" },
  { name: "Khuyến mãi", slug: "khuyen-mai" },
];

const suppliers = [
  {
    name: "MeatDeli",
    email: "contact@meatdeli.vn",
    phone: "0911000001",
    address: "Khu chế xuất Tân Thuận, Q7, TP.HCM",
    description: "Nhà cung cấp thịt heo sạch, công nghệ làm lạnh chuẩn Âu.",
    products: [
      "Ba chỉ heo rút sườn",
      "Sườn non heo",
      "Cốt lết heo",
      "Nạc vai heo",
      "Nạc dăm heo",
      "Chân giò heo",
      "Tai heo tươi",
    ],
  },
  {
    name: "CP Foods",
    email: "contact@cp.com.vn",
    phone: "0911000002",
    address: "KCN Biên Hòa 2, Đồng Nai",
    description: "Nhà cung cấp thịt gà và các sản phẩm chế biến từ gà lớn nhất Việt Nam.",
    products: [
      "Gà ta nguyên con",
      "Ức gà phi lê",
      "Đùi gà góc tư",
      "Cánh gà giữa",
      "Chân gà rút xương",
      "Lòng gà sạch",
      "Đùi gà rút xương",
    ],
  },
  {
    name: "Úc/Mỹ (Nhập khẩu)",
    email: "import@meatshop.vn",
    phone: "0911000003",
    address: "Khu công nghiệp Cát Lái, Q2, TP.HCM",
    description: "Nhà cung cấp chuyên nhập khẩu thịt bò Úc, Mỹ chất lượng cao.",
    products: [
      "Ba chỉ bò Mỹ cắt lát",
      "Thăn ngoại bò Úc",
      "Lõi vai bò Mỹ",
      "Bắp bò hoa Úc",
      "Nạm bò Úc",
      "Sườn bò rút xương",
      "Diềm thăn bò Mỹ",
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

async function main() {
  console.log("Bắt đầu seed dữ liệu (Mô hình B2C)...");

  // Xóa dữ liệu cũ theo thứ tự liên kết
  await prisma.paymentTransaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.supportRequest.deleteMany();
  await prisma.orderComplaint.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productBatch.deleteMany();
  await prisma.productTagOnProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const commonPassword = await bcrypt.hash("password123", 12);

  // 1. Tạo Admin
  const admin = await prisma.user.create({
    data: {
      fullName: "Quản trị viên",
      email: "admin@meatshop.vn",
      password: adminPassword,
      phone: "0901234567",
      address: "123 Lê Lợi, Quận 1, TP.HCM",
      role: "ADMIN",
      isVerified: true,
      userProfile: {
        create: {
          bio: "Admin tổng hệ thống",
        }
      }
    },
  });

  // 2. Tạo Staff (Quản lý chung, không thuộc nhóm vendor nào nữa)
  const staff = await prisma.user.create({
    data: {
      fullName: "Nhân viên Kho",
      email: "staff@meatshop.vn",
      password: commonPassword,
      phone: "0988000111",
      address: "Kho trung tâm TP.HCM",
      role: "STAFF",
      isVerified: true,
      userProfile: {
        create: {
          bio: "Nhân viên kiểm kho và vận hành đơn",
        }
      }
    },
  });

  // 3. Tạo Customer
  const customer = await prisma.user.create({
    data: {
      fullName: "Lê Văn Khách",
      email: "user1@gmail.com",
      password: commonPassword,
      phone: "0934567890",
      address: "100 Đinh Tiên Hoàng, Quận Bình Thạnh, TP.HCM",
      role: "USER",
      isVerified: true,
      userProfile: {
        create: {
          gender: "Male"
        }
      }
    },
  });

  // 4. Tạo Tags
  const createdTags = await Promise.all(
    tags.map((tag) => prisma.productTag.create({ data: tag }))
  );
  const tagBySlug = new Map(createdTags.map((tag) => [tag.slug, tag]));

  // 5. Tạo Suppliers và Products, ProductBatches
  const createdProducts = [];
  
  for (const sup of suppliers) {
    const supplier = await prisma.supplier.create({
      data: {
        name: sup.name,
        email: sup.email,
        phone: sup.phone,
        address: sup.address,
        description: sup.description,
      }
    });

    for (const [index, productName] of sup.products.entries()) {
      const tagSlug = sup.name.includes("CP") ? "thit-ga" : sup.name.includes("Nhập") ? "thit-bo" : "thit-heo";
      
      const costPrice = 40000 + index * 5000;
      const basePrice = costPrice * 1.3; // Margin 30%
      const salePrice = index % 3 === 0 ? Math.round(basePrice * 0.9) : null;
      const initialStock = 50 + index * 10;

      const product = await prisma.product.create({
        data: {
          name: productName,
          slug: `${slugify(sup.name)}-${slugify(productName)}`,
          description: `${productName} nhập từ ${sup.name}, đảm bảo chất lượng vệ sinh an toàn thực phẩm.`,
          shortDescription: `${productName} tươi sạch.`,
          price: Math.round(basePrice),
          salePrice: salePrice,
          stock: initialStock, // Tổng tồn kho
          sku: `${slugify(sup.name).substring(0,3).toUpperCase()}-${String(index).padStart(3, "0")}`,
          isPublished: true,
          createdById: admin.id,
          supplierId: supplier.id,
          images: "[]",
          tags: {
            create: { tagId: tagBySlug.get(tagSlug).id }
          }
        }
      });

      // Tạo 1 lô hàng (ProductBatch) cho sản phẩm này
      const importDate = new Date();
      importDate.setDate(importDate.getDate() - (index % 5)); // Nhập cách đây vài ngày
      
      const expDate = new Date(importDate);
      expDate.setDate(expDate.getDate() + 14); // Hạn sử dụng 14 ngày cho đồ tươi

      await prisma.productBatch.create({
        data: {
          batchCode: `BATCH-${product.id}-${Date.now()}`,
          productId: product.id,
          supplierId: supplier.id,
          importQuantity: initialStock,
          currentQuantity: initialStock,
          costPrice: costPrice,
          importDate: importDate,
          expirationDate: expDate,
        }
      });

      createdProducts.push(product);
    }
  }

  // 6. Tạo đơn hàng mẫu
  const sampleItems = createdProducts.slice(0, 3).map((product, index) => ({
    product,
    quantity: index + 1,
  }));
  const subtotal = sampleItems.reduce(
    (sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      orderCode: `ORDER_${Date.now()}_001`,
      subtotal,
      shippingFee: 25000,
      discountAmount: 0,
      totalAmount: subtotal + 25000,
      shippingAddress: customer.address,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "COMPLETED",
      orderItems: {
        create: sampleItems.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
          price: product.salePrice || product.price,
          productName: product.name,
          productImage: product.thumbnail,
        })),
      },
    },
  });

  // Trừ kho trên batch và product
  for (const { product, quantity } of sampleItems) {
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: { decrement: quantity } },
    });

    // Lấy batch đầu tiên để trừ (simplified)
    const batch = await prisma.productBatch.findFirst({ where: { productId: product.id }});
    if (batch) {
      await prisma.productBatch.update({
        where: { id: batch.id },
        data: { currentQuantity: { decrement: quantity } }
      });
    }
  }

  // 7. Tạo Review & Complaint
  await prisma.productReview.create({
    data: {
      userId: customer.id,
      productId: sampleItems[0].product.id,
      orderId: order.id,
      rating: 5,
      comment: "Thịt rất tươi, giao hàng nhanh!"
    }
  });

  await prisma.orderComplaint.create({
    data: {
      userId: customer.id,
      orderId: order.id,
      reason: "Thiếu nước chấm đi kèm như quảng cáo.",
      status: "RESOLVING",
    }
  });

  console.log("Đã seed người dùng:", {
    admin: admin.email,
    staff: staff.email,
    customer: customer.email,
  });
  console.log(`Đã seed ${suppliers.length} nhà cung cấp và ${createdProducts.length} sản phẩm (kèm lô hàng).`);
  console.log("Seed thành công!");
}

main()
  .catch((err) => {
    console.error("Seed thất bại:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
