import express from "express";
import cookieParser from "cookie-parser";
import dotEnv from "dotenv";
import cors from "cors";
import router from "./src/routes/index.js";
import ErrorHandlingMiddleware from "./src/middlewares/error-handling.middleware.js"
import sequelize from './src/models/index.js'; 
import path from 'path';
import { fileURLToPath } from 'url';

//.env에 있는 여러 값들을, prosess.env 객체 안에 추가하게 된다.
dotEnv.config();

const app = express();
const port = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
//app.use(express.static("src/assets"));
// 정적 파일의 루트 경로를 '/'로 설정
//app.use("/", express.static("src/assets"));
//app.use(express.static(path.join(__dirname, 'src/assets')));

// 현재 파일의 URL을 파일 경로로 변환
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'src/assets')));

app.use("/api", router);
app.use(ErrorHandlingMiddleware);

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});


// app.get("/", (req, res) => {
//     res.sendFile("index.html", { root: "assets" });
// });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets', 'index.html'));
});

sequelize.sync({ force: false }).then(() => {
  console.log("테이블이 성공적으로 생성되었습니다.");
}).catch((error) => {
  console.error("테이블 생성에 실패했습니다:", error);
});

// app.listen(3008, () => {
//     console.log("App is running on port 3008");
// });

// app.get("/", (req, res) => {
//     res.sendFile("index.html", { root: '.' });
// });
