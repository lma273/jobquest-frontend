import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Creatable from "react-select/creatable";
import { skillOptions } from "../data/constants";

// Style cho React-Select (Dark Mode)
const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#0f172a", // slate-900 darker
    borderColor: "#334155",
    color: "white",
  }),
  menu: (base) => ({ ...base, backgroundColor: "#1e293b", zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#334155" : "#1e293b",
    color: "white",
  }),
  singleValue: (base) => ({ ...base, color: "white" }),
  input: (base) => ({ ...base, color: "white" }),
  multiValue: (base) => ({ ...base, backgroundColor: "#334155" }),
  multiValueLabel: (base) => ({ ...base, color: "white" }),
};

const InlinePostJob = ({ onCancel, onSuccess }) => {
  const userData = useSelector((state) => state.auth.userData);
  
  // State form chính
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    experience: "",
    skills: [],
    description: "",
  });

  const [isPosting, setIsPosting] = useState(false);

  // 🟢 AUTO-FILL: Lấy thông tin Recruiter điền sẵn vào form
  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        // Ưu tiên lấy từ userData, nếu không có thì để rỗng
        company: userData.companyName || userData.company || "UET", 
        location: userData.address || userData.location || "Hà Nội", 
      }));
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    
    // Giả lập API Post Job (Thay bằng API thật của bạn)
    console.log("Posting Job:", formData);
    
    // Simulate delay
    setTimeout(() => {
      alert("Đăng tin tuyển dụng thành công!");
      setIsPosting(false);
      onSuccess(); 
    }, 1000);
  };

  return (
    <div className="bg-slate-800 border border-green-500/30 rounded-xl p-6 mb-8 shadow-2xl animate-fade-in-down">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🚀 Đăng tin tuyển dụng mới
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white bg-slate-700 px-3 py-1 rounded">
            ✕ Đóng
        </button>
      </div>

      {/* FORM NHẬP LIỆU (1 CỘT GỌN GÀNG) */}
      <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-gray-300 text-sm font-semibold block mb-1">Vị trí công việc <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 outline-none placeholder-gray-500"
                placeholder="VD: Senior Java Developer"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            {/* Hàng 2: Công ty & Địa điểm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-gray-300 text-sm font-semibold block mb-1">Công ty</label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-gray-300 cursor-not-allowed"
                        value={formData.company}
                        readOnly // Chỉ đọc vì lấy từ profile
                    />
                </div>
                <div>
                    <label className="text-gray-300 text-sm font-semibold block mb-1">Địa điểm</label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-gray-300"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})} // Vẫn cho sửa nếu cần
                    />
                </div>
            </div>

            {/* Hàng 3: Kinh nghiệm & Loại hình */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-gray-300 text-sm font-semibold block mb-1">Kinh nghiệm (Năm)</label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 outline-none placeholder-gray-500"
                        placeholder="VD: 2 năm / Fresher"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="text-gray-300 text-sm font-semibold block mb-1">Loại hình</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Remote</option>
                        <option>Internship</option>
                    </select>
                </div>
            </div>

            {/* Kỹ năng */}
            <div>
              <label className="text-gray-300 text-sm font-semibold block mb-1">Kỹ năng yêu cầu</label>
              <Creatable
                isMulti
                options={skillOptions}
                styles={customSelectStyles}
                value={formData.skills}
                onChange={(val) => setFormData({...formData, skills: val})}
                placeholder="Chọn hoặc nhập kỹ năng..."
              />
            </div>

            {/* Main Description */}
            <div>
                <label className="text-gray-300 text-sm font-semibold block mb-1">
                    Mô tả công việc (JD) <span className="text-red-500">*</span>
                    {/* GỢI Ý NHÌN SANG SIDEBAR AI */}
                    <span className="text-purple-400 text-xs font-normal ml-2 italic animate-pulse">
                        (Mẹo: Nhìn sang Sidebar bên phải để nhờ AI viết hộ 👉)
                    </span>
                </label>
                <textarea 
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-gray-200 focus:border-green-500 outline-none leading-relaxed min-h-[250px] placeholder-gray-500"
                    placeholder="Copy JD từ AI bên phải và dán vào đây..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                ></textarea>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-700 pt-6 mt-6">
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                    Hủy bỏ
                </button>
                <button 
                    type="submit" // Trigger submit form
                    disabled={isPosting}
                    className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                >
                    {isPosting ? "Đang xử lý..." : "Đăng Tin Ngay 🚀"}
                </button>
            </div>
      </form>
    </div>
  );
};

export default InlinePostJob;