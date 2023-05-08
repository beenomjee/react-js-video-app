import { Router } from "express";
import {
  getAllUsers,
  signInController,
  signUpController,
} from "../controllers/index.js";
import { isAuthenticated } from "../middlewares/index.js";

const router = Router();

router.post("/signup", signUpController);
router.post("/signin", signInController);
router.get("/all", isAuthenticated, getAllUsers);

export default router;
