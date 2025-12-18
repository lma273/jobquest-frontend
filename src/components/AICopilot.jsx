import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

const AICopilot = ({ selectedJob }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState(""); // State cho ô nhập liệu
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  
  const userData = useSelector((state) => state.auth.userData) || {};
  
  // Logic lấy CV (như cũ)
  const userCV = userData.cvText && userData.cvText.length > 50 
    ? userData.cvText 
    : "Tôi là lập trình viên Fullstack với 2 năm kinh nghiệm ReactJS và NodeJS. Tôi có kỹ năng về MongoDB, Express và TailwindCSS.";

  useEffect(() => {
    if (selectedJob) {
      setMessages([
        { 
          role: "system", 
          content: `👋 Chào bạn! Tôi là AI tư vấn cho vị trí **${selectedJob.position}**. Bạn cứ hỏi tự nhiên nhé!` 
        }
      ]);
    }
  }, [selectedJob]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hàm xử lý gửi tin nhắn (Dùng chung cho cả Nút bấm và Chat tự do)
  const handleConsult = async (manualQuestion = null) => {
    if (!selectedJob) return;

    // Xác định câu hỏi: Nếu bấm nút thì dùng text mẫu, nếu không thì dùng text trong ô input
    let questionToSend = manualQuestion;

    if (!questionToSend) {
        // Trường hợp nhập tay
        if (!inputMessage.trim()) return;
        questionToSend = inputMessage;
    }

    setIsLoading(true);
    // Xóa ô nhập liệu ngay lập tức nếu là chat tay
    if (!manualQuestion) setInputMessage("");

    // Hiện câu hỏi user lên màn hình
    setMessages((prev) => [...prev, { role: "user", content: questionToSend }]);

    try {
      const payload = {
        cv_text: userCV,
        job_context: `Vị trí: ${selectedJob.position}. Công ty: ${selectedJob.company}. Địa điểm: ${selectedJob.location}. Mô tả: ${selectedJob.description || ''}. Kỹ năng: ${selectedJob.skills?.join(', ')}`,
        user_question: questionToSend,
        mode: "candidate"
      };

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

  // Xử lý khi nhấn Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleConsult();
    }
  };

  if (!selectedJob) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-900 border-l border-gray-700 p-6 shadow-xl">
        <div className="text-5xl mb-4 opacity-50">🤖</div>
        <p className="text-center font-medium">Chọn một công việc bên trái<br/>để bắt đầu trò chuyện.</p>
      </div>
    );
  }

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
        {/* Nút xóa chat (Option) */}
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
        
        {/* 3 Nút gợi ý (Vẫn giữ lại vì nó rất tiện) */}
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

        {/* Ô nhập liệu tự do */}
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
};

export default AICopilot;