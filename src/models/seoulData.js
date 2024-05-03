import { DataTypes } from 'sequelize';
import sequelize from './index.js'; // Sequelize 인스턴스를 import

// SeoulData 모델 정의
const SeoulData = sequelize.define('SeoulData', {
  // 서울 데이터 속성 정의
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  opnsfteamcode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mgtno: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  apvpermynd: {
    type: DataTypes.DATE,
    allowNull: true
  },
  trdstategbn: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  trdstatenm: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dtlstategbn: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  dtlstatenm: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dcbymd: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sitetel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sitepostno: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sitewhladdr: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rdnwhladdr: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rdnpostno: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bplcnm: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastmodts: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updategbn: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  updatedt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  uptaenm: {
    type: DataTypes.STRING,
    allowNull: true
  },
  x: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  y: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  sntuptaenm: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // 기존에 추가했던 컬럼들
  sitearea: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  image_url1: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image_url2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image_url3: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // ...
}, {
  // 모델 옵션
  freezeTableName: true, // 모델 이름을 단수형으로 사용하여 테이블 이름과 동일하게 설정
  tableName: 'seoul_data', // 사용할 테이블 이름 직접 지정
  timestamps: true, // createdAt과 updatedAt 컬럼을 사용함
  createdAt: 'created_at', // 실제 데이터베이스 컬럼 이름 정의
  updatedAt: 'updated_at'
});

export default SeoulData;
