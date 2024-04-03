import { StatusCodes } from "../constants/statusCodes.constant.js";

export default function (err, req, res, next) {
  console.error("err:" + err.message);

  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let errMessage = "서버 내부 에러가 발생했습니다.";

  if (err.message === "PASSWORD_LENGTH_ERROR") {
    statusCode = StatusCodes.BAD_REQUEST;
    errMessage = "비밀번호는 6자리 이상 작성 바랍니다.";
  }

  if (err.message === "PASSWORD_MISMATCH") {
    statusCode = StatusCodes.BAD_REQUEST;
    errMessage = "패스워드가 패스워드 확인란과 다릅니다.";
  }

  if (err.message === "INVALID_EMAIL_FORMAT") {
    statusCode = StatusCodes.BAD_REQUEST;
    errMessage = "이메일 형식이 맞지 않습니다.";
  }

  if (err.message === "EMAIL_ALREADY_IN_USE") {
    statusCode = StatusCodes.UNAUTHORIZED;
    errMessage = "이메일이 이미 사용중입니다.";
  }

  if (err.message === "INVALID_CREDENTIALS") {
    statusCode = StatusCodes.BAD_REQUEST;
    errMessage = "이메일 또는 패스워드가 틀렸습니다.";
  }

  if (err.message === "TOKEN_USER_NOT_FOUND_ERROR") {
    statusCode = StatusCodes.UNAUTHORIZED;
    errMessage = "토큰 사용자가 존재하지 않습니다.";
  }

  if (err.message === "USER_ID_NOT_FOUND_ERROR") {
    statusCode = StatusCodes.BAD_REQUEST;
    errMessage = "사용자 ID가 없습니다.";
  }

  res.status(statusCode).json({ success: false, errorMessage: errMessage });
}