// src/components/InlineJobApplication.jsx
import { useState } from "react";
import { useSelector } from "react-redux";

const InlineJobApplication = ({ job, onSubmit, onCancel }) => {
  const user = useSelector((state) => state.auth.userData);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    cvLink: user?.cvLink || "", // Nếu có sẵn link CV
    coverLetter: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gửi dữ liệu kèm jobId
    onSubmit({ ...formData, jobId: job.id || job._id });
  };

  return (
    <div className="bg-gray-800 border border-green-600 rounded-xl p-6 mt-4 shadow-inner animate-fade-in-down">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <h3 className="text-lg font-bold text-green-400">
          📝 Ứng tuyển: {job.position}
        </h3>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          ✕ Đóng
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Họ tên</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-green-500 focus:outline-none"
              placeholder="Nguyen Van A"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-green-500 focus:outline-none"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
             <label className="block text-sm text-gray-300 mb-1">Số điện thoại</label>
             <input
               type="text"
               name="phone"
               required
               value={formData.phone}
               onChange={handleChange}
               className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-green-500 focus:outline-none"
               placeholder="0909xxxxxx"
             />
          </div>
          {/* CV Link */}
          <div>
             <label className="block text-sm text-gray-300 mb-1">Link CV (Google Drive/PDF)</label>
             <input
               type="text"
               name="cvLink"
               required
               value={formData.cvLink}
               onChange={handleChange}
               className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-green-500 focus:outline-none"
               placeholder="https://drive.google.com/..."
             />
          </div>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Thư giới thiệu (Cover Letter)</label>
          <textarea
            name="coverLetter"
            rows="3"
            value={formData.coverLetter}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-green-500 focus:outline-none"
            placeholder="Tại sao bạn thích công việc này?"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm font-medium transition"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-bold shadow-lg transition transform hover:scale-105"
          >
            🚀 Gửi hồ sơ ngay
          </button>
        </div>
      </form>
    </div>
  );
};

export default InlineJobApplication;