import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login as storeLogin } from "../../store/authSlice";
import api from "../../api/axiosConfig";

const RecruiterRegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // có thể prefill từ SSO
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => { if (isAuthenticated) navigate("/"); }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = { name, email, password, company, location, jobIds: [] };
      const res = await api.post("/recruiters/signup", payload);

      if (res.status === 201) {
        const { token, recruiter } = res.data || {};
        if (token) localStorage.setItem("token", token);

        dispatch(
            storeLogin({
              isRecruiter: true,
              userData: recruiter, // ✅ chỉ profile
            })
        );

        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <form
          onSubmit={handleSubmit}
          className="p-14 mb-24 bg-slate-700 w-full max-w-md 2xl:max-w-xl rounded-lg flex flex-col gap-4 2xl:gap-10 mx-auto"
      >
        <h1 className="text-3xl 2xl:text-5xl font-bold text-white text-center mb-8 2xl:mb-12">
          Recruiter Signup
        </h1>

        <input className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
               type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />

        <input className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
               type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <input className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
               type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <input
            className={`w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold ${
                password === confirmPassword
                    ? "border-green-500 outline-green-500"
                    : confirmPassword && "border-red-500 outline-red-500"
            }`}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
        />

        <input className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
               type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />

        <input className="w-full py-2 px-4 text-lg rounded-lg text-black/80 font-semibold"
               type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />

        <button
            type="submit"
            disabled={isLoading || !name || !email || !password || !confirmPassword || password !== confirmPassword}
            className={`py-2 px-4 my-10 bg-green-500 hover:opacity-70 rounded-lg text-white text-lg font-semibold transition-opacity ${
                (isLoading || !name || !email || !password || !confirmPassword || password !== confirmPassword) && "opacity-30 hover:opacity-40"
            }`}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

        <p className="text-red-500 text-center text-lg font-black">{error}</p>

        <p className="text-secondary text-center">
          <Link to="/login/recruiter" className="text-white/80 hover:text-purple-500 text-lg font-semibold">
            Already Registered? Login here
          </Link>
        </p>
      </form>
  );
};

export default RecruiterRegisterForm;
