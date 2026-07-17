/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ProductSearchBar from "../../components/staff/product/ProductSearchBar";
import ProductTabs from "../../components/staff/product/ProductTabs";
import StaffProductDialog from "../../components/staff/product/StaffProductDialog";
import StaffProductsTable from "../../components/staff/product/StaffProductsTable";
import StaffSoldProductsTable from "../../components/staff/product/StaffSoldProductsTable";
import StaffPagination from "../../components/staff/StaffPagination";
import { STAFF_PRODUCT_TABS } from "../../constants/staffProductTabs";
import { useStaffProductStats } from "../../hooks/useStaffProductStats";
import { useStaffProducts } from "../../hooks/useStaffProducts";
import { useStaffProductForm } from "../../hooks/useStaffProductForm";

const StaffProductPage = ({ initialTab = STAFF_PRODUCT_TABS.PRODUCTS }) => {
  const { soldProducts, refreshStaffProductStats } = useStaffProductStats();

  const {
    products,
    tags,
    suppliers,
    categories,
    batches,
    loading,
    pagination,
    creatingTag,
    submitting,
    fetchProducts,
    fetchTags,
    fetchSuppliers,
    fetchCategories,
    fetchBatches,
    createTag,
    togglePublish,
    submitProduct,
    deleteProduct,
  } = useStaffProducts(refreshStaffProductStats);

  const {
    isDialogOpen,
    editingId,
    form,
    newTagName,
    setNewTagName,
    handleFieldChange,
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleCloseDialog,
    handleThumbnailChange,
    handleImagesChange,
    handleRemoveImagePreview,
    handleToggleTag,
    handleCreateTag,
    handleTogglePublish,
    handleSubmit,
    handleDelete,
  } = useStaffProductForm({ batches, createTag, submitProduct, togglePublish, deleteProduct });

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    fetchTags();
    fetchSuppliers();
    fetchCategories();
    fetchBatches();
  }, [fetchTags, fetchSuppliers, fetchCategories, fetchBatches]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts({
        page,
        search: searchQuery,
        categoryId: categoryFilter,
        isPublished: publishedFilter,
        stockStatus: stockFilter,
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [
    page,
    searchQuery,
    categoryFilter,
    publishedFilter,
    stockFilter,
    fetchProducts,
  ]);

  // Reset về trang 1 khi đổi filter/search
  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryFilter, publishedFilter, stockFilter]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white text-slate-900 font-sans p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5">
            Quản lý sản phẩm
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Quản lý thông tin sản phẩm, giá bán, số lượng tồn kho và nhãn phân
            loại.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateDialog}
          className="bg-primary-600 hover:bg-primary-600-hover text-white font-bold px-6 py-2 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 border border-primary-600 transition-all shrink-0"
        >
          <Plus size={16} /> Thêm sản phẩm mới
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
        <ProductTabs activeTab={activeTab} onChange={setActiveTab} />
        <ProductSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1"
        />
        {activeTab === STAFF_PRODUCT_TABS.PRODUCTS && (
          <div className="flex flex-wrap gap-3 shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang công khai</option>
              <option value="false">Đang ẩn</option>
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="">Tất cả tồn kho</option>
              <option value="in">Còn hàng ({">"}10)</option>
              <option value="low">Sắp hết (≤10)</option>
              <option value="out">Hết hàng</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === STAFF_PRODUCT_TABS.PRODUCTS ? (
        <>
          <StaffProductsTable
            loading={loading}
            products={products}
            page={page}
            onEdit={handleOpenEditDialog}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
          <StaffPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <StaffSoldProductsTable products={soldProducts} />
      )}

      <StaffProductDialog
        isOpen={isDialogOpen}
        editingId={editingId}
        form={form}
        tags={tags}
        suppliers={suppliers}
        batches={batches}
        newTagName={newTagName}
        creatingTag={creatingTag}
        submitting={submitting}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
        onThumbnailChange={handleThumbnailChange}
        onImagesChange={handleImagesChange}
        onRemoveImagePreview={handleRemoveImagePreview}
        onToggleTag={handleToggleTag}
        onNewTagNameChange={setNewTagName}
        onCreateTag={handleCreateTag}
      />
    </div>
  );
};

export default StaffProductPage;
