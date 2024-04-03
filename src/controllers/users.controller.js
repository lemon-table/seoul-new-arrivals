import { StatusCodes } from "../constants/statusCodes.constant.js";

export class UsersController {
  constructor(usersService) {
    this.usersService = usersService;
  }
  /** 회원가입 API */
  createUser = async (req, res, next) => {
    try {
      const { email, username, password, confirmPassword, gender, name, age } = req.body;

      const user = await this.usersService.createUser(email, username, password, confirmPassword, gender, name, age);

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: "회원가입에 성공했습니다.",
        data: user
      });
    } catch (err) {
      next(err);
    }
  };

  /** 로그인 API */
  loginUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await this.usersService.loginUser(email, password);

      if (user) res.cookie("authorization", `Bearer ${user.token}`);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "로그인에 성공했습니다."
      });
    } catch (err) {
      next(err);
    }
  };

  /** 사용자 프로필 상세조회 API */
  readUser = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await this.usersService.readUser(userId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "프로필 상세정보 조회에 성공했습니다.",
        data: user
      });
    } catch (err) {
      next(err);
    }
  };

  /** 사용자 프로필 수정 API */
  updateUser = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { userIdParam } = req.params;
      const { name, nickname, age, gender, profileImage } = req.body;

      const user = await this.usersService.updateUser(userId, userIdParam, name, nickname, age, gender, profileImage);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "프로필 정보를 수정했습니다."
      });
    } catch (err) {
      next(err);
    }
  };

  /** userId 가져오는 API */
  getUserId = async (req, res, next) => {
    try {
      const { userId } = req.user;
      console.log("server userId:" + userId);
      return res.json({ user: userId });
    } catch (err) {
      next(err);
    }
  };

//   /** 사용자 프로필 이미지 가져오기 */
//   getUserImage = async (req, res, next) => {
//     try {
//       const { userId } = req.user;

//       const user = await this.usersService.getUserImage(userId);

//       console.log("user" + user);

//       return res.status(StatusCodes.OK).json({
//         success: true,
//         message: "프로필 이미지를 조회했습니다.",
//         data: user
//       });
//     } catch (err) {
//       next(err);
//     }
//   };

//   /** 사용자 프로필 수정 */
//   putUserImage = async (req, res, next) => {
//     try {
//       const { userId } = req.user;
//       // 이미지 데이터는 req.body에서 가져옵니다.
//       //const image = req.body.image;

//       const { image } = req.files;

//       // 이미지 데이터 확인
//       console.log("image:", image);

//       const user = await this.usersService.putUserImage(userId, image);

//       console.log("user" + user);

//       return res.status(StatusCodes.OK).json({
//         success: true,
//         message: "프로필 이미지를 수정했습니다."
//       });
//     } catch (err) {
//       next(err);
//     }
//   };
}