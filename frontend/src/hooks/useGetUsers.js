import { useContext } from "react";
import { GetUserContext } from "../context";

export const useGetUsers = () => {
  return useContext(GetUserContext);
};
