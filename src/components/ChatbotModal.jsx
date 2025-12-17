import { useState, useRef, useEffect } from 'react';
import { getCVFromSession, getJobContextFromSession } from '../utils/chatbotUtils';
import './ChatbotModal.css';

export default function ChatbotModal({ isOpen, onClose, mode = 'candidate' }) {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: mode === 'candidate' 
        ? '👋 Xin chào! Tôi là AI Career Coach. Hãy hỏi tôi về sự phù hợp giữa CV và công việc của bạn!'
        : '👋 Xin chào! Tôi là HR Assistant. Hãy hỏi tôi để đánh giá ứng viên này!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cvText, setCvText] = useState('');
  const [jobContext, setJobContext] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto scroll khi modal mở
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Thêm message của user
    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Gọi API chatbot
      const response = await fetch('http://localhost:8001/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv_text: cvText || 'Chưa upload CV',
          job_context: jobContext || 'Chưa chọn công việc',
          user_question: input,
          mode: mode
        })
      });

      const data = await response.json();
      
      const botMessage = {
        type: 'bot',
        text: data.response || '❌ Có lỗi xảy ra, vui lòng thử lại!'
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '❌ Lỗi kết nối. Vui lòng kiểm tra server chatbot đang chạy không?'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetContext = () => {
    // Lấy CV text và Job context từ session/localStorage
    const cvText = getCVFromSession();
    const jobContext = getJobContextFromSession();
    
    setCvText(cvText);
    setJobContext(jobContext);
    
    if (!cvText && !jobContext) {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '⚠️ Vui lòng upload CV và chọn công việc trước!'
      }]);
    } else {
      const loaded = [];
      if (cvText) loaded.push('CV');
      if (jobContext) loaded.push('Job context');
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `✅ Đã nạp: ${loaded.join(' + ')}`
      }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-title">
            <span className="chatbot-icon">💬</span>
            <span>{mode === 'candidate' ? 'Career Coach AI' : 'HR Assistant AI'}</span>
          </div>
          <button className="chatbot-close" onClick={onClose}>✕</button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message message-${msg.type}`}>
              <span className="message-avatar">
                {msg.type === 'bot' ? '🤖' : '👤'}
              </span>
              <div className="message-content">
                {msg.text}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message message-bot">
              <span className="message-avatar">🤖</span>
              <div className="message-content loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chatbot-input-area">
          <button 
            className="context-btn"
            onClick={handleSetContext}
            title="Tải CV và Job context từ session"
          >
            📎 Nạp Dữ Liệu
          </button>
          
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Hỏi tôi gì đi..."
              disabled={loading}
              className="chatbot-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="send-btn"
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
