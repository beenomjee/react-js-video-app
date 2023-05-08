import { useContext } from "react";
import { UserContext } from "../context";

export const useAuth = () => {
  const user = useContext(UserContext);
  return user;
};
