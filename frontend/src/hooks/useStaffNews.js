import { useState, useCallback, useRef } from "react";
import api from "../services/axios";
import { toast } from "react-hot-toast";

export const useStaffNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Ghi nhớ params fetch gần nhất để dùng lại khi refetch sau khi tạo/sửa/xóa
  const lastParamsRef = useRef({});

  const fetchArticles = useCallback(async (params = {}) => {
    lastParamsRef.current = params;
    setLoading(true);
    try {
      const res = await api.get("/news", {
        params: {
          all: "true",
          page: params.page || 1,
          limit: 10,
          search: params.search || undefined,
        },
      });
      setArticles(res.data.data || []);
      setPagination({
        page: res.data.pagination?.page || 1,
        totalPages: res.data.pagination?.totalPages || 1,
      });
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitArticle = async (editingId, formData) => {
    setSubmitting(true);
    try {
      // Content-Type để undefined để axios/trình duyệt tự sinh boundary đúng cho FormData
      const formDataConfig = { headers: { "Content-Type": undefined } };
      if (editingId) {
        await api.put(`/news/${editingId}`, formData, formDataConfig);
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await api.post("/news", formData, formDataConfig);
        toast.success("Tạo bài viết mới thành công!");
      }
      fetchArticles(lastParamsRef.current);
      return true;
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi lưu bài viết",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteArticle = async (id) => {
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này không?")
    )
      return false;

    try {
      await api.delete(`/news/${id}`);
      toast.success("Đã xóa bài viết thành công");
      fetchArticles(lastParamsRef.current);
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa bài viết");
      return false;
    }
  };

  return {
    articles,
    loading,
    pagination,
    submitting,
    fetchArticles,
    submitArticle,
    deleteArticle,
  };
};
