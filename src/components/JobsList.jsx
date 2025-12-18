// src/components/JobsList.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import InlineJobApplication from "./InlineJobApplication"; // Form ứng tuyển cho Candidate
import InlinePostJob from "./InlinePostJob"; // Form đăng bài cho Recruiter (Có AI)

const JobsList = ({
  jobs = [],
  onApplySubmit, // Hàm xử lý khi ứng viên submit form (gọi API nộp đơn)
  onDelete,      // Hàm xóa job (dành cho recruiter)
  setSelectedJob, 
  activeJobId,   // ID của job đang được chọn xem bên AI Copilot
  // Props quản lý form ứng tuyển
  applyingJobId, 
  setApplyingJobId 
}) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isRecruiter = useSelector((state) => state.auth.isRecruiter);
  
  // State quản lý việc mở form đăng tuyển dụng (Inline)
  const [isPostingJob, setIsPostingJob] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  // --- XỬ LÝ ỨNG VIÊN (CANDIDATE) ---
  const handleApplyClick = (e, job) => {
    e.stopPropagation(); // Không trigger việc chọn job cho AI Copilot
    
    // Toggle: Nếu đang mở đúng job này thì đóng, ngược lại thì mở
    if (applyingJobId === (job.id || job._id)) {
      setApplyingJobId(null);
    } else {
      setApplyingJobId(job.id || job._id);
      setSelectedJob(job); // Tự động chọn job này để AI có context tư vấn luôn
    }
  };

  // --- XỬ LÝ CHUNG ---
  const handleCardClick = (job) => {
    setSelectedJob(job);
  };

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-4">Available Jobs</h1>
      
      {/* --- KHU VỰC CỦA NHÀ TUYỂN DỤNG (RECRUITER) --- */}
      {isRecruiter && (
        <div className="my-6">
          {!isPostingJob ? (
            // 1. Nút mở form đăng bài
            <button
              onClick={() => setIsPostingJob(true)}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-all shadow-md flex items-center gap-2"
            >
              <span className="text-xl">+</span> Post New Job
            </button>
          ) : (
            // 2. Form đăng bài Inline (Có tích hợp AI viết JD)
            <InlinePostJob 
                onCancel={() => setIsPostingJob(false)}
                onSuccess={() => {
                    setIsPostingJob(false);
                    // Ở đây bạn có thể gọi hàm reload lại danh sách job nếu cần
                    // ví dụ: window.location.reload(); hoặc gọi prop onRefresh()
                }}
            />
          )}
        </div>
      )}
      
      {/* --- DANH SÁCH VIỆC LÀM --- */}
      <div className="flex flex-col gap-4 pb-20">
        {jobs.length > 0 ? (
          jobs.map((job) => {
            const jobId = job.id || job._id;
            const isActive = jobId === activeJobId;      // Job đang được xem bởi AI Copilot
            const isApplying = jobId === applyingJobId;  // Job đang mở form nộp đơn

            return (
              <div key={jobId}>
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
                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                       {(job.skills || []).slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 border border-gray-600">{s}</span>
                       ))}
                       {(job.skills || []).length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">+{job.skills.length - 3} more</span>
                       )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Nút Apply (Chỉ hiện cho Candidate) */}
                    {!isRecruiter && (
                      <button
                        onClick={(e) => handleApplyClick(e, job)}
                        className={`px-6 py-2 rounded-lg text-white text-sm font-semibold transition-all shadow-md ${
                           isApplying 
                           ? "bg-gray-600 hover:bg-gray-500" // Màu xám khi đang mở form (nút Close)
                           : "bg-green-600 hover:bg-green-700" // Màu xanh khi chưa mở (nút Apply)
                        }`}
                      >
                        {isApplying ? "Close" : "Apply"} 
                      </button>
                    )}

                    {/* Nút Delete (Chỉ hiện cho Recruiter) */}
                    {isRecruiter && onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm("Bạn có chắc muốn xóa job này?")) onDelete(jobId);
                            }}
                            className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white text-sm font-semibold transition-all border border-red-600/50"
                        >
                            Delete
                        </button>
                    )}
                  </div>
                </div>

                {/* 2. FORM ỨNG TUYỂN INLINE (HIỆN KHI BẤM APPLY) */}
                {isApplying && !isRecruiter && (
                  <div className="pl-4 border-l-2 border-green-600 ml-4 mb-4 animate-fade-in-down"> 
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
          <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800 border-dashed">
            <p className="text-gray-500 text-lg">Chưa có công việc nào được đăng.</p>
          </div>
        )}
      </div>
    </div>
  );
};

JobsList.propTypes = {
  jobs: PropTypes.arrayOf(PropTypes.object),
  onApplySubmit: PropTypes.func, // Hàm xử lý submit form ứng tuyển
  onDelete: PropTypes.func,      // Hàm xử lý xóa job
  setSelectedJob: PropTypes.func,
  activeJobId: PropTypes.string,
  applyingJobId: PropTypes.string,
  setApplyingJobId: PropTypes.func,
};

export default JobsList;