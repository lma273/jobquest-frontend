import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import Creatable from "react-select/creatable";
import { skillOptions, qualificationOptions } from "../data/constants";

// Custom Style cho React-Select để hợp với Dark Mode
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

  // --- LOGIC STATE GIỮ NGUYÊN TỪ CODE CŨ ---
  const [applicationForm, setApplicationForm] = useState({
    jobId: "",
    name: "",
    qualification: "",
    skills: [],
    email: "",
    phone: "",
    resumeLink: "",
  });

  useEffect(() => {
    setApplicationForm((prev) => ({
      ...prev,
      name: userData?.name || "",
      email: userData?.email || "",
      // Map skills từ string sang object {value, label} cho react-select
      skills: userData?.skills?.map((item) => ({ value: item, label: item })) || [],
    }));
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Chuẩn hóa dữ liệu trước khi gửi (Logic cũ)
    const updatedForm = {
      ...applicationForm,
      jobId: job?.id || job?._id,
      qualification: applicationForm.qualification?.value || "",
      skills: applicationForm.skills.map((item) => item.value), // Lấy value từ select
      status: "Pending",
    };

    console.log("Submitting:", updatedForm);
    
    // Gọi hàm từ parent (JobListings)
    await onSubmit(updatedForm);
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-800 border border-green-600/50 rounded-xl p-6 mt-4 shadow-2xl animate-fade-in-down">
      {/* Header Form */}
      <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
        <div>
          <h3 className="text-xl font-bold text-green-400">
            🚀 Ứng tuyển: {job?.position}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {job?.company} • {job?.location} • {job?.experience} Exp required
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors text-sm"
        >
          ✕ Đóng
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CỘT TRÁI */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={applicationForm.name}
              readOnly
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={applicationForm.email}
              readOnly
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone <span className="text-red-500">*</span></label>
            <input
              type="tel"
              value={applicationForm.phone}
              onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
              placeholder="(e.g. +84 909 123 ***)"
              required
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="space-y-4">
          {/* Skills (React Select) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Skills</label>
            <Creatable
              options={skillOptions}
              isMulti
              value={applicationForm.skills}
              onChange={(selected) => setApplicationForm({ ...applicationForm, skills: selected })}
              styles={customSelectStyles}
              placeholder="Select or type skills..."
              className="text-sm"
            />
          </div>

          {/* Qualification (React Select) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Qualification</label>
            <Select
              options={qualificationOptions}
              value={applicationForm.qualification}
              onChange={(selected) => setApplicationForm({ ...applicationForm, qualification: selected })}
              styles={customSelectStyles}
              placeholder="Select qualification..."
              className="text-sm"
            />
          </div>

          {/* Resume Link */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Resume Link (PDF/Drive) <span className="text-red-500">*</span></label>
            <input
              type="url"
              value={applicationForm.resumeLink}
              onChange={(e) => setApplicationForm({ ...applicationForm, resumeLink: e.target.value })}
              placeholder="https://drive.google.com/..."
              required
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Action Buttons (Full width) */}
        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-700 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InlineJobApplication;