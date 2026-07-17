/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

const AddressSelectForm = ({
  initialValues = {
    province_id: "",
    district_id: "",
    ward_id: "",
    street_address: "",
    phone: "",
    email: "",
    fullName: "",
  },
  onChange,
  showEmail = true,
  showFullName = false,
  emailDisabled = false,
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState({
    code: initialValues.province_id || "",
    name: "",
  });
  const [selectedDistrict, setSelectedDistrict] = useState({
    code: initialValues.district_id || "",
    name: "",
  });
  const [selectedWard, setSelectedWard] = useState({
    code: initialValues.ward_id || "",
    name: "",
  });
  const [streetAddress, setStreetAddress] = useState(
    initialValues.street_address || "",
  );
  const [phone, setPhone] = useState(initialValues.phone || "");
  const [email, setEmail] = useState(initialValues.email || "");
  const [fullName, setFullName] = useState(initialValues.fullName || "");

  // Load Provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);

        if (initialValues.province_id) {
          const p = data.find(
            (item) =>
              item.code.toString() === initialValues.province_id.toString(),
          );
          if (p) setSelectedProvince({ code: p.code, name: p.name });
        }
      } catch (err) {
        console.error("Error fetching provinces:", err);
      }
    };
    fetchProvinces();
  }, [initialValues.province_id]);

  // Load Districts
  useEffect(() => {
    if (!selectedProvince.code) {
      setDistricts([]);
      setWards([]);
      return;
    }
    const fetchDistricts = async () => {
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`,
        );
        const data = await response.json();
        setDistricts(data.districts || []);

        if (initialValues.district_id) {
          const d = (data.districts || []).find(
            (item) =>
              item.code.toString() === initialValues.district_id.toString(),
          );
          if (d) setSelectedDistrict({ code: d.code, name: d.name });
        }
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    };
    fetchDistricts();
  }, [selectedProvince.code, initialValues.district_id]);

  // Load Wards
  useEffect(() => {
    if (!selectedDistrict.code) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`,
        );
        const data = await response.json();
        setWards(data.wards || []);

        if (initialValues.ward_id) {
          const w = (data.wards || []).find(
            (item) => item.code.toString() === initialValues.ward_id.toString(),
          );
          if (w) setSelectedWard({ code: w.code, name: w.name });
        }
      } catch (err) {
        console.error("Error fetching wards:", err);
      }
    };
    fetchWards();
  }, [selectedDistrict.code, initialValues.ward_id]);

  // Report changes to parent.
  // `onChange` cố ý KHÔNG nằm trong dependency array: nếu parent truyền vào một
  // arrow function inline (tham chiếu mới ở mỗi lần render), đưa `onChange` vào đây
  // sẽ khiến effect chạy lại ngay cả khi giá trị địa chỉ không đổi -> gọi onChange
  // -> parent setState -> parent render lại -> effect chạy lại -> lặp vô hạn.
  useEffect(() => {
    if (onChange) {
      const parts = [];
      if (streetAddress.trim()) parts.push(streetAddress.trim());
      if (selectedWard.name) parts.push(selectedWard.name);
      if (selectedDistrict.name) parts.push(selectedDistrict.name);
      if (selectedProvince.name) parts.push(selectedProvince.name);

      onChange({
        province_id: selectedProvince.code,
        province_name: selectedProvince.name,
        district_id: selectedDistrict.code,
        district_name: selectedDistrict.name,
        ward_id: selectedWard.code,
        ward_name: selectedWard.name,
        street_address: streetAddress,
        combinedAddress: parts.join(", "),
        phone,
        email,
        fullName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    streetAddress,
    phone,
    email,
    fullName,
  ]);

  return (
    <div className="space-y-4">
      {showFullName && (
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Họ tên
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
            placeholder="Nhập họ tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Số điện thoại
          </label>
          <input
            type="tel"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
            placeholder="VD: 0912345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        {showEmail && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className={`w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${emailDisabled ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"}`}
              placeholder="VD: email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailDisabled}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Tỉnh / Thành phố
          </label>
          <select
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedProvince.code}
            onChange={(e) => {
              const code = e.target.value;
              const name = e.target.options[e.target.selectedIndex].text;
              setSelectedProvince({ code, name: code ? name : "" });
              setSelectedDistrict({ code: "", name: "" });
              setSelectedWard({ code: "", name: "" });
            }}
          >
            <option value="">Chọn Tỉnh/Thành</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Quận / Huyện
          </label>
          <select
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedDistrict.code}
            onChange={(e) => {
              const code = e.target.value;
              const name = e.target.options[e.target.selectedIndex].text;
              setSelectedDistrict({ code, name: code ? name : "" });
              setSelectedWard({ code: "", name: "" });
            }}
            disabled={!selectedProvince.code}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Phường / Xã
          </label>
          <select
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedWard.code}
            onChange={(e) => {
              const code = e.target.value;
              const name = e.target.options[e.target.selectedIndex].text;
              setSelectedWard({ code, name: code ? name : "" });
            }}
            disabled={!selectedDistrict.code}
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Địa chỉ cụ thể
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Số nhà, tên đường..."
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AddressSelectForm;
