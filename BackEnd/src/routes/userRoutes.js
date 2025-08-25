import { Router } from "express";
import { login,registerUser,logout,refreshAccessToken } from "../controllers/user.js";
import { verifyJwt } from "../middlewares/authmiddleware.js";
import {upload,uploadHandler} from "../controllers/upload.js";
import listMeetings from "../controllers/listMeetings.js";

const router=Router();

router.post("/register",registerUser);
router.post("/login",login);
router.route("/logout").post(verifyJwt,logout);
router.route("/refresh").post(refreshAccessToken);
router.post("/upload",verifyJwt,upload.single("file"),uploadHandler);
router.route("/meetings").get(verifyJwt,listMeetings);

export default router;