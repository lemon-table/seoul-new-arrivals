import express from "express";
import cookieParser from "cookie-parser";
import dotEnv from "dotenv";
import cors from "cors";
import router from "./routes/index.js";
import ErrorHandlingMiddleware from "./middlewares/error-handling.middleware.js"
import sequelize from './models/index.js'; 

//.env에 있는 여러 값들을, prosess.env 객체 안에 추가하게 된다.
dotEnv.config();

const app = express();
const port = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static("assets"));

app.use("/api", router);
app.use(ErrorHandlingMiddleware);

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});


app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "assets" });
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
