import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import api from "../api/axiosConfig";
import JobsList from "../components/JobsList";
import AICopilot from "../components/AICopilot"; 
import Confirmation from "../components/modals/Confirmation"; 

const JobListings = () => {
  const userData = useSelector((state) => state.auth.userData);
  const isRecruiter = useSelector((state) => state.auth.isRecruiter); // ✅ Lấy từ Redux store
  
  // 🔍 DEBUG: Kiểm tra giá trị
  console.log("🔍 JobListings - isRecruiter:", isRecruiter);
  console.log("🔍 JobListings - userData:", userData); 

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

  // 🟢 QUAN TRỌNG: STATE QUẢN LÝ VIỆC ĐĂNG BÀI
  const [isPostingJob, setIsPostingJob] = useState(false);
  
  // 🔍 STATE TÌM KIẾM
  const [searchQuery, setSearchQuery] = useState("");
  
  // 📝 STATE LƯU THÔNG TIN FORM ĐỂ TRUYỀN CHO CHATBOT
  const [jobFormData, setJobFormData] = useState({ title: "", experience: "" });

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const jobsResponse = await api.get("/jobs");
        const fetchedJobs = jobsResponse.data;
        
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);
  
  // Hàm refetch jobs (dùng khi post job thành công)
  const refetchJobs = async () => {
    try {
      const jobsResponse = await api.get("/jobs");
      setJobs(jobsResponse.data);
    } catch (error) {
      console.error("Error refetching jobs:", error);
    }
  };
  
  // Filter jobs dựa trên searchQuery
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.position?.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query) ||
      job.skills?.some(skill => skill.toLowerCase().includes(query))
    );
  });

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  // --- LOGIC APPLY (INLINE) ---
  const handleApplySubmit = async (formData) => {
    try {
      const applyResponse = await api.post("/applications", formData);

      if (applyResponse.status === 201) {
        setApplyingJobId(null);
        
        const jobApplied = jobs.find(j => (j.id || j._id) === formData.get("jobId"));
        
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
              jobs={filteredJobs}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onDelete={deleteJob}
              
              // 🟢 3. Chặn sự kiện chọn Job nếu là Recruiter
              setSelectedJob={(job) => {
                if (isRecruiter) return; // Nếu là Recruiter thì không làm gì cả
                setSelectedJob(job);
              }} 
              
              activeJobId={selectedJob?.id || selectedJob?._id}
              
              // Props cho Inline Apply
              applyingJobId={applyingJobId}
              setApplyingJobId={setApplyingJobId}
              onApplySubmit={handleApplySubmit}

              // Props cho Post Job
              isPostingJob={isPostingJob}       
              setIsPostingJob={setIsPostingJob}
              refetchJobs={refetchJobs}
              setJobFormData={setJobFormData}
            />
          </div>

          {/* --- CỘT PHẢI: AI COPILOT --- */}
          <div className="hidden lg:block w-[400px] xl:w-[450px] h-full transition-all duration-500 ease-in-out">
             <div className="h-full rounded-2xl overflow-hidden border border-gray-700 shadow-2xl bg-gray-800">
                
                {/* AI Copilot tự động xử lý cả Recruiter và Candidate */}
                <AICopilot 
                  selectedJob={selectedJob} 
                  isPostingJob={isPostingJob}
                  jobFormData={jobFormData}
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