import { DataTypes } from 'sequelize';
import sequelize from './index.js'; // Sequelize 인스턴스를 import

// User 모델 정의
const User = sequelize.define('User', {
  // 속성 정의
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // 추가적인 필드가 필요한 경우 여기에 정의
}, {
  // 모델 옵션
  freezeTableName: true, // 모델 이름을 단수형으로 사용하여 테이블 이름과 동일하게 설정
  tableName: 'users', // 사용할 테이블 이름 직접 지정
  timestamps: false // createdAt과 updatedAt 컬럼을 사용하지 않음
});

export default User;
