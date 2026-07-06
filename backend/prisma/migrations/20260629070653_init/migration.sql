BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[user] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fullName] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000),
    [avatar] NVARCHAR(1000),
    [address] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [user_role_df] DEFAULT 'USER',
    [isOnline] BIT NOT NULL CONSTRAINT [user_isOnline_df] DEFAULT 0,
    [isActive] BIT NOT NULL CONSTRAINT [user_isActive_df] DEFAULT 1,
    [isVerified] BIT NOT NULL CONSTRAINT [user_isVerified_df] DEFAULT 0,
    [verifyToken] NVARCHAR(1000),
    [refreshToken] NVARCHAR(1000),
    [refreshTokenExpiry] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [user_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [user_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [user_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[user_profile] (
    [id] INT NOT NULL IDENTITY(1,1),
    [gender] NVARCHAR(1000),
    [dateOfBirth] DATETIME2,
    [bio] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [user_profile_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [user_profile_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [user_profile_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[supplier] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [address] TEXT,
    [description] TEXT,
    [isActive] BIT NOT NULL CONSTRAINT [supplier_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [supplier_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [supplier_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[address] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fullName] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000) NOT NULL,
    [province] NVARCHAR(1000) NOT NULL,
    [district] NVARCHAR(1000) NOT NULL,
    [ward] NVARCHAR(1000) NOT NULL,
    [detail] NVARCHAR(1000) NOT NULL,
    [isDefault] BIT NOT NULL CONSTRAINT [address_isDefault_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [address_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [address_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[category] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [category_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [category_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [category_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[product_tag] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [product_tag_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [product_tag_name_key] UNIQUE NONCLUSTERED ([name]),
    CONSTRAINT [product_tag_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[product_tag_on_product] (
    [productId] INT NOT NULL,
    [tagId] INT NOT NULL,
    CONSTRAINT [product_tag_on_product_pkey] PRIMARY KEY CLUSTERED ([productId],[tagId])
);

-- CreateTable
CREATE TABLE [dbo].[product] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] TEXT,
    [shortDescription] NVARCHAR(1000),
    [thumbnail] NVARCHAR(1000),
    [images] NVARCHAR(1000) NOT NULL CONSTRAINT [product_images_df] DEFAULT '[]',
    [price] INT NOT NULL,
    [salePrice] INT,
    [stock] INT NOT NULL CONSTRAINT [product_stock_df] DEFAULT 0,
    [sku] NVARCHAR(1000),
    [unit] NVARCHAR(1000) NOT NULL CONSTRAINT [product_unit_df] DEFAULT 'gram',
    [weight] INT,
    [isPublished] BIT NOT NULL CONSTRAINT [product_isPublished_df] DEFAULT 0,
    [isDeleted] BIT NOT NULL CONSTRAINT [product_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [product_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdById] INT NOT NULL,
    [categoryId] INT,
    [supplierId] INT,
    CONSTRAINT [product_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [product_slug_key] UNIQUE NONCLUSTERED ([slug]),
    CONSTRAINT [product_sku_key] UNIQUE NONCLUSTERED ([sku])
);

-- CreateTable
CREATE TABLE [dbo].[product_batch] (
    [id] INT NOT NULL IDENTITY(1,1),
    [batchCode] NVARCHAR(1000) NOT NULL,
    [importQuantity] INT NOT NULL,
    [currentQuantity] INT NOT NULL CONSTRAINT [product_batch_currentQuantity_df] DEFAULT 0,
    [costPrice] INT NOT NULL,
    [manufactureDate] DATETIME2,
    [expirationDate] DATETIME2 NOT NULL,
    [importDate] DATETIME2 NOT NULL CONSTRAINT [product_batch_importDate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [product_batch_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [productId] INT NOT NULL,
    [supplierId] INT NOT NULL,
    CONSTRAINT [product_batch_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [product_batch_batchCode_key] UNIQUE NONCLUSTERED ([batchCode])
);

-- CreateTable
CREATE TABLE [dbo].[product_review] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rating] INT NOT NULL CONSTRAINT [product_review_rating_df] DEFAULT 5,
    [comment] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [product_review_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT NOT NULL,
    [productId] INT NOT NULL,
    [orderId] INT,
    CONSTRAINT [product_review_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[cart] (
    [id] INT NOT NULL IDENTITY(1,1),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [cart_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [cart_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [cart_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[cart_item] (
    [id] INT NOT NULL IDENTITY(1,1),
    [quantity] INT NOT NULL CONSTRAINT [cart_item_quantity_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [cart_item_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [cartId] INT NOT NULL,
    [productId] INT NOT NULL,
    CONSTRAINT [cart_item_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [cart_item_cartId_productId_key] UNIQUE NONCLUSTERED ([cartId],[productId])
);

-- CreateTable
CREATE TABLE [dbo].[order] (
    [id] INT NOT NULL IDENTITY(1,1),
    [orderCode] NVARCHAR(1000) NOT NULL,
    [subtotal] INT NOT NULL,
    [shippingFee] INT NOT NULL CONSTRAINT [order_shippingFee_df] DEFAULT 0,
    [discountAmount] INT NOT NULL CONSTRAINT [order_discountAmount_df] DEFAULT 0,
    [totalAmount] INT NOT NULL,
    [paymentMethod] NVARCHAR(1000) NOT NULL CONSTRAINT [order_paymentMethod_df] DEFAULT 'COD',
    [paymentStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [order_paymentStatus_df] DEFAULT 'PENDING',
    [orderStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [order_orderStatus_df] DEFAULT 'PENDING',
    [shippingAddress] NVARCHAR(1000) NOT NULL,
    [customerPhone] NVARCHAR(1000) NOT NULL,
    [customerEmail] NVARCHAR(1000) NOT NULL,
    [note] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [order_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [paidAt] DATETIME2,
    [userId] INT NOT NULL,
    CONSTRAINT [order_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [order_orderCode_key] UNIQUE NONCLUSTERED ([orderCode])
);

-- CreateTable
CREATE TABLE [dbo].[order_item] (
    [id] INT NOT NULL IDENTITY(1,1),
    [quantity] INT NOT NULL,
    [price] INT NOT NULL,
    [productName] NVARCHAR(1000) NOT NULL,
    [productImage] NVARCHAR(1000),
    [orderId] INT NOT NULL,
    [productId] INT NOT NULL,
    CONSTRAINT [order_item_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[order_complaint] (
    [id] INT NOT NULL IDENTITY(1,1),
    [reason] TEXT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [order_complaint_status_df] DEFAULT 'PENDING',
    [resolution] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [order_complaint_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT NOT NULL,
    [orderId] INT NOT NULL,
    CONSTRAINT [order_complaint_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[coupon] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] NVARCHAR(1000) NOT NULL,
    [discountType] NVARCHAR(1000) NOT NULL,
    [value] INT NOT NULL,
    [startAt] DATETIME2 NOT NULL,
    [endAt] DATETIME2 NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [coupon_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [coupon_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [coupon_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [coupon_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[news] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [excerpt] TEXT,
    [content] TEXT NOT NULL,
    [thumbnail] NVARCHAR(1000),
    [views] INT NOT NULL CONSTRAINT [news_views_df] DEFAULT 0,
    [isPublished] BIT NOT NULL CONSTRAINT [news_isPublished_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [news_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdById] INT NOT NULL,
    CONSTRAINT [news_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [news_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[support_request] (
    [id] INT NOT NULL IDENTITY(1,1),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [support_request_status_df] DEFAULT 'WAITING',
    [title] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [support_request_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [acceptedAt] DATETIME2,
    [closedAt] DATETIME2,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT NOT NULL,
    [assignedStaffId] INT,
    CONSTRAINT [support_request_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[message] (
    [id] INT NOT NULL IDENTITY(1,1),
    [content] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [message_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [supportRequestId] INT NOT NULL,
    [senderId] INT NOT NULL,
    CONSTRAINT [message_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[payment_transaction] (
    [id] INT NOT NULL IDENTITY(1,1),
    [orderId] INT NOT NULL,
    [transactionId] NVARCHAR(1000) NOT NULL,
    [gateway] NVARCHAR(1000) NOT NULL,
    [amount] INT NOT NULL,
    [content] NVARCHAR(1000) NOT NULL,
    [rawData] TEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [payment_transaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [payment_transaction_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [payment_transaction_transactionId_key] UNIQUE NONCLUSTERED ([transactionId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [product_createdById_idx] ON [dbo].[product]([createdById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [product_isDeleted_isPublished_idx] ON [dbo].[product]([isDeleted], [isPublished]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [product_batch_expirationDate_idx] ON [dbo].[product_batch]([expirationDate]);

-- AddForeignKey
ALTER TABLE [dbo].[user_profile] ADD CONSTRAINT [user_profile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[address] ADD CONSTRAINT [address_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_tag_on_product] ADD CONSTRAINT [product_tag_on_product_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[product]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_tag_on_product] ADD CONSTRAINT [product_tag_on_product_tagId_fkey] FOREIGN KEY ([tagId]) REFERENCES [dbo].[product_tag]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product] ADD CONSTRAINT [product_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product] ADD CONSTRAINT [product_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product] ADD CONSTRAINT [product_supplierId_fkey] FOREIGN KEY ([supplierId]) REFERENCES [dbo].[supplier]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_batch] ADD CONSTRAINT [product_batch_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[product]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_batch] ADD CONSTRAINT [product_batch_supplierId_fkey] FOREIGN KEY ([supplierId]) REFERENCES [dbo].[supplier]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_review] ADD CONSTRAINT [product_review_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_review] ADD CONSTRAINT [product_review_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[product]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[product_review] ADD CONSTRAINT [product_review_orderId_fkey] FOREIGN KEY ([orderId]) REFERENCES [dbo].[order]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[cart] ADD CONSTRAINT [cart_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[cart_item] ADD CONSTRAINT [cart_item_cartId_fkey] FOREIGN KEY ([cartId]) REFERENCES [dbo].[cart]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[cart_item] ADD CONSTRAINT [cart_item_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[product]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order] ADD CONSTRAINT [order_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_item] ADD CONSTRAINT [order_item_orderId_fkey] FOREIGN KEY ([orderId]) REFERENCES [dbo].[order]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_item] ADD CONSTRAINT [order_item_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[product]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_complaint] ADD CONSTRAINT [order_complaint_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[order_complaint] ADD CONSTRAINT [order_complaint_orderId_fkey] FOREIGN KEY ([orderId]) REFERENCES [dbo].[order]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[news] ADD CONSTRAINT [news_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[support_request] ADD CONSTRAINT [support_request_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[support_request] ADD CONSTRAINT [support_request_assignedStaffId_fkey] FOREIGN KEY ([assignedStaffId]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[message] ADD CONSTRAINT [message_supportRequestId_fkey] FOREIGN KEY ([supportRequestId]) REFERENCES [dbo].[support_request]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[message] ADD CONSTRAINT [message_senderId_fkey] FOREIGN KEY ([senderId]) REFERENCES [dbo].[user]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[payment_transaction] ADD CONSTRAINT [payment_transaction_orderId_fkey] FOREIGN KEY ([orderId]) REFERENCES [dbo].[order]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
