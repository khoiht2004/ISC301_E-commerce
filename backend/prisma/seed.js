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
    description:
      "Nhà cung cấp thịt gà và các sản phẩm chế biến từ gà lớn nhất Việt Nam.",
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

  // Xóa dữ liệu cũ theo thứ tự liên kết không bị vi phạm khóa ngoại
  await prisma.paymentTransaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.supportRequest.deleteMany();
  await prisma.orderComplaint.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productTagOnProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productBatch.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.news.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const commonPassword = await bcrypt.hash("pass123456", 12);

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
        },
      },
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
        },
      },
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
          gender: "Male",
        },
      },
    },
  });

  // 3b. Tạo Địa chỉ mẫu cho Customer (đồng bộ Address model)
  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: customer.fullName,
      phone: customer.phone,
      province: "Thành phố Hồ Chí Minh",
      district: "Quận Bình Thạnh",
      ward: "Phường 25",
      detail: "100 Đinh Tiên Hoàng",
      isDefault: true,
    },
  });

  // 4. Tạo Tags
  const createdTags = await Promise.all(
    tags.map((tag) => prisma.productTag.create({ data: tag })),
  );
  const tagBySlug = new Map(createdTags.map((tag) => [tag.slug, tag]));

  // 4b. Tạo Categories mẫu (đồng bộ Category model)
  const categories = [
    { name: "Thịt tươi sống", slug: "thit-tuoi-song" },
    { name: "Thịt đông lạnh", slug: "thit-dong-lanh" },
    { name: "Thực phẩm chế biến", slug: "thuc-pham-che-bien" },
  ];
  const createdCategories = await Promise.all(
    categories.map((cat) => prisma.category.create({ data: cat })),
  );
  const categoryBySlug = new Map(
    createdCategories.map((cat) => [cat.slug, cat]),
  );

  // 4c. Tạo Coupons mẫu (đồng bộ Coupon model)
  await prisma.coupon.createMany({
    data: [
      {
        code: "MEATNEW10",
        discountType: "PERCENTAGE",
        value: 10,
        startAt: new Date(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
        isActive: true,
      },
      {
        code: "FREESHIP",
        discountType: "FIXED",
        value: 25000,
        startAt: new Date(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: "MEATVIP20",
        discountType: "PERCENTAGE",
        value: 20,
        startAt: new Date(),
        endAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ],
  });

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
      },
    });

    for (const [index, productName] of sup.products.entries()) {
      const tagSlug = sup.name.includes("CP")
        ? "thit-ga"
        : sup.name.includes("Nhập")
          ? "thit-bo"
          : "thit-heo";
      const categorySlug = sup.name.includes("Nhập")
        ? "thit-dong-lanh"
        : "thit-tuoi-song";
      const categoryId = categoryBySlug.get(categorySlug).id;

      const costPrice = 40000 + index * 5000;
      const basePrice = costPrice * 1.3; // Margin 30%
      const salePrice = index % 3 === 0 ? Math.round(basePrice * 0.9) : null;
      const initialStock = 50 + index * 10;

      // Tạo 1 lô hàng (ProductBatch) cho sản phẩm này trước
      const importDate = new Date();
      importDate.setDate(importDate.getDate() - (index % 5)); // Nhập cách đây vài ngày

      const expDate = new Date(importDate);
      if (index === 0) {
        expDate.setDate(new Date().getDate() + 2); // Cận date 2 ngày
      } else if (index === 1) {
        expDate.setDate(new Date().getDate() + 6); // Cận date 6 ngày
      } else {
        expDate.setDate(expDate.getDate() + 14); // Hạn sử dụng 14 ngày cho đồ tươi
      }

      const batch = await prisma.productBatch.create({
        data: {
          batchCode: `BATCH-${Date.now()}-${index}`,
          rawMaterialName: `Nguyên liệu ${productName}`,
          supplierId: supplier.id,
          importQuantity: initialStock,
          currentQuantity: initialStock,
          costPrice: costPrice,
          importDate: importDate,
          expirationDate: expDate,
        },
      });

      const product = await prisma.product.create({
        data: {
          name: productName,
          slug: `${slugify(sup.name)}-${slugify(productName)}`,
          description: `${productName} nhập từ ${sup.name}, đảm bảo chất lượng vệ sinh an toàn thực phẩm.`,
          shortDescription: `${productName} tươi sạch.`,
          price: Math.round(basePrice),
          salePrice: salePrice,
          stock: initialStock, // Tổng tồn kho
          sku: `${slugify(sup.name).substring(0, 3).toUpperCase()}-${String(index).padStart(3, "0")}`,
          isPublished: true,
          createdById: admin.id,
          supplierId: supplier.id,
          categoryId: categoryId, // Liên kết danh mục mẫu
          rawBatchId: batch.id,
          images: "[]",
          tags: {
            create: { tagId: tagBySlug.get(tagSlug).id },
          },
        },
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
    (sum, item) =>
      sum + (item.product.salePrice || item.product.price) * item.quantity,
    0,
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

    // Lấy batch để trừ
    const batch = product.rawBatchId
      ? await prisma.productBatch.findUnique({
          where: { id: product.rawBatchId },
        })
      : null;
    if (batch) {
      await prisma.productBatch.update({
        where: { id: batch.id },
        data: { currentQuantity: { decrement: quantity } },
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
      comment: "Thịt rất tươi, giao hàng nhanh!",
    },
  });

  await prisma.orderComplaint.create({
    data: {
      userId: customer.id,
      orderId: order.id,
      reason: "Thiếu nước chấm đi kèm như quảng cáo.",
      status: "RESOLVING",
    },
  });

  // 7b. Tạo Tin tức (News) mẫu (đồng bộ News model)
  await prisma.news.createMany({
    data: [
      {
        title:
          "Bí quyết chọn thịt bò Mỹ tươi ngon, đúng chuẩn cho bữa ăn gia đình",
        slug: "bi-quyet-chon-thit-bo-my-tuoi-ngon-dung-chuan-cho-bua-an-gia-dinh",
        excerpt:
          "Thịt bò Mỹ nhập khẩu ngày càng phổ biến trong các bữa ăn Việt. Hãy cùng tìm hiểu cách phân biệt và chọn lựa những phần thịt bò ngon nhất.",
        content: `
<p>Thịt bò Mỹ nhập khẩu luôn được ưa chuộng nhờ độ mềm ngọt, vân mỡ đều và chất lượng dinh dưỡng cao. Tuy nhiên, để chọn được những khay thịt tươi ngon và phù hợp với từng món ăn, bạn cần lưu ý một số bí quyết sau:</p>
<h3>1. Quan sát màu sắc thịt</h3>
<p>Thịt bò Mỹ tươi ngon thường có màu đỏ tươi sáng, không phải màu đỏ sẫm hay hơi thâm. Phần mỡ bò đi kèm nên có màu trắng hoặc hơi ngà tinh khiết, không bị xỉn màu.</p>
<h3>2. Vân mỡ (Marbling) đều đặn</h3>
<p>Một trong những điểm đặc trưng của bò Mỹ là các đường vân mỡ đan xen đều đặn trong các thớ thịt. Tỷ lệ vân mỡ cao giúp thịt mềm hơn và không bị khô khi chế biến nướng hoặc áp chảo.</p>
<h3>3. Lựa chọn phần thịt phù hợp cho món ăn</h3>
<ul>
  <li><strong>Món lẩu/nướng:</strong> Nên chọn Ba chỉ bò Mỹ (Shortplate) vì có tỷ lệ thịt - mỡ lý tưởng.</li>
  <li><strong>Món steak/áp chảo:</strong> Nên chọn Thăn ngoại (Striploin) hoặc Lõi vai (Top Blade) để cảm nhận vị mềm ngọt nguyên bản.</li>
</ul>
`,
        thumbnail: "/uploads/news/news-beef.jpg",
        views: 120,
        isPublished: true,
        createdById: admin.id,
      },
      {
        title:
          "Cách làm thịt heo quay giòn bì bằng nồi chiên không dầu siêu đơn giản",
        slug: "cach-lam-thit-heo-quay-gion-bi-bang-noi-chien-khong-dau-sieu-don-gian",
        excerpt:
          "Chỉ với chiếc nồi chiên không dầu quen thuộc, bạn hoàn toàn có thể tự tay làm món thịt heo quay giòn rụm, vàng ươm chuẩn vị ngoài hàng.",
        content: `
<p>Thịt quay giòn bì là món ăn khoái khẩu của cả người lớn lẫn trẻ em. Bài viết này sẽ hướng dẫn bạn cách chế biến món ăn hấp dẫn này một cách nhanh chóng, ít dầu mỡ bằng nồi chiên không dầu.</p>
<h3>Nguyên liệu cần chuẩn bị:</h3>
<ul>
  <li>1kg Thịt ba chỉ heo rút sườn tươi ngon</li>
  <li>Gia vị: Ngũ vị hương, bột tỏi, muối, tiêu, giấm ăn, chanh</li>
</ul>
<h3>Các bước thực hiện:</h3>
<p><strong>Bước 1: Sơ chế và luộc sơ thịt:</strong> Rửa sạch thịt heo, luộc sơ phần da heo trong nước sôi khoảng 5 phút cùng hành gừng để khử mùi tanh.</p>
<p><strong>Bước 2: Xăm da và ướp gia vị:</strong> Dùng dĩa hoặc tăm nhọn xăm thật đều lên mặt da. Thoa một lớp muối mỏng và giấm lên da để khi nướng da sẽ nổ giòn. Phần thịt bên dưới ướp với ngũ vị hương và gia vị vừa ăn.</p>
<p><strong>Bước 3: Nướng bằng nồi chiên không dầu:</strong> Nướng lần 1 ở 180 độ C trong 20 phút để thịt chín đều. Nướng lần 2 ở 200 độ C trong 10-15 phút để da nổ giòn rụm.</p>
`,
        thumbnail: "/uploads/news/news-pork.jpg",
        views: 85,
        isPublished: true,
        createdById: admin.id,
      },
      {
        title:
          "Lợi ích sức khỏe bất ngờ từ việc sử dụng ức gà trong chế độ ăn hàng ngày",
        slug: "loi-ich-suc-khoe-bat-ngo-tu-viec-su-dung-uc-ga-trong-che-do-an-hang-ngay",
        excerpt:
          "Ức gà không chỉ là thực phẩm vàng cho dân tập gym mà còn mang lại vô vàn giá trị sức khỏe tuyệt vời cho mọi lứa tuổi.",
        content: `
<p>Ức gà là phần thịt trắng chứa hàm lượng đạm cao nhưng lại rất ít chất béo. Đây được coi là nguồn thực phẩm lý tưởng để xây dựng cơ bắp và duy trì lối sống lành mạnh.</p>
<h3>1. Nguồn cung cấp protein chất lượng cao</h3>
<p>Trong 100g ức gà chứa đến 31g protein, giúp thúc đẩy quá trình hồi phục và phát triển cơ bắp, giữ cảm giác no lâu, hỗ trợ hiệu quả cho việc giảm cân.</p>
<h3>2. Hỗ trợ kiểm soát cân nặng và bảo vệ tim mạch</h3>
<p>Nhờ lượng chất béo bão hòa cực thấp, bổ sung ức gà thay thế các loại thịt đỏ giúp giảm lượng cholesterol xấu trong máu, từ đó phòng ngừa các bệnh tim mạch nguy hiểm.</p>
<h3>3. Chứa nhiều khoáng chất và vitamin nhóm B</h3>
<p>Ức gà giàu phốt pho và selen tốt cho xương răng và tuyến giáp. Lượng vitamin B6 giúp tăng cường trao đổi chất và duy trì hệ thần kinh khỏe mạnh.</p>
`,
        thumbnail: "/uploads/news/news-chicken.jpg",
        views: 210,
        isPublished: true,
        createdById: admin.id,
      },
    ],
  });

  console.log("Đã seed người dùng:", {
    admin: admin.email,
    staff: staff.email,
    customer: customer.email,
  });
  console.log(
    `Đã seed ${suppliers.length} nhà cung cấp và ${createdProducts.length} sản phẩm (kèm lô hàng).`,
  );
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
