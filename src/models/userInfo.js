import { DataTypes } from 'sequelize';
import sequelize from './index.js'; // Sequelize 인스턴스를 import

const UserInfo = sequelize.define('UserInfo', {
  // 속성 정의
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // users 테이블을 참조
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('M', 'W'),
    allowNull: false
  },
  age: {
    type: DataTypes.DATEONLY, // datetime 타입에 맞게 DATEONLY 또는 DATE를 사용
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW // 기본값을 현재 시간으로 설정
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW // 기본값을 현재 시간으로 설정
  }
}, {
  // 모델 옵션
  freezeTableName: true, // 모델 이름을 단수형으로 사용하여 테이블 이름과 동일하게 설정
  tableName: 'user_infos', // 사용할 테이블 이름 직접 지정
  timestamps: true, // createdAt과 updatedAt 컬럼을 자동으로 관리함
  underscored: true, // 컬럼명을 snake_case로 설정 (선택사항)
});

export default UserInfo;
