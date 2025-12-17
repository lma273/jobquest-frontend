import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const JobsList = ({
  actionLoading,
  jobs = [],
  onApply,
  onDelete,
  setSelectedJob, // Hàm set job cho AI
  activeJobId,    // ID job đang chọn để highlight
}) => {
  const navigate = useNavigate();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isRecruiter = useSelector((state) => state.auth.isRecruiter);
  const userData = useSelector((state) => state.auth.userData) || {};

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Xử lý khi bấm nút Apply (chặn sự kiện nổi bọt để không trigger AI select lại)
  const handleApplyClick = (e, job) => {
    e.stopPropagation(); 
    setSelectedJob(job);
    onApply();
  };

  const handleDeleteClick = (e, job) => {
    e.stopPropagation();
    onDelete(job);
  };

  // Xử lý khi bấm vào cả cái thẻ (Chọn để AI phân tích)
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
            className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-all shadow-md"
          >
            + Post New Job
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 pb-20">
        {jobs.length > 0 ? (
          jobs.map((job) => {
            // Kiểm tra xem job này có đang được chọn không
            const isActive = (job.id || job._id) === activeJobId;

            return (
              <div
                key={job.id || job._id}
                onClick={() => handleCardClick(job)} // Bấm vào thẻ để AI chạy
                className={`
                  p-5 flex justify-between items-start gap-4 border rounded-xl cursor-pointer transition-all duration-300
                  ${isActive 
                    ? "border-green-500 bg-gray-800 shadow-[0_0_15px_rgba(34,197,94,0.2)] scale-[1.01]" 
                    : "border-gray-700 bg-gray-900 hover:border-green-500/50 hover:bg-gray-800 hover:shadow-lg"
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
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                       {job.experience || "0 years"} Exp
                    </span>
                    {(job.skills || []).slice(0, 3).map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 border border-gray-600">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Buttons Area */}
                <div className="flex flex-col items-end gap-2">
                  {isRecruiter && (userData.jobIds || []).includes(job.id || job._id) ? (
                    <button
                      onClick={(e) => handleDeleteClick(e, job)}
                      disabled={actionLoading}
                      className={`px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-semibold transition-all ${
                        actionLoading && "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleApplyClick(e, job)}
                      disabled={isRecruiter}
                      className={`px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-semibold transition-all shadow-md ${
                        isRecruiter && "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="opacity-80 text-center py-10">No jobs found. Please check back later.</p>
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
};

export default JobsList;