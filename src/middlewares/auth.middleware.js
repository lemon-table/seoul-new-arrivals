import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js"; // Sequelize User 모델 가져오기

dotenv.config();

export default async function (req, res, next) {
  try {
    const { authorization } = req.cookies;

    const [tokenType, token] = authorization.split(" ");
    if (tokenType !== "Bearer") throw new Error("TOKEN_TYPE_ERROR");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;

    // Sequelize를 사용하여 사용자 조회
    const user = await User.findOne({
      where: { id: userId }, // Sequelize 모델에서는 보통 'id' 필드를 사용합니다.
    });

    if (!user) {
      res.clearCookie("authorization"); //특정 쿠키 삭제
      throw new Error("TOKEN_USER_NOT_FOUND_ERROR");
    }

    req.user = user;

    next(); // 다음 미들웨어 실행
  } catch (error) {
    res.clearCookie("authorization"); //특정 쿠키 삭제

    switch (
      error.name //에러 심화
    ) {
      case "TokenExpiredError": // 토큰 만료시 발생하는 에러
        return res.status(401).json({ message: "토큰이 만료되었습니다." });
      case "JsonWebTokenError": // 토큰이 검증 실패했을 때 발생하는 에러
        return res.status(401).json({ message: "토큰 인증에 실패하였습니다." });
      default:
        return res
          .status(401)
          .json({ message: error.message ?? "비 정상적인 요청입니다." });
    }
  }
}
