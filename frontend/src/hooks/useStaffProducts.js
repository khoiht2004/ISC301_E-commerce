import { useState, useCallback, useRef } from "react";
import api from "../services/axios";
import { toast } from "react-hot-toast";

export const useStaffProducts = (refreshStatsCallback) => {
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Ghi nhớ params fetch gần nhất để dùng lại khi refetch sau khi tạo/sửa/xóa
  const lastParamsRef = useRef({});

  const fetchBatches = useCallback(async () => {
    try {
      const res = await api.get("/staff/batches", { params: { limit: 100 } });
      if (res.data?.success) setBatches(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchProducts = useCallback(async (params = {}) => {
    lastParamsRef.current = params;
    setLoading(true);
    try {
      const res = await api.get("/products/all", {
        params: {
          page: params.page || 1,
          limit: 20,
          search: params.search || undefined,
          categoryId: params.categoryId || undefined,
          isPublished: params.isPublished ?? undefined,
          stockStatus: params.stockStatus || undefined,
        },
      });
      setProducts(res.data.data || []);
      setPagination({
        page: res.data.pagination?.page || 1,
        totalPages: res.data.pagination?.totalPages || 1,
      });
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const res = await api.get("/tags");
      if (res.data?.success) setTags(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api.get("/suppliers");
      if (res.data?.success) setSuppliers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      if (res.data?.success) setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const createTag = async (newTagName) => {
    if (!newTagName.trim()) return false;
    setCreatingTag(true);
    try {
      const res = await api.post("/tags", { name: newTagName.trim() });
      if (res.data?.success) {
        toast.success(`Đã tạo nhãn "${newTagName.trim()}"`);
        await fetchTags();
        return true;
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Không thể tạo nhãn mới");
      return false;
    } finally {
      setCreatingTag(false);
    }
  };

  const togglePublish = async (id) => {
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
        if (refreshStatsCallback) refreshStatsCallback();
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái xuất bản");
    }
  };

  const submitProduct = async (editingId, formData) => {
    setSubmitting(true);
    try {
      // Content-Type phải để undefined (không phải "multipart/form-data" cứng) để
      // axios/trình duyệt tự sinh boundary đúng cho FormData, ghi đè default JSON của instance
      const formDataConfig = { headers: { "Content-Type": undefined } };
      if (editingId) {
        await api.put(`/products/${editingId}`, formData, formDataConfig);
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await api.post("/products", formData, formDataConfig);
        toast.success("Thêm sản phẩm mới thành công");
      }
      fetchProducts(lastParamsRef.current);
      if (refreshStatsCallback) refreshStatsCallback();
      return true;
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi lưu sản phẩm",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      return false;
    }

    try {
      await api.delete(`/products/${id}`);
      toast.success("Đã xóa sản phẩm thành công");
      fetchProducts(lastParamsRef.current);
      if (refreshStatsCallback) refreshStatsCallback();
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa sản phẩm");
      return false;
    }
  };

  return {
    products,
    tags,
    suppliers,
    categories,
    loading,
    pagination,
    creatingTag,
    submitting,
    fetchProducts,
    fetchTags,
    fetchSuppliers,
    fetchCategories,
    createTag,
    togglePublish,
    submitProduct,
    deleteProduct,
    batches,
    fetchBatches,
  };
};
