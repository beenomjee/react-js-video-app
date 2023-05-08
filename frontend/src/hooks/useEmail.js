import { useContext } from "react";
import { EmailContext } from "../context";

export const useEmail = () => {
  return useContext(EmailContext);
};
