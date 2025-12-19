import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

const AICopilot = ({ selectedJob, isPostingJob, jobFormData }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  
  // State riêng cho chế độ Recruiter (Viết JD)
  const [jdInput, setJdInput] = useState("");
  const [generatedJD, setGeneratedJD] = useState("");

  const scrollRef = useRef(null);
  const userData = useSelector((state) => state.auth.userData) || {};
  const isRecruiter = useSelector((state) => state.auth.isRecruiter);

  // =========================================================
  // LOGIC 1: CANDIDATE CONSULTANT (Tư vấn cho ứng viên)
  // =========================================================
  const userCV = userData.cvText && userData.cvText.length > 50 
    ? userData.cvText 
    : "Tôi là lập trình viên Fullstack với 2 năm kinh nghiệm ReactJS và NodeJS. Tôi có kỹ năng về MongoDB, Express và TailwindCSS.";

  useEffect(() => {
    // Chỉ chào hỏi nếu KHÔNG phải là Recruiter đang đăng bài
    if (selectedJob && !isPostingJob) {
      setMessages([
        { 
          role: "system", 
          content: `👋 Chào bạn! Tôi là AI tư vấn cho vị trí **${selectedJob.position}**. Bạn cứ hỏi tự nhiên nhé!` 
        }
      ]);
    }
  }, [selectedJob, isPostingJob]);

  useEffect(() => {
    if (!isPostingJob) {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isPostingJob]);

  const handleConsult = async (manualQuestion = null) => {
    if (!selectedJob) return;

    let questionToSend = manualQuestion;
    if (!questionToSend) {
        if (!inputMessage.trim()) return;
        questionToSend = inputMessage;
    }

    setIsLoading(true);
    if (!manualQuestion) setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: questionToSend }]);

    try {
      const payload = {
        cv_text: userCV,
        job_context: `Vị trí: ${selectedJob.position}. Công ty: ${selectedJob.company}. Địa điểm: ${selectedJob.location}. Mô tả: ${selectedJob.description || ''}. Kỹ năng: ${selectedJob.skills?.join(', ')}`,
        user_question: questionToSend,
        mode: "candidate"
      };

      // Gọi API Tư vấn
      const response = await fetch("https://lakeisha-unhumorous-histographically.ngrok-free.dev/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Lỗi kết nối AI Server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleConsult();
    }
  };

  // =========================================================
  // LOGIC 2: RECRUITER JD WRITER (Viết JD cho nhà tuyển dụng)
  // =========================================================
  const handleGenerateJD = async () => {
    if (!jdInput.trim()) return;
    setIsLoading(true);
    setGeneratedJD(""); 

    try {
        // Gọi API Viết JD với context từ form
        const response = await fetch("https://lakeisha-unhumorous-histographically.ngrok-free.dev/generate_jd", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                rough_input: jdInput,
                job_title: jobFormData?.title || null,
                experience: jobFormData?.experience || null
            })
        });
        const data = await response.json();
        setGeneratedJD(data.jd_content);
    } catch (error) {
        console.error(error);
        setGeneratedJD("⚠️ Lỗi kết nối AI Server.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopyJD = () => {
      navigator.clipboard.writeText(generatedJD);
      alert("Đã copy JD! Hãy dán vào form bên cạnh.");
  };

  // =========================================================
  // RENDER UI: QUYẾT ĐỊNH HIỂN THỊ DỰA TRÊN NGỮ CẢNH
  // =========================================================

  // 🟣 CASE 1: RECRUITER ĐANG POST JOB -> HIỆN CÔNG CỤ VIẾT JD
  if (isRecruiter && isPostingJob) {
    return (
        <div className="flex flex-col h-full bg-slate-900 border-l border-gray-700 shadow-2xl">
            <div className="p-4 bg-purple-600 text-white shadow-md">
                <h3 className="font-bold flex items-center gap-2 text-lg">✨ AI JD Writer</h3>
                <p className="text-xs opacity-90 mt-1">Trợ lý viết mô tả công việc</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Input Yêu cầu thô */}
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <label className="text-xs text-purple-300 font-bold mb-2 block uppercase">Bước 1: Nhập yêu cầu sơ bộ</label>
                    <textarea 
                        className="w-full bg-slate-900 text-white text-sm p-3 rounded border border-slate-600 focus:border-purple-500 outline-none h-32 resize-none placeholder-gray-500"
                        placeholder="VD: Cần tuyển Java Dev, 3 năm kinh nghiệm, làm việc ở Cầu Giấy. Lương khoảng 2000$. Yêu cầu biết Spring Boot và tiếng Anh giao tiếp..."
                        value={jdInput}
                        onChange={(e) => setJdInput(e.target.value)}
                    ></textarea>
                    <button 
                        onClick={handleGenerateJD}
                        disabled={isLoading || !jdInput}
                        className="w-full mt-2 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                           <>Đang viết... <span className="animate-spin">⏳</span></>
                        ) : "⚡ Viết lại chuyên nghiệp"}
                    </button>
                </div>

                {/* Kết quả Output */}
                {generatedJD && (
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 animate-fade-in-down">
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-xs text-green-400 font-bold uppercase">Bước 2: Kết quả</label>
                             <button onClick={handleCopyJD} className="text-xs bg-slate-700 hover:bg-white hover:text-slate-900 text-white px-2 py-1 rounded transition">Copy</button>
                        </div>
                        <div className="bg-slate-950 p-3 rounded text-gray-300 text-xs whitespace-pre-wrap h-64 overflow-y-auto custom-scrollbar border border-slate-800 leading-relaxed">
                            {generatedJD}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 text-center">Copy nội dung trên và dán vào form bên cạnh nhé!</p>
                    </div>
                )}
            </div>
        </div>
    );
  }

  // ⚪ CASE 2: CHƯA CHỌN JOB (Khi không phải đang post job)
  if (!selectedJob) {
    // Nếu là Recruiter thì hiển thị placeholder khác
    if (isRecruiter) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-900 border-l border-gray-700 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-2">Recruiter Dashboard</h3>
          <p className="text-center text-sm opacity-70 max-w-xs">
            Click <span className="text-green-400 font-bold">"Post New Job"</span> to create a new listing with AI assistance.
          </p>
        </div>
      );
    }
    
    // Candidate thì hiển thị welcome screen
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-900 border-l border-gray-700 p-6 shadow-xl">
        <div className="text-5xl mb-4 opacity-50">🤖</div>
        <p className="text-center font-medium">Chọn một công việc bên trái<br/>để bắt đầu trò chuyện.</p>
      </div>
    );
  }

  // 🟢 CASE 3: GIAO DIỆN TƯ VẤN CHO ỨNG VIÊN (Mặc định)
  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-green-600 text-white shadow-md flex justify-between items-center">
        <div>
            <h3 className="font-bold flex items-center gap-2 text-lg">✨ AI Copilot</h3>
            <p className="text-xs opacity-90 mt-1 truncate max-w-[200px]">
            Job: <span className="font-bold">{selectedJob.position}</span>
            </p>
        </div>
        <button onClick={() => setMessages([])} className="text-xs bg-green-700 hover:bg-green-800 px-2 py-1 rounded">
            Clear
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`p-3 rounded-xl text-sm leading-relaxed max-w-[90%] shadow-sm ${
              msg.role === "user" 
                ? "bg-green-600 text-white self-end ml-auto rounded-br-none" 
                : msg.role === "system"
                ? "bg-gray-700 text-gray-300 text-center mx-auto w-full italic border border-gray-600"
                : "bg-gray-700 border border-gray-600 text-gray-200 mr-auto rounded-bl-none"
            }`}
          >
            <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-green-400 text-sm ml-2 animate-pulse">
            AI đang trả lời...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Footer: Quick Actions + Input */}
      <div className="p-3 bg-gray-900 border-t border-gray-700 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button 
                onClick={() => handleConsult("Tại sao tôi phù hợp với công việc này? Phân tích dựa trên CV.")}
                className="whitespace-nowrap bg-gray-800 hover:bg-gray-700 text-green-400 text-xs py-1.5 px-3 rounded-full border border-gray-600 transition"
            >
                🎯 Tại sao hợp?
            </button>
            <button 
                onClick={() => handleConsult("So với yêu cầu, tôi còn thiếu kỹ năng gì quan trọng?")}
                className="whitespace-nowrap bg-gray-800 hover:bg-gray-700 text-red-400 text-xs py-1.5 px-3 rounded-full border border-gray-600 transition"
            >
                🔍 Thiếu gì?
            </button>
            <button 
                onClick={() => handleConsult("Đóng vai người phỏng vấn, hãy hỏi tôi 1 câu khó nhất về vị trí này.")}
                className="whitespace-nowrap bg-gray-800 hover:bg-gray-700 text-blue-400 text-xs py-1.5 px-3 rounded-full border border-gray-600 transition"
            >
                🎤 Phỏng vấn
            </button>
        </div>

        <div className="flex gap-2">
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi bất kỳ điều gì về job này..."
                disabled={isLoading}
                className="flex-1 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 px-4 py-2 focus:outline-none focus:border-green-500 placeholder-gray-500"
            />
            <button 
                onClick={() => handleConsult()}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                ➤
            </button>
        </div>
      </div>
    </div>
  );
};

AICopilot.propTypes = {
  selectedJob: PropTypes.object,
  isPostingJob: PropTypes.bool,
  jobFormData: PropTypes.object,
};

export default AICopilot;