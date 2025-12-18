// import { useState, useEffect, useRef } from "react";
// import PropTypes from "prop-types";
// import { useSelector } from "react-redux";

// const AICopilot = ({ selectedJob }) => {
//   const [messages, setMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const scrollRef = useRef(null);
  
//   // Lấy thông tin user (nếu có) để AI biết profile
//   const userData = useSelector((state) => state.auth.userData) || {};
  
//   // Giả lập CV text nếu trong DB chưa có. 
//   // Sau này bạn thay bằng userData.cvText thật
//   const userCV = "Tôi là lập trình viên ReactJS, biết TailwindCSS, Redux. Kinh nghiệm 1 năm làm Frontend.";

//   // Mỗi khi người dùng chọn Job mới bên trái -> AI Reset và Chào
//   useEffect(() => {
//     if (selectedJob) {
//       setMessages([
//         { 
//           role: "system", 
//           content: `👋 Chào bạn! Tôi đang xem JD vị trí **${selectedJob.position}** tại **${selectedJob.company}**. Bạn muốn tôi phân tích gì không?` 
//         }
//       ]);
//     }
//   }, [selectedJob]);

//   // Tự động cuộn xuống tin nhắn mới
//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleConsult = async (promptType) => {
//     if (!selectedJob) return;
//     setIsLoading(true);

//     let userQuestion = "";
//     if (promptType === "why") userQuestion = "Tại sao tôi phù hợp với công việc này? Phân tích dựa trên CV.";
//     if (promptType === "missing") userQuestion = "So với yêu cầu, tôi còn thiếu kỹ năng gì quan trọng?";
//     if (promptType === "interview") userQuestion = "Đóng vai người phỏng vấn, hãy hỏi tôi 1 câu khó nhất về vị trí này.";

//     // 1. Hiện câu hỏi User
//     setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);

//     try {
//       // 2. Gọi API Backend (Giả sử chạy ở cổng 8000 như bạn đã setup backend Python)
//       const payload = {
//         cv_text: userCV,
//         job_context: `Title: ${selectedJob.position}. Company: ${selectedJob.company}. Location: ${selectedJob.location}. Skills: ${selectedJob.skills?.join(', ')}`,
//         user_question: userQuestion,
//         mode: "candidate"
//       };

//       // Gọi API (Dùng fetch hoặc axios đều được)
//       const response = await fetch("http://127.0.0.1:8000/consult", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
      
//       // 3. Hiện câu trả lời AI
//       setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      
//     } catch (error) {
//       console.error(error);
//       setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Lỗi: Không kết nối được với AI Server (Port 8000)." }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- GIAO DIỆN CHỜ (KHI CHƯA CHỌN JOB) ---
//   if (!selectedJob) {
//     return (
//       <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-white border-l border-gray-200 p-6 shadow-xl">
//         <div className="text-5xl mb-4 opacity-50">🤖</div>
//         <p className="text-center font-medium">Chọn một công việc bên trái<br/>để AI Copilot bắt đầu phân tích.</p>
//       </div>
//     );
//   }

//   // --- GIAO DIỆN CHAT (SIDEBAR) ---
//   return (
//     <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-2xl">
//       {/* Header */}
//       <div className="p-4 bg-green-600 text-white shadow-md">
//         <h3 className="font-bold flex items-center gap-2 text-lg">
//           ✨ AI Copilot
//         </h3>
//         <p className="text-xs opacity-90 mt-1 truncate">
//           Đang tư vấn: <span className="font-bold">{selectedJob.position}</span>
//         </p>
//       </div>

//       {/* Chat Area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
//         {messages.map((msg, idx) => (
//           <div 
//             key={idx} 
//             className={`p-3 rounded-xl text-sm leading-relaxed max-w-[90%] shadow-sm ${
//               msg.role === "user" 
//                 ? "bg-green-100 text-green-900 self-end ml-auto rounded-br-none" 
//                 : msg.role === "system"
//                 ? "bg-blue-50 text-blue-800 text-center mx-auto w-full italic"
//                 : "bg-white border border-gray-200 text-gray-800 mr-auto rounded-bl-none"
//             }`}
//           >
//             <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
//           </div>
//         ))}
//         {isLoading && (
//           <div className="flex items-center gap-2 text-gray-500 text-sm ml-2 animate-pulse">
//             AI đang suy nghĩ...
//           </div>
//         )}
//         <div ref={scrollRef} />
//       </div>

//       {/* Quick Actions (3 nút bấm thần thánh) */}
//       <div className="p-3 bg-white border-t border-gray-200 grid grid-cols-3 gap-2">
//         <button 
//           onClick={() => handleConsult("why")} disabled={isLoading}
//           className="bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-700 text-xs py-2 px-1 rounded-lg transition border border-gray-200 font-medium"
//         >
//           🎯 Tại sao hợp?
//         </button>
//         <button 
//           onClick={() => handleConsult("missing")} disabled={isLoading}
//           className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 text-xs py-2 px-1 rounded-lg transition border border-gray-200 font-medium"
//         >
//           🔍 Thiếu gì?
//         </button>
//         <button 
//           onClick={() => handleConsult("interview")} disabled={isLoading}
//           className="bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-xs py-2 px-1 rounded-lg transition border border-gray-200 font-medium"
//         >
//           🎤 Phỏng vấn
//         </button>
//       </div>
//     </div>
//   );
// };

// AICopilot.propTypes = {
//   selectedJob: PropTypes.object,
// };

// export default AICopilot;
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

const AICopilot = ({ selectedJob }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  
  // Lấy thông tin user từ Redux
  const userData = useSelector((state) => state.auth.userData) || {};
  
  // 🟢 LOGIC LẤY CV: 
  // 1. Ưu tiên lấy từ Redux (nếu user đã upload và lưu text)
  // 2. Nếu không, dùng chuỗi mẫu để Test tính năng
  const userCV = userData.cvText && userData.cvText.length > 50 
    ? userData.cvText 
    : "Tôi là lập trình viên Fullstack với 2 năm kinh nghiệm ReactJS và NodeJS. Tôi có kỹ năng về MongoDB, Express và TailwindCSS. Tôi mong muốn tìm môi trường làm việc năng động.";

  // Reset chat khi đổi Job
  useEffect(() => {
    if (selectedJob) {
      setMessages([
        { 
          role: "system", 
          content: `👋 Chào bạn! Tôi đang xem JD vị trí **${selectedJob.position}** tại **${selectedJob.company}**. Bạn muốn tôi phân tích gì không?` 
        }
      ]);
    }
  }, [selectedJob]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConsult = async (promptType) => {
    if (!selectedJob) return;
    setIsLoading(true);

    let userQuestion = "";
    if (promptType === "why") userQuestion = "Tại sao tôi phù hợp với công việc này? Phân tích dựa trên CV.";
    if (promptType === "missing") userQuestion = "So với yêu cầu, tôi còn thiếu kỹ năng gì quan trọng?";
    if (promptType === "interview") userQuestion = "Đóng vai người phỏng vấn, hãy hỏi tôi 1 câu khó nhất về vị trí này.";

    // Hiện câu hỏi user
    setMessages((prev) => [...prev, { role: "user", content: userQuestion }]);

    try {
      // 🟢 CHUẨN BỊ PAYLOAD ĐÚNG VỚI BACKEND (api.py)
      const payload = {
        cv_text: userCV,
        job_context: `Vị trí: ${selectedJob.position}. Công ty: ${selectedJob.company}. Địa điểm: ${selectedJob.location}. Mô tả: ${selectedJob.description || ''}. Kỹ năng: ${selectedJob.skills?.join(', ')}`,
        user_question: userQuestion
      };

      // Gọi API Backend
      const response = await fetch("http://127.0.0.1:8000/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      // Hiện câu trả lời từ AI
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Lỗi: Không kết nối được với AI Server (Port 8000)." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedJob) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-900 border-l border-gray-700 p-6 shadow-xl">
        <div className="text-5xl mb-4 opacity-50">🤖</div>
        <p className="text-center font-medium">Chọn một công việc bên trái<br/>để AI Copilot bắt đầu phân tích.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-green-600 text-white shadow-md">
        <h3 className="font-bold flex items-center gap-2 text-lg">
          ✨ AI Copilot
        </h3>
        <p className="text-xs opacity-90 mt-1 truncate">
          Đang tư vấn: <span className="font-bold">{selectedJob.position}</span>
        </p>
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
            AI đang suy nghĩ...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-3 bg-gray-900 border-t border-gray-700 grid grid-cols-3 gap-2">
        <button 
          onClick={() => handleConsult("why")} disabled={isLoading}
          className="bg-gray-800 hover:bg-green-900 text-gray-300 hover:text-green-400 text-xs py-2 px-1 rounded-lg transition border border-gray-700 font-medium"
        >
          🎯 Tại sao hợp?
        </button>
        <button 
          onClick={() => handleConsult("missing")} disabled={isLoading}
          className="bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-400 text-xs py-2 px-1 rounded-lg transition border border-gray-700 font-medium"
        >
          🔍 Thiếu gì?
        </button>
        <button 
          onClick={() => handleConsult("interview")} disabled={isLoading}
          className="bg-gray-800 hover:bg-blue-900 text-gray-300 hover:text-blue-400 text-xs py-2 px-1 rounded-lg transition border border-gray-700 font-medium"
        >
          🎤 Phỏng vấn
        </button>
      </div>
    </div>
  );
};

AICopilot.propTypes = {
  selectedJob: PropTypes.object,
};

export default AICopilot;