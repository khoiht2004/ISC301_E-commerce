import React, { useState, useEffect } from 'react';
import api from '../../services/axios';
import { toast } from 'react-hot-toast';
import { Package, Plus, AlertTriangle, Search } from 'lucide-react';

const StaffBatchPage = () => {
  const [batches, setBatches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'suggestions'
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    batchCode: '',
    importQuantity: '',
    costPrice: '',
    manufactureDate: '',
    expirationDate: '',
    productId: '',
    supplierId: ''
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/staff/batches?search=${searchQuery}`);
      setBatches(data.data);
    } catch (err) {
      toast.error('Không thể tải danh sách lô hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/staff/batches/suggestions');
      setSuggestions(data.data);
    } catch (err) {
      toast.error('Không thể tải danh sách gợi ý');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'all') {
      fetchBatches();
    } else {
      fetchSuggestions();
    }
  }, [activeTab, searchQuery]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff/batches', formData);
      toast.success('Thêm lô hàng thành công');
      setShowAddModal(false);
      setFormData({
        batchCode: '',
        importQuantity: '',
        costPrice: '',
        manufactureDate: '',
        expirationDate: '',
        productId: '',
        supplierId: ''
      });
      fetchBatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="p-8 bg-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Quản Lý Lô Hàng</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý nhập hàng và theo dõi hạn sử dụng</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nhập lô mới
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'all' 
              ? 'bg-primary-100 text-primary-700' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất cả lô hàng
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'suggestions' 
              ? 'bg-amber-100 text-amber-700' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle size={16} /> Gợi ý giảm giá (sắp hết hạn)
        </button>
      </div>

      {activeTab === 'all' && (
        <div className="mb-6 relative max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã lô, tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-500">Đang tải...</div>
      ) : activeTab === 'all' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Mã Lô</th>
                  <th className="px-6 py-4">Sản Phẩm</th>
                  <th className="px-6 py-4">Tồn Kho</th>
                  <th className="px-6 py-4">Giá Nhập</th>
                  <th className="px-6 py-4">Hạn SD</th>
                  <th className="px-6 py-4">Ngày Nhập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{batch.batchCode}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{batch.product?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        batch.currentQuantity === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {batch.currentQuantity} / {batch.importQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-primary-600">{formatPrice(batch.costPrice)}</td>
                    <td className="px-6 py-4">
                      <div className={new Date(batch.expirationDate) < new Date() ? 'text-red-600 font-bold' : ''}>
                        {formatDate(batch.expirationDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(batch.importDate)}</td>
                  </tr>
                ))}
                {batches.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Không tìm thấy lô hàng nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map(batch => (
            <div key={batch.id} className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900">{batch.product?.name}</h3>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-2 py-1 rounded">Sắp hết hạn</span>
              </div>
              <p className="text-xs text-slate-500 mb-1">Mã lô: <strong className="text-slate-700">{batch.batchCode}</strong></p>
              <p className="text-xs text-slate-500 mb-3">Hạn SD: <strong className="text-red-600">{formatDate(batch.expirationDate)}</strong></p>
              
              <div className="bg-slate-50 rounded-lg p-3 text-xs mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Tồn kho lô:</span>
                  <span className="font-bold">{batch.currentQuantity}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Giá nhập:</span>
                  <span className="font-bold">{formatPrice(batch.costPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá bán hiện tại:</span>
                  <span className="font-bold">{formatPrice(batch.product?.salePrice || batch.product?.price)}</span>
                </div>
              </div>
              
              <button className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-2 rounded-lg text-sm transition-colors">
                Đề xuất giảm giá
              </button>
            </div>
          ))}
          {suggestions.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Không có lô hàng nào sắp hết hạn.
            </div>
          )}
        </div>
      )}

      {/* Add Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-slate-900">Nhập lô hàng mới</h3>
            </div>
            
            <form onSubmit={handleCreateBatch} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã Lô Hàng *</label>
                <input required type="text" value={formData.batchCode} onChange={e => setFormData({...formData, batchCode: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ID Sản phẩm *</label>
                  <input required type="number" value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ID Nhà cung cấp *</label>
                  <input required type="number" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng nhập *</label>
                  <input required type="number" min="1" value={formData.importQuantity} onChange={e => setFormData({...formData, importQuantity: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giá nhập (đơn vị) *</label>
                  <input required type="number" min="0" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày SX</label>
                  <input type="date" value={formData.manufactureDate} onChange={e => setFormData({...formData, manufactureDate: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hạn sử dụng *</label>
                  <input required type="date" value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </form>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Hủy
              </button>
              <button onClick={handleCreateBatch} className="px-5 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                Lưu lô hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBatchPage;
