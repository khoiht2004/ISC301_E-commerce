import { useState, useCallback } from "react";
import api from "../services/axios";
import { toast } from "react-hot-toast";

export const useStaffBatches = () => {
  const [batches, setBatches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBatches = useCallback(async (searchQuery = "") => {
    try {
      setLoading(true);
      const { data } = await api.get(`/staff/batches?search=${searchQuery}`);
      setBatches(data.data);
    } catch (err) {
      console.log(err);
      toast.error("Không thể tải danh sách lô hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/staff/batches/suggestions");
      setSuggestions(data.data);
    } catch (err) {
      console.log(err);
      toast.error("Không thể tải danh sách gợi ý");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDependencies = useCallback(async () => {
    try {
      const [prodRes, suppRes] = await Promise.all([
        api.get("/products"),
        api.get("/suppliers"),
      ]);
      setProducts(prodRes.data.data || []);
      setSuppliers(suppRes.data.data || []);
    } catch (err) {
      console.log("Error fetching dependencies:", err);
    }
  }, []);

  const createBatch = async (formData) => {
    try {
      await api.post("/staff/batches", formData);
      toast.success("Thêm lô hàng thành công");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
      return false;
    }
  };

  const updateBatch = async (id, formData) => {
    try {
      await api.put(`/staff/batches/${id}`, formData);
      toast.success("Cập nhật lô hàng thành công");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
      return false;
    }
  };

  const deleteBatch = async (id) => {
    try {
      await api.delete(`/staff/batches/${id}`);
      toast.success("Xóa lô hàng thành công");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi xóa");
      return false;
    }
  };

  return {
    batches,
    suggestions,
    products,
    suppliers,
    loading,
    fetchBatches,
    fetchSuggestions,
    fetchDependencies,
    createBatch,
    updateBatch,
    deleteBatch,
  };
};
