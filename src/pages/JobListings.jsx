import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import api from "../api/axiosConfig";
import JobsList from "../components/JobsList";
import AICopilot from "../components/AICopilot"; 
import Confirmation from "../components/modals/Confirmation"; 
// Lưu ý: Đã bỏ import JobApplication modal vì chuyển sang dùng Inline Form

const JobListings = () => {
  const userData = useSelector((state) => state.auth.userData);

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // State cho Modal thông báo thành công
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const [jobs, setJobs] = useState([]);
  
  // STATE CHO AI: Job đang được chọn để phân tích
  const [selectedJob, setSelectedJob] = useState(null);

  // STATE CHO INLINE APPLY: ID của Job đang mở form ứng tuyển
  const [applyingJobId, setApplyingJobId] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const jobsResponse = await api.get("/jobs");
        setJobs(jobsResponse.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  // --- LOGIC APPLY (INLINE) ---
  const handleApplySubmit = async (formData) => {
    try {
      // formData gồm { name, email, cvLink..., jobId } từ InlineForm gửi lên
      const applyResponse = await api.post("/applications", formData);

      if (applyResponse.status === 201) {
        // 1. Đóng form inline lại
        setApplyingJobId(null);
        
        // 2. Tìm thông tin job để hiện thông báo cho đẹp
        const jobApplied = jobs.find(j => (j.id || j._id) === formData.jobId);
        
        setConfirmationMessage(
          `Successfully applied to the job: ${jobApplied?.position}`
        );
        setIsConfirmationModalOpen(true);
      }
    } catch (error) {
      console.log(error);
      setConfirmationMessage(
        "Some error occurred while applying for the job. Kindly try again!"
      );
      setIsConfirmationModalOpen(true);
    }
  };

  // --- LOGIC DELETE (GIỮ NGUYÊN) ---
  const deleteJob = async (job) => {
    setActionLoading(true);

    try {
      const deleteResponse = await api.delete(`/jobs/${job.id}`);
      const deleteOk = deleteResponse.status === 204 || deleteResponse.status === 200;

      if (deleteOk) {
        // Cập nhật lại danh sách job trên UI
        setJobs(jobs.filter((item) => item.id !== job.id));
        
        setConfirmationMessage(
          `Successfully deleted the job: ${job?.position} at ${job?.company}`
        );
        setIsConfirmationModalOpen(true);

        // Xóa job khỏi danh sách của recruiter (nếu API hỗ trợ)
        if (userData?.email) {
            try {
              await api.post(
                `/recruiters/${userData.email}/removejob`,
                job.id
              );
            } catch (unlinkError) {
              console.log("Unlink error:", unlinkError);
            }
        }

        // QUAN TRỌNG: Nếu xóa đúng cái job đang hiện trên AI Panel thì reset AI
        if (selectedJob?.id === job.id) {
            setSelectedJob(null);
        }
        
        // Nếu xóa đúng job đang mở form apply thì cũng reset
        if (applyingJobId === job.id) {
            setApplyingJobId(null);
        }

      } else {
        setConfirmationMessage("Some error occurred while deleting the job.");
        setIsConfirmationModalOpen(true);
      }
    } catch (error) {
      console.log(error);
      setConfirmationMessage("Some error occurred while deleting the job.");
      setIsConfirmationModalOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="pt-24 px-4 lg:px-6 h-screen overflow-hidden flex flex-col bg-gray-900">
      
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
           <p className="text-white text-lg font-bold animate-pulse">Loading Jobs...</p>
        </div>
      ) : (
        <div className="flex flex-1 gap-6 h-full pb-4">
          
          {/* --- CỘT TRÁI: DANH SÁCH JOB (Scrollable) --- */}
          <div className="flex-1 h-full overflow-y-auto pr-2 custom-scrollbar">
            <JobsList
              actionLoading={actionLoading}
              jobs={jobs}
              onDelete={deleteJob}
              
              // Props cho AI (Click thẻ job -> AI chạy)
              setSelectedJob={setSelectedJob} 
              activeJobId={selectedJob?.id || selectedJob?._id}
              
              // Props cho Inline Apply (Click Apply -> Mở form dưới thẻ job)
              applyingJobId={applyingJobId}
              setApplyingJobId={setApplyingJobId}
              onApplySubmit={handleApplySubmit}
            />
          </div>

          {/* --- CỘT PHẢI: AI COPILOT (Cố định) --- */}
          {/* Ẩn trên mobile, hiện trên màn hình lớn */}
          <div className="hidden lg:block w-[400px] xl:w-[450px] h-full transition-all duration-500 ease-in-out">
             <div className="h-full rounded-2xl overflow-hidden border border-gray-700 shadow-2xl bg-gray-800">
                <AICopilot selectedJob={selectedJob} />
             </div>
          </div>

        </div>
      )}

      {/* Chỉ còn Modal thông báo thành công (Modal Apply đã bỏ) */}
      <Confirmation
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        message={confirmationMessage}
      />
    </div>
  );
};

export default JobListings;