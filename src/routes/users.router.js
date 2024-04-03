import express from "express";
import { UsersController } from "../controllers/users.controller.js";
import { UsersService } from "../services/users.service.js";
import UsersRepository from "../repositories/users.repository.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

import User from "../models/user.js"; 
import UserInfo from "../models/userInfo.js"; 

const router = express.Router();

// 의존성 주입
const usersModel = new UsersRepository(User,UserInfo);
const usersService = new UsersService(usersModel);
const usersController = new UsersController(usersService);

/**사용자 프로필 이미지조회 API */
// router.get("/getimage", AuthMiddleware, usersController.getUserImage);

// /**사용자 프로필 수정 API */
// router.post(
//   "/putimage",
//   AuthMiddleware,
//   multer().fields([{ name: "image", maxCount: 1 }]),
//   usersController.putUserImage
// );

/**사용자 프로필 상세조회 API */
router.get("/:userId", AuthMiddleware, usersController.readUser);

/**사용자 프로필 수정 API */
router.put("/:userIdParam", AuthMiddleware, usersController.updateUser);

/**userId 가져오는 API */
router.get("/getid", AuthMiddleware, usersController.getUserId);

export default router;