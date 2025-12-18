import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import api from "../api/axiosConfig";
import JobsList from "../components/JobsList";
import AICopilot from "../components/AICopilot"; 
import Confirmation from "../components/modals/Confirmation"; 

const JobListings = () => {
  const userData = useSelector((state) => state.auth.userData);

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // State cho Modal thông báo thành công
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const [jobs, setJobs] = useState([]);
  
  // CV Matching states
  const [cvMatches, setCvMatches] = useState(null);
  const [jobScores, setJobScores] = useState({});
  
  // STATE CHO AI: Job đang được chọn để phân tích
  const [selectedJob, setSelectedJob] = useState(null);

  // STATE CHO INLINE APPLY: ID của Job đang mở form ứng tuyển
  const [applyingJobId, setApplyingJobId] = useState(null);

  // 🟢 QUAN TRỌNG: STATE QUẢN LÝ VIỆC ĐĂNG BÀI (Để đồng bộ giữa List và Sidebar)
  const [isPostingJob, setIsPostingJob] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const jobsResponse = await api.get("/jobs");
        let fetchedJobs = jobsResponse.data;
        
        // Kiểm tra xem có CV matches trong localStorage không
        const storedMatches = localStorage.getItem("cvMatches");
        if (storedMatches) {
          const matches = JSON.parse(storedMatches);
          setCvMatches(matches);
          
          // Tạo map điểm số cho từng job
          const scores = {};
          matches.forEach(match => {
            scores[match.id] = match.score;
          });
          setJobScores(scores);
          
          // Sắp xếp jobs theo điểm matching (cao → thấp)
          fetchedJobs = fetchedJobs.sort((a, b) => {
            const scoreA = scores[a.id || a._id] || 0;
            const scoreB = scores[b.id || b._id] || 0;
            return scoreB - scoreA;
          });
          
          // Xóa localStorage sau khi sử dụng (optional)
          // localStorage.removeItem("cvMatches");
        }
        
        setJobs(fetchedJobs);
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
      const applyResponse = await api.post("/applications", formData);

      if (applyResponse.status === 201) {
        setApplyingJobId(null);
        
        const jobApplied = jobs.find(j => (j.id || j._id) === formData.get("jobId")); // Lưu ý: formData.get nếu dùng FormData
        
        setConfirmationMessage(
          `Successfully applied to the job: ${jobApplied?.position || 'the position'}`
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

  // --- LOGIC DELETE ---
  const deleteJob = async (job) => {
    setActionLoading(true);

    try {
      const deleteResponse = await api.delete(`/jobs/${job.id}`);
      const deleteOk = deleteResponse.status === 204 || deleteResponse.status === 200;

      if (deleteOk) {
        setJobs(jobs.filter((item) => item.id !== job.id));
        
        setConfirmationMessage(
          `Successfully deleted the job: ${job?.position} at ${job?.company}`
        );
        setIsConfirmationModalOpen(true);

        // Xóa job khỏi danh sách recruiter
        if (userData?.email) {
            try {
              await api.post(`/recruiters/${userData.email}/removejob`, { jobId: job.id });
            } catch (unlinkError) {
              console.log("Unlink error:", unlinkError);
            }
        }

        // Reset AI nếu xóa đúng job đang chọn
        if (selectedJob?.id === job.id) {
            setSelectedJob(null);
        }
        
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
          
          {/* --- CỘT TRÁI: DANH SÁCH JOB --- */}
          <div className="flex-1 h-full overflow-y-auto pr-2 custom-scrollbar">
            <JobsList
              actionLoading={actionLoading}
              jobs={jobs}
              jobScores={jobScores}
              onDelete={deleteJob}
              
              // Props cho AI (Candidate)
              setSelectedJob={setSelectedJob} 
              activeJobId={selectedJob?.id || selectedJob?._id}
              
              // Props cho Inline Apply (Candidate)
              applyingJobId={applyingJobId}
              setApplyingJobId={setApplyingJobId}
              onApplySubmit={handleApplySubmit}

              // 🟢 QUAN TRỌNG: Props cho Post Job (Recruiter)
              isPostingJob={isPostingJob}       // Truyền state xuống
              setIsPostingJob={setIsPostingJob} // Truyền hàm set xuống
            />
          </div>

          {/* --- CỘT PHẢI: AI COPILOT --- */}
          <div className="hidden lg:block w-[400px] xl:w-[450px] h-full transition-all duration-500 ease-in-out">
             <div className="h-full rounded-2xl overflow-hidden border border-gray-700 shadow-2xl bg-gray-800">
                <AICopilot 
                    selectedJob={selectedJob} 
                    isPostingJob={isPostingJob} // 🟢 QUAN TRỌNG: Truyền vào để Sidebar biết khi nào đổi giao diện
                />
             </div>
          </div>

        </div>
      )}

      <Confirmation
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        message={confirmationMessage}
      />
    </div>
  );
};

export default JobListings;