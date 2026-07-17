import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import EcomNavbar from '../components/layout/EcomNavbar';
import EcomFooter from '../components/layout/EcomFooter';
import { toast } from 'react-hot-toast';
import AddressSelectForm from '../components/common/AddressSelectForm';

const AccountPage = () => {
  const { user, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [addressData, setAddressData] = useState({
    province_id: '',
    district_id: '',
    ward_id: '',
    street_address: '',
    combinedAddress: '',
    phone: '',
    fullName: ''
  });

  // Synchronize state when user loads or edit mode is toggled
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAddressData({
        province_id: user.province_id || '',
        district_id: user.district_id || '',
        ward_id: user.ward_id || '',
        street_address: user.street_address || '',
        combinedAddress: user.address || '',
        phone: user.phone || '',
        fullName: user.fullName || ''
      });
      setAvatarPreview(user.avatar || null);
      setAvatarFile(null);
    }
  }, [user, isEditing]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Họ tên không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('phone', addressData.phone?.trim() || phone.trim());
      formData.append('address', addressData.combinedAddress?.trim() || address.trim());
      formData.append('province_id', addressData.province_id || '');
      formData.append('district_id', addressData.district_id || '');
      formData.append('ward_id', addressData.ward_id || '');
      formData.append('street_address', addressData.street_address || '');

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await updateProfile(formData);
      toast.success('Cập nhật thông tin tài khoản thành công!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-slate-900">
        <EcomNavbar />
      </div>

      <main className="flex-grow container mx-auto px-4 py-12 mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Tài khoản của tôi</h1>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header / Avatar */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-10 text-white flex items-center gap-6">
              <div className="relative group w-24 h-24 bg-white/20 rounded-full border-4 border-white/30 flex items-center justify-center overflow-hidden shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">{fullName.charAt(0)}</span>
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] text-white mt-1">Đổi ảnh</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                )}
              </div>
              <div className="flex-grow">
                {isEditing ? (
                  <div>
                    <label className="block text-xs text-primary-200 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-white/10 border border-white/20 text-white rounded px-3 py-1 font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-white/50 w-full max-w-sm"
                      placeholder="Họ và tên"
                      required
                    />
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold">{user.fullName}</h2>
                )}
                <p className="text-primary-100 mt-1">{user.role}</p>
              </div>
            </div>

            {/* Details */}
            <div className="p-8">
              {isEditing ? (
                <form onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Thông tin liên hệ</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-slate-500 mb-1">Email</label>
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-400 rounded-lg cursor-not-allowed text-sm"
                          />
                          <p className="text-xs text-slate-400 mt-1">Email đăng ký không thể thay đổi</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Địa chỉ giao hàng</h3>
                      <AddressSelectForm
                        initialValues={{
                          province_id: user.province_id || "",
                          district_id: user.district_id || "",
                          ward_id: user.ward_id || "",
                          street_address: user.street_address || "",
                          phone: user.phone || "",
                          email: user.email || ""
                        }}
                        showEmail={false}
                        onChange={(data) => {
                          setAddressData(data);
                        }}
                      />
                    </div>

                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang lưu...
                        </>
                      ) : (
                        'Lưu thay đổi'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Thông tin liên hệ</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-500">Email</p>
                          <p className="font-medium text-slate-900">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Số điện thoại</p>
                          <p className="font-medium text-slate-900">{user.phone || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Địa chỉ giao hàng</h3>
                      <div>
                        <p className="text-sm text-slate-500">Địa chỉ mặc định</p>
                        <p className="font-medium text-slate-900 whitespace-pre-wrap">{user.address || 'Chưa cập nhật'}</p>
                      </div>
                    </div>

                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end gap-4">
                    <Link to="/my-orders" className="px-6 py-2 bg-primary-50 text-primary-600 border border-primary-100 rounded-lg font-bold hover:bg-primary-100 transition-colors text-sm">
                      Lịch sử đơn hàng
                    </Link>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors text-sm"
                    >
                      Cập nhật thông tin
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <EcomFooter />
    </div>
  );
};

export default AccountPage;
