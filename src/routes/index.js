import express from "express";
import UsersRouter from "./users.router.js";
import AuthRouter from "./auth.router.js";
import { retrieveAndSaveData,getStoreInfo } from '../services/seoulData.service.js'; 

const router = express.Router();

router.use("/users/", UsersRouter);
router.use("/auth/", AuthRouter);

// SeoulData 정보를 가져와서 데이터베이스에 저장하는 API 엔드포인트 추가
router.get("/seoul-data/update", async (req, res) => {
    try {
      await retrieveAndSaveData(); // 서울 데이터 정보 가져와서 저장
      res.status(200).json({ message: "서울 데이터가 성공적으로 업데이트되었습니다." });
    } catch (error) {
      console.error('서울 데이터 업데이트 중 오류 발생:', error);
      res.status(500).json({ message: "서울 데이터 업데이트 중 오류가 발생했습니다.", error: error.toString() });
    }
});

router.get("/seoul-data",async(req,res) =>{
  try {
    //const rerult = await getStoreInfo(); // 서울 데이터 정보 가져와서 저장
    const { minLat, minLng, maxLat, maxLng } = req.query; // 지도 범위 파라미터
    const result = await getStoreInfo(minLat, minLng, maxLat, maxLng);
    res.status(200).json({ data : result,message: "서울 데이터가 조회되었습니다." });
  } catch (error) {
    console.error('서울 데이터 업데이트 중 오류 발생:', error);
    res.status(500).json({ message: "서울 데이터 조회 중 오류가 발생했습니다.", error: error.toString() });
  }
});

export default router;