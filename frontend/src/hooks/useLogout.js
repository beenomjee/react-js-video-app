import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useCallback(() => {
    window.localStorage.removeItem("user");
    navigate("/signin");
  }, [navigate]);

  return logout;
};
