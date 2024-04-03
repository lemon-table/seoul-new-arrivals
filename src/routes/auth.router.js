import express from "express";
import { UsersController } from "../controllers/users.controller.js";
import { UsersService } from "../services/users.service.js";
import UsersRepository from "../repositories/users.repository.js";

import User from "../models/user.js"; 
import UserInfo from "../models/userInfo.js"; 

const router = express.Router();

// 의존성 주입
const usersRepository = new UsersRepository(User,UserInfo);
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

/**회원가입 API */
router.post("/signup", usersController.createUser);

/**로그인 API */
router.post("/signin", usersController.loginUser);



export default router;