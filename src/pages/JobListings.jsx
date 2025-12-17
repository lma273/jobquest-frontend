import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import api from "../api/axiosConfig";
import JobsList from "../components/JobsList";
import JobApplication from "../components/modals/JobApplication";
import Confirmation from "../components/modals/Confirmation";
import AICopilot from "../components/AICopilot"; // Import Component AI mới

const JobListings = () => {
  const userData = useSelector((state) => state.auth.userData);

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [isJobApplicationModalOpen, setIsJobApplicationModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [jobs, setJobs] = useState([]);
  
  // STATE MỚI: Dùng để lưu job đang được chọn cho AI phân tích
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      const jobsResponse = await api.get("/jobs");
      setJobs(jobsResponse.data);
      setIsLoading(false);
    };

    fetchJobs();
  }, []);

  const openApplicationModal = () => {
    setIsJobApplicationModalOpen(true);
  };

  const closeApplicationModal = () => {
    setIsJobApplicationModalOpen(false);
  };

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  // --- LOGIC APPLY (GIỮ NGUYÊN) ---
  const applyForJob = async (formData) => {
    try {
      // Lưu ý: selectedJob ở đây là job đang được chọn để apply
      const applyResponse = await api.post("/applications", formData);

      if (applyResponse.status === 201) {
        closeApplicationModal();
        setConfirmationMessage(
          `Successfully applied to the job: ${selectedJob?.position} at ${selectedJob?.company}`
        );
        openConfirmationModal();
      }
    } catch (error) {
      console.log(error);
      closeApplicationModal();
      setConfirmationMessage(
        "Some error occurred while applying for the job. Kindly try again!"
      );
      openConfirmationModal();
    }
  };

  // --- LOGIC DELETE (GIỮ NGUYÊN & CẬP NHẬT AI STATE) ---
  const deleteJob = async (job) => {
    setActionLoading(true);

    try {
      const deleteResponse = await api.delete(`/jobs/${job.id}`);
      const deleteOk = deleteResponse.status === 204 || deleteResponse.status === 200;

      if (deleteOk) {
        // Cập nhật lại danh sách job
        setJobs(jobs.filter((item) => item.id !== job.id));
        
        setConfirmationMessage(
          `Successfully deleted the job: ${job?.position} at ${job?.company}`
        );
        openConfirmationModal();

        // Xóa khỏi danh sách job của recruiter
        try {
          await api.post(
            `/recruiters/${userData.email}/removejob`,
            job.id
          );
        } catch (unlinkError) {
          console.log(unlinkError);
        }

        // QUAN TRỌNG: Nếu xóa đúng cái job đang hiện trên AI Panel thì reset AI về null
        if (selectedJob?.id === job.id) {
            setSelectedJob(null);
        }

      } else {
        setConfirmationMessage(
          "Some error occurred while deleting the job. Kindly try again!"
        );
        openConfirmationModal();
      }
    } catch (error) {
      console.log(error);
      setConfirmationMessage(
        "Some error occurred while deleting the job. Kindly try again!"
      );
      openConfirmationModal();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    // THAY ĐỔI LAYOUT: Dùng h-screen và flex để chia cột, background tối
    <div className="pt-24 px-4 lg:px-6 h-screen overflow-hidden flex flex-col bg-gray-900">
      
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-white text-lg font-bold animate-pulse">Loading Jobs...</p>
        </div>
      ) : (
        <div className="flex flex-1 gap-6 h-full pb-4">
          
          {/* CỘT TRÁI: DANH SÁCH JOB (Scrollable) */}
          <div className="flex-1 h-full overflow-y-auto pr-2 custom-scrollbar">
            <JobsList
              actionLoading={actionLoading}
              jobs={jobs}
              onApply={openApplicationModal}
              onDelete={deleteJob}
              setSelectedJob={setSelectedJob} // Truyền hàm này xuống để click thẻ -> chạy AI
              activeJobId={selectedJob?.id || selectedJob?._id} // Để highlight thẻ đang chọn
            />
          </div>

          {/* CỘT PHẢI: AI COPILOT (Cố định, ẩn trên mobile) */}
          <div className="hidden lg:block w-[400px] xl:w-[450px] h-full transition-all duration-500 ease-in-out">
             <div className="h-full rounded-2xl overflow-hidden border border-gray-700 shadow-2xl bg-gray-800">
                <AICopilot selectedJob={selectedJob} />
             </div>
          </div>

        </div>
      )}

      {/* CÁC MODAL GIỮ NGUYÊN */}
      <JobApplication
        isOpen={isJobApplicationModalOpen}
        onClose={closeApplicationModal}
        job={selectedJob}
        applyForJob={applyForJob}
      />

      <Confirmation
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        message={confirmationMessage}
      />
    </div>
  );
};

export default JobListings;