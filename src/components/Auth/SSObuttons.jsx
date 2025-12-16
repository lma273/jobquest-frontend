import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import api from "../../api/axiosConfig";
import { login as storeLogin } from "../../store/authSlice";

export function SSOLoginButton() {
    const { loginWithPopup, getIdTokenClaims } = useAuth0();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onClick = async (e) => {
        e?.preventDefault();
        e?.stopPropagation?.();

        try {
            console.log("🔹 Bắt đầu SSO login (popup)");
            await loginWithPopup({ authorizationParams: { prompt: "login" } });

            const claims = await getIdTokenClaims();
            console.log("🔹 Claims:", claims);
            const idToken = claims?.__raw;
            if (!idToken) throw new Error("Không lấy được ID Token");

            console.log("🔹 Gửi ID Token đến backend...");
            const { data } = await api.post("/auth/sso-login", { id_token: idToken });

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("userEmail", data?.profile?.email || "");

            dispatch(
                storeLogin({
                    isRecruiter: data.role === "recruiter",
                    userData: data.profile,
                })
            );

            console.log("✅ Đăng nhập SSO thành công, chuyển về trang chủ");
            navigate("/", { replace: true });
        } catch (err) {
            console.error("❌ SSO login failed:", err?.response?.data || err);
            const code = err?.response?.data?.code;
            const msg = err?.response?.data?.message || err?.message || "SSO login failed";

            if (err?.response?.status === 404 && code === "USER_NOT_FOUND") {
                alert("Tài khoản chưa tồn tại. Vui lòng đăng ký.");
            } else {
                alert(msg);
            }
        }
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-md transition-colors underline underline-offset-4"
        >
            Đăng nhập bằng SSO (Auth0)
        </button>
    );
}

export function SSOLinkButton({ remember = true, onLinked }) {
    const { loginWithPopup, getIdTokenClaims } = useAuth0();

    const onClick = async (e) => {
        e?.preventDefault();
        e?.stopPropagation?.();

        try {
            await loginWithPopup({ authorizationParams: { prompt: "login" } });
            const claims = await getIdTokenClaims();
            const idToken = claims?.__raw;
            if (!idToken) throw new Error("Không lấy được ID Token");

            const token = localStorage.getItem("token");
            await api.post(
                "/auth/sso-link",
                { id_token: idToken, remember },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const email = claims?.email || "";
            onLinked?.({ email });
            alert("Đã liên kết SSO!");
        } catch (err) {
            console.error("SSO link failed:", err?.response?.data || err);
            alert(err?.response?.data?.message || err?.message || "SSO link failed");
        }
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md"
        >
            Liên kết SSO
        </button>
    );
}

SSOLinkButton.propTypes = {
    remember: PropTypes.bool,
    onLinked: PropTypes.func,
};
