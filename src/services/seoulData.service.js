import SeoulData from '../models/seoulData.js'; // 모델 import
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = 'http://openapi.seoul.go.kr:8088';
const API_PATH = '/json/LOCALDATA_072218';

// API로부터 데이터를 가져오는 함수
const fetchData = async (startIdx, endIdx) => {
  const apiKey = process.env.SEOUL_DATA_API_KEY;
  const response = await axios.get(`${API_BASE_URL}/${apiKey}${API_PATH}/${startIdx}/${endIdx}`);
  const data = response.data.LOCALDATA_072218.row;
  return data;
};

// 유효한 날짜 문자열인지 검사하는 함수
function isValidDateString(dateString) {
  return !isNaN(Date.parse(dateString));
}

// 숫자형 필드의 값을 검증하고 변환하는 함수
function toFloatOrNull(value) {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// 날짜 값을 ISO 문자열로 변환하거나 유효하지 않은 경우 null 반환
function toISOStringOrNull(dateString) {
  if (isValidDateString(dateString)) {
    return new Date(dateString).toISOString();
  } else {
    return null;
  }
}


// 데이터를 데이터베이스에 삽입 또는 업데이트하는 함수
const saveOrUpdateData = async (data) => {
  for (const item of data) {
    await SeoulData.upsert({
      // 컬럼 매핑
      opnsfteamcode: item.OPNSFTEAMCODE,
      mgtno: item.MGTNO,
      apvpermynd: toISOStringOrNull(item.APVPERMYMD),
      trdstategbn: item.TRDSTATEGBN,
      trdstatenm: item.TRDSTATENM,
      dtlstategbn: item.DTLSTATEGBN,
      dtlstatenm: item.DTLSTATENM,
      dcbymd: toISOStringOrNull(item.DCBYMD),
      sitetel: item.SITETEL,
      sitepostno: item.SITEPOSTNO,
      sitewhladdr: item.SITEWHLADDR,
      rdnwhladdr: item.RDNWHLADDR,
      rdnpostno: item.RDNPOSTNO,
      bplcnm: item.BPLCNM,
      lastmodts: toISOStringOrNull(item.LASTMODTS),
      updategbn: !isNaN(parseFloat(item.UPDATEGBN)) ? parseFloat(item.UPDATEGBN) : null,
      updatedt: toISOStringOrNull(item.UPDATEDT),
      uptaenm: item.UPTAENM,
      x: toFloatOrNull(item.X),
      y: toFloatOrNull(item.Y),
      sntuptaenm: item.SNTUPTAENM,
      // 다른 컬럼들도 필요에 따라 이와 같은 방식으로 추가합니다.
      // ...
    }, {
      // upsert 메소드는 기본키나 unique 컬럼이 일치할 경우 update, 그렇지 않을 경우 insert를 수행합니다.
      fields: ['opnsfteamcode', 'mgtno', 'apvpermynd', 'trdstategbn', 'trdstatenm', 'dtlstategbn', 'dtlstatenm', 'dcbymd', 'sitetel', 'sitepostno', 'sitewhladdr', 'rdnwhladdr', 'rdnpostno', 'bplcnm', 'lastmodts', 'updategbn', 'updatedt', 'uptaenm', 'x', 'y', 'sntuptaenm'],
      returning: false, // 업데이트된 데이터를 반환하지 않음
    });
  }
};

// 전체 데이터를 가져와서 데이터베이스에 저장하는 함수
const retrieveAndSaveData = async () => {
  try {
    let startIdx = 1;
    let endIdx = 1000; // API 요청 당 최대 개수
    let isCompleted = false;

    while (!isCompleted) {
      const data = await fetchData(startIdx, endIdx);
      await saveOrUpdateData(data);

      // 데이터가 더이상 없을 때 반복 중단
      if (data.length < 1000) {
        isCompleted = true;
      }

      // 인덱스 업데이트
      startIdx += 1000;
      endIdx += 1000;
    }
  } catch (error) {
    console.error('Failed to retrieve or save data', error);
    throw error;
  }
};

export { retrieveAndSaveData };
