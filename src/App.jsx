import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatbotModal from "./components/ChatbotModal";

function App() {
  const { pathname } = useLocation();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMode, setChatMode] = useState('candidate');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Hàm mở chatbot từ các component khác
  window.openChatbot = (mode = 'candidate') => {
    setChatMode(mode);
    setIsChatbotOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950">
      <Header />
      <Outlet context={{ openChatbot: (mode) => window.openChatbot(mode) }} />
      <Footer />
      
      {/* Chatbot Modal */}
      <ChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)}
        mode={chatMode}
      />
      
      {/* Nút nổi Chatbot */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all z-999 flex items-center justify-center text-xl"
        title="Mở AI Consultant"
      >
        💬
      </button>
    </div>
  );
}

export default App;
