import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// 환경변수로부터 데이터베이스 설정을 불러옵니다.
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres', // 사용하는 데이터베이스에 맞게 설정
});

// 데이터베이스 연결 체크
sequelize.authenticate()
  .then(() => {
    console.log('데이터베이스 연결이 성공적으로 이루어졌습니다.');
  })
  .catch(err => {
    console.error('데이터베이스 연결에 실패했습니다:', err);
  });

export default sequelize;
