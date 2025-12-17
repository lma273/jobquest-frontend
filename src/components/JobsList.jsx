// src/components/JobsList.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import InlineJobApplication from "./InlineJobApplication"; // Import form mới

const JobsList = ({
  actionLoading,
  jobs = [],
  onApplySubmit, // Hàm gửi API (từ trang cha truyền xuống)
  onDelete,
  setSelectedJob, 
  activeJobId,
  // Thêm 2 props mới để quản lý việc mở form inline
  applyingJobId, 
  setApplyingJobId 
}) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isRecruiter = useSelector((state) => state.auth.isRecruiter);
  const userData = useSelector((state) => state.auth.userData) || {};

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  // Khi ấn nút Apply trên thẻ Job
  const handleApplyClick = (e, job) => {
    e.stopPropagation(); // Không trigger AI select
    
    // Nếu đang mở đúng job này rồi thì đóng lại (Toggle)
    if (applyingJobId === (job.id || job._id)) {
      setApplyingJobId(null);
    } else {
      setApplyingJobId(job.id || job._id); // Mở form của job này
      setSelectedJob(job); // (Tùy chọn) Có thể set luôn cho AI chạy phân tích job này
    }
  };

  const handleCardClick = (job) => {
    setSelectedJob(job);
  };

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-4">Available Jobs</h1>
      
      {isRecruiter && (
        <div className="my-6">
          <button
            onClick={() => navigate("/postjob")}
            className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-all shadow-md flex items-center gap-2"
          >
            <span className="text-xl">+</span> Post New Job
          </button>
        </div>
      )}
      
      <div className="flex flex-col gap-4 pb-20">
        {jobs.length > 0 ? (
          jobs.map((job) => {
            const isActive = (job.id || job._id) === activeJobId;
            const isApplying = (job.id || job._id) === applyingJobId; // Kiểm tra xem có đang mở form không

            return (
              <div key={job.id || job._id}>
                {/* 1. THẺ JOB CARD */}
                <div
                  onClick={() => handleCardClick(job)}
                  className={`
                    p-5 flex justify-between items-start gap-4 border rounded-xl cursor-pointer transition-all duration-300
                    ${isActive 
                      ? "border-green-500 bg-gray-800 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                      : "border-gray-700 bg-gray-900 hover:border-green-500/50 hover:bg-gray-800"
                    }
                  `}
                >
                  <div className="flex-1">
                    <h2 className={`text-xl font-bold mb-1 ${isActive ? 'text-green-400' : 'text-white'}`}>
                      {job.position}
                    </h2>
                    <p className="opacity-80 text-sm mb-3">
                      {job.company} • {job.location}
                    </p>
                    {/* Skills ... */}
                    <div className="flex flex-wrap gap-2 mb-2">
                       {(job.skills || []).slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 border border-gray-600">{s}</span>
                       ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {!isRecruiter && (
                      <button
                        onClick={(e) => handleApplyClick(e, job)}
                        className={`px-6 py-2 rounded-lg text-white text-sm font-semibold transition-all shadow-md ${
                           isApplying 
                           ? "bg-gray-600 hover:bg-gray-500" // Đổi màu nút khi đang mở form
                           : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {isApplying ? "Close" : "Apply"} 
                      </button>
                    )}
                    {/* ... Delete button ... */}
                  </div>
                </div>

                {/* 2. FORM ỨNG TUYỂN (HIỆN NGAY BÊN DƯỚI NẾU ĐƯỢC CHỌN) */}
                {isApplying && (
                  <div className="pl-4 border-l-2 border-green-600 ml-4 mb-4"> 
                     {/* Thêm div bọc để tạo hiệu ứng thụt đầu dòng */}
                     <InlineJobApplication 
                        job={job}
                        onSubmit={onApplySubmit}
                        onCancel={() => setApplyingJobId(null)}
                     />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="opacity-80 text-center py-10">No jobs found.</p>
        )}
      </div>
    </div>
  );
};

JobsList.propTypes = {
  actionLoading: PropTypes.bool,
  jobs: PropTypes.arrayOf(PropTypes.object),
  onApply: PropTypes.func,
  onDelete: PropTypes.func,
  setSelectedJob: PropTypes.func,
  activeJobId: PropTypes.string, // Prop mới
  applyingJobId: PropTypes.string,
  setApplyingJobId: PropTypes.func,
  onApplySubmit: PropTypes.func
};

export default JobsList;