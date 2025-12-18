import { useState } from "react";
import { useSelector } from "react-redux";
import Creatable from "react-select/creatable";
import { skillOptions } from "../data/constants";

// Style cho React-Select (Dark Mode)
const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#1e293b",
    borderColor: "#475569",
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
  
  const [formData, setFormData] = useState({
    title: "",
    company: userData?.companyName || "Tech Corp",
    location: "Hà Nội",
    type: "Full-time",
    skills: [],
    description: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // --- HÀM GỌI AI VIẾT JD ---
  const handleGenerateJD = async () => {
    if (!formData.title) {
      alert("Vui lòng nhập 'Vị trí công việc' trước để AI có thể viết!");
      return;
    }
    
    setIsGenerating(true);
    try {
      const skillsText = formData.skills.map(s => s.value).join(", ");
      
      const response = await fetch("https://lakeisha-unhumorous-histographically.ngrok-free.dev//generate_jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title, skills: skillsText })
      });
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, description: data.jd_content }));
      
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI đang bận, vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    
    // Giả lập gọi API Post Job (Bạn thay bằng API thật của Java/Python backend)
    // await api.post("/jobs", { ...formData, skills: formData.skills.map(s=>s.value) });
    
    setTimeout(() => {
      alert("Đăng tin tuyển dụng thành công!");
      setIsPosting(false);
      onSuccess(); // Báo cho cha biết để đóng form và reload list
    }, 1000);
  };

  return (
    <div className="bg-slate-800 border border-green-500/30 rounded-xl p-6 mb-8 shadow-2xl animate-fade-in-down">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-white">✨ Đăng tin tuyển dụng mới</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">✕ Đóng</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột Trái */}
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-semibold">Vị trí công việc</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 outline-none"
                placeholder="VD: Senior React Developer"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-gray-300 text-sm font-semibold">Địa điểm</label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-gray-300 text-sm font-semibold">Loại hình</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Remote</option>
                    </select>
                </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-semibold">Kỹ năng yêu cầu</label>
              <Creatable
                isMulti
                options={skillOptions}
                styles={customSelectStyles}
                value={formData.skills}
                onChange={(val) => setFormData({...formData, skills: val})}
                placeholder="Chọn hoặc nhập kỹ năng..."
              />
            </div>
          </div>

          {/* Cột Phải: Description + AI Button */}
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
                <label className="text-gray-300 text-sm font-semibold">Mô tả công việc (JD)</label>
                
                {/* NÚT AI THẦN THÁNH */}
                <button 
                    type="button"
                    onClick={handleGenerateJD}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded-full transition-all shadow-lg transform hover:scale-105"
                >
                    {isGenerating ? "🤖 AI đang viết..." : "✨ AI Viết giúp tôi"}
                </button>
            </div>
            
            <textarea 
                className="flex-1 w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-gray-200 focus:border-green-500 outline-none leading-relaxed"
                rows="8"
                placeholder="Nhập mô tả hoặc bấm nút AI ở trên để tự động tạo..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
            ></textarea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-700 pt-4">
            <button 
                type="button" 
                onClick={onCancel}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
            >
                Hủy bỏ
            </button>
            <button 
                type="submit" 
                disabled={isPosting}
                className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg"
            >
                {isPosting ? "Đang đăng..." : "Đăng tin ngay 🚀"}
            </button>
        </div>
      </form>
    </div>
  );
};

export default InlinePostJob;