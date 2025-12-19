import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import NotificationModal from "../modals/NotificationModal";
import Logo from "../Logo";
import api from "../../api/axiosConfig";
import { logout as storeLogout } from "../../store/authSlice";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openNoti, setOpenNoti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome!", body: "Chào mừng bạn đến JobQuest 🎉", read: false },
    { id: 2, title: "Update", body: "Bạn có 1 thông báo mới.", read: false },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isRecruiter = useSelector((state) => state.auth.isRecruiter);

  const markAllAsReadAndClose = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    setOpenNoti(false);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiEndpoint = isRecruiter
        ? "/recruiters/logout"
        : "/candidates/logout";

      const response = await api.post(apiEndpoint);

      if (response.status === 200) {
        dispatch(storeLogout());
        navigate("/");
      }
    } catch {
      console.log("Logging out due to error");
      dispatch(storeLogout());
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="w-full py-4 2xl:py-6 px-10 font-fira bg-white bg-opacity-10 backdrop-blur-lg fixed z-10">
        <nav className="flex justify-between items-center">
          <div>
            <Link to="/">
              <Logo className="text-xl 2xl:text-2xl" />
            </Link>
          </div>

          {isAuthenticated && (
            <ul className="flex gap-x-4 text-white/80 font-semibold text-base 2xl:text-xl">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="inline-block px-4 py-2 duration-200 hover:bg-slate-900 hover:text-purple-400 rounded-2xl"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/jobs")}
                  className="inline-block px-4 py-2 duration-200 hover:bg-slate-900 hover:text-purple-400 rounded-2xl"
                >
                  Job Listings
                </button>
              </li>
            </ul>
          )}

          {isAuthenticated ? (
            <div className="flex justify-around items-center gap-x-6 2xl:gap-x-8">

              {/* �🔔 Notification */}
              <button
                type="button"
                onClick={() => setOpenNoti(true)}
                className="relative w-11 h-11 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center"
                title="Thông báo"
              >
                🔔
                {!!unreadCount && (
                  <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`py-3 px-8 bg-orange-600 hover:opacity-70 rounded-lg text-white text-base font-semibold transition-opacity ${
                  isLoading && "opacity-30 hover:opacity-40"
                }`}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex justify-between gap-4">
              <button
                onClick={() => navigate("/login/recruiter")}
                className="py-2 px-6 bg-purple-600 hover:opacity-70 rounded-lg text-white text-base font-semibold transition-opacity"
              >
                Recruiter Login
              </button>

              <button
                onClick={() => navigate("/login/candidate")}
                className="py-2 px-6 bg-green-600 hover:opacity-70 rounded-lg text-white text-base font-semibold transition-opacity"
              >
                Candidate Login
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Modal phải nằm ngoài header */}
      <NotificationModal
        open={openNoti}
        onClose={markAllAsReadAndClose}
        notifications={notifications}
      />
    </>
  );
};

export default Header;
