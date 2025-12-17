import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const { pathname } = useLocation();

  // Tự động cuộn lên đầu trang khi chuyển trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950">
      <Header />
      
      {/* Nơi hiển thị các trang con (Home, JobListings,...) */}
      <Outlet />
      
      <Footer />
    </div>
  );
}

export default App;