/**
 * Utils cho việc quản lý CV text và Job context
 * Dùng để truyền dữ liệu giữa các trang đến Chatbot
 */

// Lưu CV text vào localStorage (sau khi upload)
export const saveCVToSession = (cvText) => {
  localStorage.setItem('current_cv_text', cvText);
  localStorage.setItem('cv_timestamp', new Date().toISOString());
  console.log('✅ Lưu CV vào session');
};

// Lưu Job context vào localStorage (khi chọn job)
export const saveJobContextToSession = (job) => {
  const jobContext = `
    Title: ${job.title}
    Description: ${job.desc}
    Requirements: ${job.requirements}
  `;
  localStorage.setItem('current_job_context', jobContext);
  localStorage.setItem('current_job_title', job.title);
  localStorage.setItem('job_timestamp', new Date().toISOString());
  console.log('✅ Lưu Job vào session:', job.title);
};

// Lấy CV text từ session
export const getCVFromSession = () => {
  return localStorage.getItem('current_cv_text') || '';
};

// Lấy Job context từ session
export const getJobContextFromSession = () => {
  return localStorage.getItem('current_job_context') || '';
};

// Lấy job title từ session
export const getJobTitleFromSession = () => {
  return localStorage.getItem('current_job_title') || 'Chưa chọn công việc';
};

// Xóa session khi logout
export const clearChatSession = () => {
  localStorage.removeItem('current_cv_text');
  localStorage.removeItem('current_job_context');
  localStorage.removeItem('current_job_title');
  localStorage.removeItem('cv_timestamp');
  localStorage.removeItem('job_timestamp');
  console.log('✅ Đã xóa chat session');
};

// Check xem có CV được upload chưa
export const hasCVInSession = () => {
  return !!localStorage.getItem('current_cv_text');
};

// Check xem có job được chọn chưa
export const hasJobInSession = () => {
  return !!localStorage.getItem('current_job_context');
};
