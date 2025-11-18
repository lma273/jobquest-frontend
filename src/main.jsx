import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store.js";

import "./index.css";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import JobListings from "./pages/JobListings.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PostJob from "./pages/PostJob.jsx";
import { Auth0Provider } from "@auth0/auth0-react";

// 🔍 Log ENV + bật debug để thấy lỗi popup nếu có
console.log("AUTH0 ENV", import.meta.env.VITE_AUTH0_DOMAIN, import.meta.env.VITE_AUTH0_CLIENT_ID);
localStorage.setItem("auth0spa.debug", "true");

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/jobs", element: <JobListings /> },
      { path: "/login/:type", element: <Login /> },
      { path: "/register/:type", element: <Register /> },
      { path: "/postjob", element: <PostJob /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Auth0Provider
                domain={import.meta.env.VITE_AUTH0_DOMAIN}
                clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
                authorizationParams={{
                    redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL, // ✅ dùng biến env
                    scope: "openid profile email",
                }}
                cacheLocation="localstorage"
                useRefreshTokens
            >
                <RouterProvider router={router} />
            </Auth0Provider>
        </PersistGate>
      </Provider>
    </React.StrictMode>
);

