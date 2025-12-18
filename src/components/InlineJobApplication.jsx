import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import Creatable from "react-select/creatable";
import { skillOptions, qualificationOptions } from "../data/constants";

// Custom Style cho React-Select (Dark Mode)
const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#1e293b", // slate-800
    borderColor: "#475569", // slate-600
    color: "white",
    padding: "2px",
    borderRadius: "0.5rem",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1e293b",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#334155" : "#1e293b",
    color: "white",
  }),
  singleValue: (base) => ({ ...base, color: "white" }),
  multiValue: (base) => ({ ...base, backgroundColor: "#334155" }),
  multiValueLabel: (base) => ({ ...base, color: "white" }),
  multiValueRemove: (base) => ({ ...base, color: "white", ':hover': { backgroundColor: '#ef4444' } }),
  input: (base) => ({ ...base, color: "white" }),
};

const InlineJobApplication = ({ job, onSubmit, onCancel }) => {
  const userData = useSelector((state) => state.auth.userData);
  const [isLoading, setIsLoading] = useState(false);

  // State cho các trường text
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: null,
    skills: [],
  });

  // State riêng cho File
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    setApplicationForm((prev) => ({
      ...prev,
      name: userData?.name || "",
      email: userData?.email || "",
      // Map skills từ mảng string sang object {value, label} cho react-select
      skills: userData?.skills?.map((item) => ({ value: item, label: item })) || [],
    }));
  }, [userData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // QUAN TRỌNG: Dùng FormData để gửi File
    const formData = new FormData();
    
    // Append các trường text
    formData.append("jobId", job?.id || job?._id);
    formData.append("userId", userData?._id || userData?.id || "");
    formData.append("name", applicationForm.name);
    formData.append("email", applicationForm.email);
    formData.append("phone", applicationForm.phone);
    formData.append("qualification", applicationForm.qualification?.value || "");
    formData.append("status", "Pending");

    // Append Skills (Backend Java thường nhận List<String> từ nhiều param cùng tên 'skills')
    if (applicationForm.skills && applicationForm.skills.length > 0) {
        applicationForm.skills.forEach(skill => {
            formData.append("skills", skill.value);
        });
    }

    // Append File
    if (resumeFile) {
      formData.append("resume", resumeFile);
    } else {
      alert("Vui lòng chọn file CV!");
      setIsLoading(false);
      return;
    }

    // Gọi hàm submit từ parent (JobListings)
    // Axios sẽ tự động nhận diện FormData và set header 'multipart/form-data'
    try {
        await onSubmit(formData);
    } catch (error) {
        console.error("Lỗi khi submit form:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-green-600/50 rounded-xl p-6 mt-4 shadow-2xl animate-fade-in-down">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
        <div>
          <h3 className="text-xl font-bold text-green-400">
            🚀 Ứng tuyển: {job?.position}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {job?.company} • {job?.location}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex gap-3">
            <span>💼 {job?.experience || 'N/A'}</span>
            <span>📋 {job?.jobType || 'Full-time'}</span>
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors text-sm"
        >
          ✕ Đóng
        </button>
      </div>

      {/* 📄 JOB DESCRIPTION */}
      {job?.description && (
        <div className="mb-6 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
            📄 Mô tả công việc
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
          {/* Skills tags */}
          {job?.skills && job.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Kỹ năng yêu cầu:</span>
              {job.skills.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-slate-700 rounded text-xs text-green-400 border border-green-600/30">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CỘT TRÁI */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Họ tên</label>
            <input
              type="text"
              value={applicationForm.name}
              readOnly
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={applicationForm.email}
              readOnly
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
            <input
              type="tel"
              value={applicationForm.phone}
              onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
              placeholder="Nhập số điện thoại..."
              required
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Kỹ năng (Skills)</label>
            <Creatable
              options={skillOptions}
              isMulti
              value={applicationForm.skills}
              onChange={(selected) => setApplicationForm({ ...applicationForm, skills: selected })}
              styles={customSelectStyles}
              placeholder="Chọn hoặc nhập kỹ năng..."
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Trình độ (Qualification)</label>
            <Select
              options={qualificationOptions}
              value={applicationForm.qualification}
              onChange={(selected) => setApplicationForm({ ...applicationForm, qualification: selected })}
              styles={customSelectStyles}
              placeholder="Chọn trình độ..."
              className="text-sm"
            />
          </div>

          {/* UPLOAD FILE PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Upload CV (PDF) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
              className="w-full text-sm text-gray-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-slate-700 file:text-white
                file:cursor-pointer hover:file:bg-slate-600
                border border-slate-600 rounded-lg cursor-pointer bg-slate-900 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận file định dạng .pdf</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-700 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
          >
            Hủy bỏ
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold shadow-lg transition-all flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? "Đang gửi..." : "Nộp hồ sơ"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InlineJobApplication;