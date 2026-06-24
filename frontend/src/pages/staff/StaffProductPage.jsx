/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/axios";
import ProductSearchBar from "../../components/staff/product/ProductSearchBar";
import ProductStatsGrid from "../../components/staff/product/ProductStatsGrid";
import ProductTabs from "../../components/staff/product/ProductTabs";
import StaffProductDialog from "../../components/staff/product/StaffProductDialog";
import StaffProductsTable from "../../components/staff/product/StaffProductsTable";
import StaffSoldProductsTable from "../../components/staff/product/StaffSoldProductsTable";
import { STAFF_PRODUCT_TABS } from "../../constants/staffProductTabs";
import { useStaffProductStats } from "../../hooks/useStaffProductStats";

const emptyForm = {
  name: "",
  price: "",
  salePrice: "",
  stock: "0",
  sku: "",
  shortDescription: "",
  description: "",
  isPublished: false,
  selectedTagIds: [],
  thumbnailFile: null,
  thumbnailPreview: "",
  imageFiles: [],
  imagePreviews: [],
};

const resolveLocalImage = (image) => {
  if (!image) return "";
  return image.startsWith("/") ? `http://localhost:5000${image}` : image;
};

const StaffProductPage = ({ initialTab = STAFF_PRODUCT_TABS.PRODUCTS }) => {
  const { stats, soldProducts, refreshStaffProductStats } =
    useStaffProductStats();
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/all", { params: { limit: 100 } });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await api.get("/tags");
      if (res.data?.success) setTags(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTags();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;

    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.tags?.some((tag) => tag.name.toLowerCase().includes(query)),
    );
  }, [products, searchQuery]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setNewTagName("");
  };

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (product) => {
    setForm({
      ...emptyForm,
      name: product.name || "",
      price: product.price || "",
      salePrice: product.salePrice || "",
      stock: product.stock !== undefined ? String(product.stock) : "0",
      sku: product.sku || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      isPublished: product.isPublished || false,
      selectedTagIds: product.tags ? product.tags.map((tag) => tag.id) : [],
      thumbnailPreview: resolveLocalImage(product.thumbnail),
      imagePreviews: (product.images || []).map(resolveLocalImage),
    });
    setEditingId(product.id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được lớn hơn 5MB");
      return;
    }

    setForm((current) => ({
      ...current,
      thumbnailFile: file,
      thumbnailPreview: URL.createObjectURL(file),
    }));
  };

  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const previews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} lớn hơn 5MB`);
        continue;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setForm((current) => ({
      ...current,
      imageFiles: [...current.imageFiles, ...validFiles],
      imagePreviews: [...current.imagePreviews, ...previews],
    }));
  };

  const handleRemoveImagePreview = (index) => {
    setForm((current) => ({
      ...current,
      imageFiles: current.imageFiles.filter((_, itemIndex) => itemIndex !== index),
      imagePreviews: current.imagePreviews.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleToggleTag = (tagId) => {
    setForm((current) => ({
      ...current,
      selectedTagIds: current.selectedTagIds.includes(tagId)
        ? current.selectedTagIds.filter((id) => id !== tagId)
        : [...current.selectedTagIds, tagId],
    }));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setCreatingTag(true);
    try {
      const res = await api.post("/tags", { name: newTagName.trim() });
      if (res.data?.success) {
        toast.success(`Đã tạo nhãn "${newTagName.trim()}"`);
        setNewTagName("");
        await fetchTags();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Không thể tạo nhãn mới");
    } finally {
      setCreatingTag(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await api.patch(`/products/${id}/publish`);
      if (res.data?.success) {
        toast.success(
          `Đã ${res.data.data.isPublished ? "công khai" : "gỡ bỏ"} sản phẩm`,
        );
        setProducts((current) =>
          current.map((product) =>
            product.id === id
              ? { ...product, isPublished: res.data.data.isPublished }
              : product,
          ),
        );
        refreshStaffProductStats();
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái xuất bản");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error("Vui lòng nhập đơn giá hợp lệ");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("price", form.price);
    if (form.salePrice) formData.append("salePrice", form.salePrice);
    formData.append("stock", form.stock);
    if (form.sku) formData.append("sku", form.sku.trim());
    formData.append("shortDescription", form.shortDescription.trim());
    formData.append("description", form.description.trim());
    formData.append("isPublished", form.isPublished ? "true" : "false");
    formData.append("tagIds", JSON.stringify(form.selectedTagIds));

    if (form.thumbnailFile) formData.append("thumbnail", form.thumbnailFile);
    form.imageFiles.forEach((file) => formData.append("images", file));

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm sản phẩm mới thành công");
      }

      handleCloseDialog();
      fetchProducts();
      refreshStaffProductStats();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi lưu sản phẩm",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      toast.success("Đã xóa sản phẩm thành công");
      fetchProducts();
      refreshStaffProductStats();
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa sản phẩm");
    }
  };

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
          className="bg-primary-600 hover:bg-primary-600-hover text-white font-bold px-5 py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 border border-primary-600 transition-all shrink-0"
        >
          <Plus size={16} /> Thêm sản phẩm mới
        </button>
      </div>

      <ProductStatsGrid products={products} stats={stats} />

      <div className="flex flex-col lg:flex-row gap-3 mb-3">
        <ProductTabs activeTab={activeTab} onChange={setActiveTab} />
        <ProductSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1"
        />
      </div>

      {activeTab === STAFF_PRODUCT_TABS.PRODUCTS ? (
        <StaffProductsTable
          loading={loading}
          products={filteredProducts}
          onEdit={handleOpenEditDialog}
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
        />
      ) : (
        <StaffSoldProductsTable products={soldProducts} />
      )}

      <StaffProductDialog
        isOpen={isDialogOpen}
        editingId={editingId}
        form={form}
        tags={tags}
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
