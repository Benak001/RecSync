import { Router } from "express";
import { login,registerUser,logout,refreshAccessToken } from "../controllers/user.js";
import { verifyJwt } from "../middlewares/authmiddleware.js";

const router=Router();

router.post("/register",registerUser);
router.post("/login",login);
router.route("/logout").post(verifyJwt,logout);
router.route("/refresh").post(refreshAccessToken);

export default router;