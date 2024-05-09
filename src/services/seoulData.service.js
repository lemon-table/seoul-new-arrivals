import SeoulData from '../models/seoulData.js'; // 모델 import
import axios from 'axios';
import dotenv from 'dotenv';
import Sequelize from 'sequelize'; 
import proj4 from 'proj4';
import cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

const API_BASE_URL = 'http://openapi.seoul.go.kr:8088';
const API_PATH = '/json/LOCALDATA_072218'; // 제과영업점
// API 경로를 배열로 설정
const API_PATHS = ['/json/LOCALDATA_072218', '/json/LOCALDATA_072404'];

const KAKAO_API_KEY = process.env.KAKAO_MAP_API_KEY;
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/search/address.json';

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);


async function fetchImagesFromNaver(query) {
  const url = 'https://openapi.naver.com/v1/search/image';
  try {
    const response = await axios.get(url, {
      params: { query, display: 3 },
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
      }
    });
    return response.data.items.map(item => item.thumbnail);
  } catch (error) {
    console.error('Error fetching images from Naver:', error);
    return [];
  }
}

// async function fetchImagesFromNaver(query) {
//   const url = 'https://openapi.naver.com/v1/search/blog.json';
//   try {
//     const response = await axios.get(url, {
//       params: { query, display: 3 },
//       headers: {
//         'X-Naver-Client-Id': NAVER_CLIENT_ID,
//         'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
//       }
//     });
    
//     const pageLinks = response.data.items.map(item => item.link);
//     const imageLinks = await Promise.all(pageLinks.map(link => fetchImagesFromPage(link)));
//     return imageLinks.flat();
//   } catch (error) {
//     console.error('Error fetching web pages from Naver:', error);
//     return [];
//   }
// }


// async function fetchImagesFromPage(url) {
//   try {
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);  // 변경된 사용법에 맞게 load 함수를 사용
//     const images = $('img').map((i, el) => $(el).attr('src')).get();
//     console.log('images:',images);
//     return images.filter(src => src && (src.includes('.jpg') || src.includes('.png')));
//   } catch (error) {
//     console.error(`Error fetching images from page: ${url}`, error);
//     return [];
//   }
// }

// async function fetchImagesFromNaver(query) {
//   const url = 'https://openapi.naver.com/v1/search/blog.json';
//   try {
//     const response = await axios.get(url, {
//       params: { query, display: 3 },
//       headers: {
//         'X-Naver-Client-Id': NAVER_CLIENT_ID,
//         'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
//       }
//     });

//     const pageLinks = response.data.items.map(item => item.link);
//     // 각 페이지에서 이미지 링크를 추출하고 바로 반환
//     const imageLinksPromises = pageLinks.map(link => fetchImagesFromPage(link));
//     const imageLinksArrays = await Promise.all(imageLinksPromises);
//     const flatImageLinks = imageLinksArrays.flat(); // 배열을 평탄화
//     return flatImageLinks;
//   } catch (error) {
//     console.error('Error fetching web pages from Naver:', error);
//     return [];
//   }
// }

async function fetchImagesFromPage(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const images = $('img').map((i, el) => $(el).attr('src')).get();
    return images.filter(src => src && (src.includes('.jpg') || src.includes('.png')));
  } catch (error) {
    console.error(`Error fetching images from page: ${url}`, error);
    return [];
  }
}

// async function fetchImagesFromPage(url) {
//   try {
//     const response = await axios.get(url);
//     const dom = new JSDOM(response.data);
//     console.log('dom:',dom);
//     const images = Array.from(dom.window.document.querySelectorAll('img')).map(img => img.src);
//     console.log('images:',images);
//     return images.filter(src => src && (src.includes('.jpg') || src.includes('.png')));
//   } catch (error) {
//     console.error(`Error fetching images from page: ${url}`, error);
//     return [];
//   }
// }

const getCoordinatesFromAddress = async (originalAddress) => {
  //const API_KEY = process.env.KAKAO_API_KEY; // 환경변수에서 API 키를 불러옵니다.
  let address = originalAddress;
  let maxAttempts = 3; // 최대 시도 횟수
  let attempt = 0;

  if(address===null) return null;

  while (attempt < maxAttempts) {
    try {

      const url = `https://dapi.kakao.com/v2/local/search/address.json`;
      const response = await axios.get(url, {
        headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
        params: { query: address }
      });

      if (response.data.documents.length > 0) {
        const { x, y } = response.data.documents[0];
        return [parseFloat(x), parseFloat(y)];
      } else {
        // 주소의 마지막 부분을 제거
        const parts = address.trim().split(" ");
        if (parts.length > 1) {
          parts.pop(); // 마지막 요소 제거
          address = parts.join(" ");
        } else {
          // 더 이상 제거할 부분이 없을 때
          throw new Error('주소에 해당하는 좌표 정보를 찾을 수 없습니다.');
        }
      }
    } catch (error) {
      if (attempt === maxAttempts - 1) { // 마지막 시도에서도 실패한 경우
        console.error(`좌표 변환 실패: ${originalAddress}`, error);
        return null;
      }
    }
    attempt++;
  }
};

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

function isValidCoordinate(value) {
  return typeof value === 'number' && isFinite(value);
}

// 데이터를 데이터베이스에 삽입 또는 업데이트하는 함수
const saveOrUpdateData = async (data) => {
  for (const item of data) {

    //const coordinates = await getCoordinatesFromAddress(item.SITEWHLADDR);

    // TM 좌표계 정의 (여기서는 EPSG:5186 예시로 사용)
    const projTM = "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs";

    // WGS84 좌표계 정의
    const projWGS84 = "EPSG:4326";


    const x = parseFloat(item.X);
    const y = parseFloat(item.Y);

    // 좌표 유효성 검사
    if (!isValidCoordinate(x) || !isValidCoordinate(y)) {
      console.error(`Invalid coordinates for item: ${item}`);
      continue; // 유효하지 않은 좌표는 처리를 건너뜁니다.
    }

    // TM에서 WGS84로 좌표 변환
    //const [lon, lat] = proj4(projTM, projWGS84, [x, y]);

    let addressToUse = item.SITEWHLADDR; // 기본적으로 SITEWHLADDR 사용
    if (!addressToUse) {
        addressToUse = item.RDNWHLADDR; // SITEWHLADDR가 없을 경우 RDNWHLADDR 사용
    }

    // 주소를 기반으로 좌표를 가져옵니다.

    const coordinates = await getCoordinatesFromAddress(item.SITEWHLADDR);

    if (!coordinates) {
      console.error(`좌표를 찾을 수 없음: ${item.SITEWHLADDR}`);
      continue; // 유효한 좌표가 없으면 이 데이터를 건너뜁니다.
    }

    const [lon, lat] = coordinates;
    //const [lon, lat] = await getCoordinatesFromAddress(addressToUse);

    // 이미지 가져오기
    const images = await fetchImagesFromNaver(item.BPLCNM);

    console.log('save image:',images);
    console.log('save image[0]:',images[0]);
    console.log('save image[1]:',images[1]);

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
      x: lon,
      y: lat,
      sntuptaenm: item.SNTUPTAENM,
      image_url1: images[0],
      image_url2: images[1],
      image_url3: images[2],
      // 다른 컬럼들도 필요에 따라 이와 같은 방식으로 추가합니다.
      // ...
    }, {
      // upsert 메소드는 기본키나 unique 컬럼이 일치할 경우 update, 그렇지 않을 경우 insert를 수행합니다.
      fields: ['opnsfteamcode', 'mgtno', 'apvpermynd', 'trdstategbn', 'trdstatenm', 
                'dtlstategbn', 'dtlstatenm', 'dcbymd', 'sitetel', 'sitepostno', 
                'sitewhladdr', 'rdnwhladdr', 'rdnpostno', 'bplcnm', 'lastmodts', 
                'updategbn', 'updatedt', 'uptaenm', 'x', 'y', 
                'sntuptaenm','image_url1','image_url2','image_url3'],
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

    // const data = await fetchData(1, 10);
    // await saveOrUpdateData(data);

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

const getStoreInfo = async (minLat, minLng, maxLat, maxLng) => {
  try {
    // 지리 공간 쿼리를 위한 where 조건 구성
    const whereCondition = {
      trdstatenm: '영업/정상',
      x: { [Sequelize.Op.between]: [parseFloat(minLng), parseFloat(maxLng)] },
      y: { [Sequelize.Op.between]: [parseFloat(minLat), parseFloat(maxLat)] }
    };

    // SeoulData 모델을 사용하여 가게 이름, 주소, 좌표 데이터를 조회합니다.
    const storeInfo = await SeoulData.findAll({
      attributes: ['bplcnm', 'sitewhladdr', 'x', 'y','image_url1','image_url2','image_url3','apvpermynd'],
      where: whereCondition,
      limit: 30
    });

    // 조회된 데이터를 반환
    return storeInfo.map(info => ({
      name: info.bplcnm,
      address: info.sitewhladdr,
      coordinates: { x: info.x, y: info.y },
      image_url : info.image_url1,
      image_url2 : info.image_url2,
      image_url3 : info.image_url3,
      store_opening_date : info.apvpermynd
    }));
  } catch (error) {
    console.error('Error fetching store information:', error);
    throw error;
  }
};

// 검색 조건에 맞는 데이터를 조회하는 함수
const getSearchData = async (start_date, end_date, status, keyword) => {
  try {
    // 검색 조건을 담는 Sequelize where 객체
    const whereCondition = {};

    // 날짜 조건 처리
    if (start_date && end_date) {
      whereCondition.apvpermynd = {
        [Sequelize.Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // 영업 상태 조건 처리
    if (status && status !== 'all') {
      whereCondition.trdstatenm = status;
    }

    // 키워드 조건 처리 (가게 이름 또는 주소 포함)
    if (keyword) {
      whereCondition[Sequelize.Op.or] = [
        { bplcnm: { [Sequelize.Op.like]: `%${keyword}%` } },
        { sitewhladdr: { [Sequelize.Op.like]: `%${keyword}%` } }
      ];
    }

    // 데이터 조회
    const storeInfo = await SeoulData.findAll({
      attributes: ['bplcnm', 'sitewhladdr', 'x', 'y','image_url1','image_url2','image_url3','apvpermynd'],
      where: whereCondition,
      limit: 30 // 조회할 데이터 수 제한
    });

    // 조회된 데이터를 적절히 가공하여 반환
    return storeInfo.map(info => ({
      name: info.bplcnm,
      address: info.sitewhladdr,
      coordinates: {
        x: info.x,
        y: info.y
      },
      image_url : info.image_url1,
      image_url2 : info.image_url2,
      image_url3 : info.image_url3,
      store_opening_date : info.apvpermynd
    }));
  } catch (error) {
    console.error('Error fetching store information with search criteria:', error);
    throw error; // 에러를 외부로 전달
  }
};

const getDetailData = async (store_id) => {

  try {
    const storeDetails = await SeoulData.findOne({
        where: { id: store_id },
        attributes: ['bplcnm', 'sitewhladdr', 'image_url1', 'image_url2', 'image_url3']
    });

    if (storeDetails) {
        res.json(storeDetails);
    } else {
        res.status(404).send('Store not found');
    }
} catch (error) {
    console.error('Error fetching store details:', error);
    res.status(500).send('Internal Server Error');
}
}

// AI 모델을 사용하여 컨텐츠를 생성하는 함수
// async function generateContentWithAI(promptText) {
//   try {
//     const postData = {
//       prompt: promptText
//     };

//     const response = await axios.post(apiEndpoint, postData, {
//       headers: {
//         'Authorization': `Bearer ${GOOGLE_API_KEY}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     // 응답된 텍스트를 가공하여 HTML 형식으로 변환
//     const text = response.data.text;
//     // let outputStr = '';

//     // const lines = text.split('\n');
//     // for (let line of lines) {
//     //   if (line.trim()) {
//     //     const cleanedLine = line.replace('*', '').trim();
//     //     outputStr += `<p style="font-family: 'Noto Sans Light'; color: #000000;" data-ke-size="size18">${cleanedLine}</p>`;
//     //   }
//     // }

//     return text || '조회되는 데이터가 없습니다.';
//   } catch (error) {
//     console.error('Error during AI content generation:', error);
//     return 'AI 컨텐츠 생성 중 오류가 발생했습니다.';
//   }
// }

// // 예제 사용
// async function useOfGenerateContentWithAI(name,address) {
//   const prompt = `
//   너는 500년 경력의 꿈해몽 전문가이자 500년 경력의 흡입력 있는 글쓰기를 잘하는 카피라이팅 전문가. 
//   '교통사고 꿈해몽'이라는 키워드 통해 블로그 형식의 글을 작성하라.
//   먼저 꿈이 지니는 의미에 대한 흥미로운 소개와 키워드의 꿈 의미를 간략히 적는다.
//   그 다음 키워드의 꿈이 지니는 다양한 상황별 소개와 상세한 해석 설명하고,
//   꿈과 연결된 관련번호(1~45 사이 중 5개만)를 꿈별로 알려준다.
//   그리고 마지막으로 꿈이 우리에게 주는 긍정적인 영향에 대한 작성으로 글을 마무리한다.
//   `;

//   const content = await generateContentWithAI(prompt);

//   return content;
// }

// AI 모델을 사용하여 컨텐츠를 생성하는 함수
async function generateContentWithAI(promptText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error during AI content generation:', error);
    throw error;  // 상위 함수로 에러를 전파하여 적절히 처리할 수 있도록 함
  }
}

// 함수 사용 예
async function createAiPost(name,address,store_opening_date) {
  //const prompt = "Write a story about a magic backpack.";
  const prompt = `
  너는 50년 경력의 서울 지리와 트렌드를 전부 꿰뚫고 있는 도시 전문가다.
  너는 ${store_opening_date} 일자에 가게를 오픈한 ${address} 주소의 ${name} 서울 빵집 가게 정보를 조사하여 아래와 같이 작성한다.

  가게 소개,
  가게만의 장점,
  주변 볼거리,
  추천 데이트 코스 (여기는 예를 들어 어디 전시관 - 이 가게 - 어디 하천 이런식으로 이 가게를 포함한 코스를 3개 만들어라)


  문단 작성시 

  가게 소개
  (내용) 참고.내용 작성시 ${store_opening_date} 에 일자가 있으면 해당 년도를 기준으로 가게 연차를 소개하고, 없으면 연차 소개를 제외한 상태로 소개하라.

  가게만의 장점
  (내용)

  주변 볼거리 
  (내용)

  추천 데이트 코스
  (내용)

  이런 식으로 띄어쓰기를 맞추어라.

  위 정보 모두 사실만을 작성하라. 간혹 영업 년도를 잘못 말하거나 없는 메뉴를 적는 경우가 있다. 이를 반드시 유념하여 사실만을 작성할 것.
  주변 볼거리도 마찬가지로 실제로 있는 주변 볼거리여야 한다. 없는 볼거리를 소개하는 경우가 있는데 이점도 반드시 주의할 것.
  
  `;
  const content = await generateContentWithAI(prompt);
  console.log(content);
  return content;
}

export { retrieveAndSaveData,getStoreInfo, getSearchData, getDetailData, createAiPost };
