import { useState } from "react";
import { toast } from "react-hot-toast";

const emptyForm = {
  name: "",
  price: "",
  salePrice: "",
  stock: "0",
  sku: "",
  shortDescription: "",
  description: "",
  supplierId: "",
  isPublished: false,
  selectedTagIds: [],
  thumbnailFile: null,
  thumbnailPreview: "",
  imageFiles: [],
  imagePreviews: [],
  rawBatchId: "",
};

const resolveLocalImage = (image) => {
  if (!image) return "";
  return image.startsWith("/") ? `http://localhost:5000${image}` : image;
};

// Quản lý state + handler của dialog thêm/sửa sản phẩm (form, ảnh, tag),
// tách khỏi StaffProductPage để trang chính chỉ còn lo phần danh sách/filter.
export const useStaffProductForm = ({
  batches,
  createTag,
  submitProduct,
  togglePublish,
  deleteProduct,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newTagName, setNewTagName] = useState("");

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setNewTagName("");
  };

  const handleFieldChange = (field, value) => {
    setForm((current) => {
      const updated = { ...current, [field]: value };
      if (field === "rawBatchId") {
        if (value) {
          const selectedBatch = batches.find((b) => b.id === parseInt(value));
          if (selectedBatch) {
            updated.supplierId = selectedBatch.supplierId || "";
          }
        } else {
          updated.supplierId = "";
        }
      }
      return updated;
    });
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
      supplierId: product.supplierId || "",
      isPublished: product.isPublished || false,
      selectedTagIds: product.tags ? product.tags.map((tag) => tag.id) : [],
      thumbnailPreview: resolveLocalImage(product.thumbnail),
      imagePreviews: (product.images || []).map(resolveLocalImage),
      rawBatchId: product.rawBatchId || "",
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
      imageFiles: current.imageFiles.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
      imagePreviews: current.imagePreviews.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
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
    const success = await createTag(newTagName);
    if (success) {
      setNewTagName("");
    }
  };

  const handleTogglePublish = async (id) => {
    await togglePublish(id);
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

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("price", form.price);
    if (form.salePrice) formData.append("salePrice", form.salePrice);
    formData.append("stock", form.stock);
    if (form.sku) formData.append("sku", form.sku.trim());
    formData.append("shortDescription", form.shortDescription.trim());
    formData.append("description", form.description.trim());
    if (form.supplierId) formData.append("supplierId", form.supplierId);
    formData.append("isPublished", form.isPublished ? "true" : "false");
    formData.append("tagIds", JSON.stringify(form.selectedTagIds));
    if (form.rawBatchId) {
      formData.append("rawBatchId", form.rawBatchId);
    } else {
      formData.append("rawBatchId", "");
    }

    if (form.thumbnailFile) formData.append("thumbnail", form.thumbnailFile);
    form.imageFiles.forEach((file) => formData.append("images", file));

    const success = await submitProduct(editingId, formData);
    if (success) {
      handleCloseDialog();
    }
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
  };

  return {
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
  };
};
