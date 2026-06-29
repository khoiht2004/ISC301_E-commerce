import { useState, useCallback } from "react";
import api from "../services/axios";
import { toast } from "react-hot-toast";

export const useStaffNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/news", {
        params: {
          all: "true",
          limit: 100,
        },
      });
      setArticles(res.data.data || []);
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
      if (editingId) {
        await api.put(`/news/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await api.post("/news", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Tạo bài viết mới thành công!");
      }
      fetchArticles();
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
      fetchArticles();
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
    submitting,
    fetchArticles,
    submitArticle,
    deleteArticle,
  };
};
