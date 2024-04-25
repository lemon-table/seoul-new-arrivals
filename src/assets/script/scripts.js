// var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
// mapOption = { 
//     center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
//     level: 3 // 지도의 확대 레벨
// };

// // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
// var map = new kakao.maps.Map(mapContainer, mapOption); 

document.addEventListener('DOMContentLoaded', function() {

    const mapContainer = document.getElementById('map'), // 지도를 표시할 div
    mapOption = {
        center: new kakao.maps.LatLng(33.450701, 126.570667), // 기본 중심좌표
        level: 3 // 지도의 확대 레벨
    };

    /** 지도 객체 생성 */ 
    const map = new kakao.maps.Map(mapContainer, mapOption);

    // 지도의 이동이 끝날 때 발생하는 이벤트
    kakao.maps.event.addListener(map, 'idle', function() {
        fetchStoreData();
    });

    let redMarkers = [];

    function clearRedMarkers() {
        redMarkers.forEach(marker => marker.setMap(null));
        redMarkers = [];
    }

    // 마커 생성을 위한 함수 정의
    function createMarkerAtPosition(position, centerMap = true) {
        //clearRedMarkers();  // 모든 빨간색 마커 제거
        const newPos = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        
        // 마커가 이미 있다면 지도에서 제거합니다.
        if (marker) {
            marker.setMap(null);
        }
        
        // 새로운 위치에 마커를 생성합니다.
        marker = new kakao.maps.Marker({
            position: newPos,
            map: map
        });
        
        // 지도의 중심을 새 위치로 이동합니다.
        // map.setCenter(newPos);

        // 지도의 중심을 새 위치로 이동 옵션에 따라
        if (centerMap) {
            map.setCenter(newPos);
        }
        
        // 주소-좌표 변환 객체를 사용하여 주소 정보를 조회합니다.
        geocoder.coord2Address(newPos.getLng(), newPos.getLat(), function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
            // 인포윈도우에 표시될 내용을 생성합니다.
            var detailAddr = !!result[0].road_address ? '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
            detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';
            
            var content = '<div class="bAddr">' +
                            '<span class="title">법정동 주소정보</span>' + 
                            detailAddr + 
                            '</div>';
        
            // 마커 위에 인포윈도우를 표시합니다.
            infowindow.setContent(content);
            infowindow.open(map, marker);
            }
        });
    }

    // 빨간색 마커 생성
    // function createRedMarker(store) {
    //     const position = new kakao.maps.LatLng(store.coordinates.y, store.coordinates.x);
    //     const redMarker = new kakao.maps.Marker({
    //         position: position,
    //         map: map,
    //         image: new kakao.maps.MarkerImage(
    //             'http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
    //             new kakao.maps.Size(24, 35)
    //         )
    //     });
    
    //     kakao.maps.event.addListener(redMarker, 'click', function() {
    //         createMarkerAtPosition({coords: {latitude: store.coordinates.y, longitude: store.coordinates.x}});
    //         map.setCenter(position);
    //     });
    // }
    function createRedMarker(store) {
        const position = new kakao.maps.LatLng(store.coordinates.y, store.coordinates.x);
        const marker = new kakao.maps.Marker({
            position: position,
            map: map,
            image: new kakao.maps.MarkerImage(
                'http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                new kakao.maps.Size(24, 35)
            )
        });

        // 마커 클릭 이벤트
        kakao.maps.event.addListener(marker, 'click', function() {
            // 선택된 마커로 지도 중심 이동
            //map.setCenter(position);
            // 선택된 마커에 대한 상세 정보 표시
            // 여기에 인포윈도우 설정 등 추가 기능 구현
            //createMarkerAtPosition(position);
            createMarkerAtPosition({coords: {latitude: store.coordinates.y, longitude: store.coordinates.x}},false);
        });

        // 마커 배열에 추가
        redMarkers.push(marker);
    }

    // 사용자의 위치 정보를 가져오기
    if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                // // 위치 정보가 성공적으로 수신된 경우
                // const lat = position.coords.latitude, // 위도
                //         lng = position.coords.longitude; // 경도
                // const newPos = new kakao.maps.LatLng(lat, lng);

                // // 지도의 중심을 사용자의 위치로 이동
                // map.setCenter(newPos);
                createMarkerAtPosition(position,true);
            }, function(error) {
                console.error('Geolocation 정보를 가져오는데 실패했습니다:', error);
            });
    } else {
    console.error('이 브라우저에서는 Geolocation이 지원되지 않습니다.');
    }

    // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
    var mapTypeControl = new kakao.maps.MapTypeControl();

    // 지도에 컨트롤을 추가해야 지도위에 표시됩니다
    // kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

    // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
    var zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);



    /** 내 위치 다시 찾는 버튼 이벤트 */
    const relocateButton = document.getElementById('relocate');
    relocateButton.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                // const newPos = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
                // map.setCenter(newPos);
                createMarkerAtPosition(position,true);
            }, function(error) {
                console.error('Geolocation 정보를 가져오는데 실패했습니다:', error);
            });
        } else {
            console.error('이 브라우저에서는 Geolocation이 지원되지 않습니다.');
        }
    });

    // 주소-좌표 변환 객체를 생성합니다
    var geocoder = new kakao.maps.services.Geocoder();
    /** 마우스 표시 마커 설정 */
    var marker = new kakao.maps.Marker(), // 클릭한 위치를 표시할 마커입니다
    infowindow = new kakao.maps.InfoWindow({zindex:1}); // 클릭한 위치에 대한 주소를 표시할 인포윈도우입니다

    // 현재 지도 중심좌표로 주소를 검색해서 지도 좌측 상단에 표시합니다
    searchAddrFromCoords(map.getCenter(), displayCenterInfo);

    // 지도를 클릭했을 때 클릭 위치 좌표에 대한 주소정보를 표시하도록 이벤트를 등록합니다
    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        searchDetailAddrFromCoords(mouseEvent.latLng, function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var detailAddr = !!result[0].road_address ? '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
                detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';
                
                var content = '<div class="bAddr">' +
                                '<span class="title">법정동 주소정보</span>' + 
                                detailAddr + 
                            '</div>';

                console.log("mouseEvent:",mouseEvent);
                // 마커를 클릭한 위치에 표시합니다 
                marker.setPosition(mouseEvent.latLng);
                marker.setMap(map);

                // 인포윈도우에 클릭한 위치에 대한 법정동 상세 주소정보를 표시합니다
                infowindow.setContent(content);
                infowindow.open(map, marker);
            }   
        });
    });

    // 중심 좌표나 확대 수준이 변경됐을 때 지도 중심 좌표에 대한 주소 정보를 표시하도록 이벤트를 등록합니다
    kakao.maps.event.addListener(map, 'idle', function() {
        searchAddrFromCoords(map.getCenter(), displayCenterInfo);
    });

    function searchAddrFromCoords(coords, callback) {
        // 좌표로 행정동 주소 정보를 요청합니다
        geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);         
    }

    function searchDetailAddrFromCoords(coords, callback) {
        // 좌표로 법정동 상세 주소 정보를 요청합니다
        geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
    }

    // 지도 좌측상단에 지도 중심좌표에 대한 주소정보를 표출하는 함수입니다
    function displayCenterInfo(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var infoDiv = document.getElementById('centerAddr');

            for(var i = 0; i < result.length; i++) {
                // 행정동의 region_type 값은 'H' 이므로
                if (result[i].region_type === 'H') {
                    infoDiv.innerHTML = result[i].address_name;
                    break;
                }
            }
        }    
    }

    // API에서 가게 데이터를 불러오는 함수
    // async function fetchStoreData() {
    //     try {
    //         const response = await fetch('http://localhost:3008/api/seoul-data');
    //         const data = await response.json();

    //         // 데이터가 성공적으로 로드되면 DOM에 삽입
    //         if (data && data.data) {
    //             const stores = data.data;
    //             const listElement = document.getElementById('storeList');

    //             stores.forEach(store => {
    //                 const listItem = document.createElement('li');
    //                 listItem.textContent = `${store.name} - ${store.address} - (${store.coordinates.y}, ${store.coordinates.x})`;

    //                     listItem.addEventListener('click', function() {
    //                         // 리스트 항목 클릭 시 실행될 함수
    //                         const position = new kakao.maps.LatLng(store.coordinates.y, store.coordinates.x);
    //                         map.setCenter(position); // 지도 중심을 클릭한 가게 위치로 이동
                            
    //                         createMarkerAtPosition({coords: {latitude: store.coordinates.y, longitude: store.coordinates.x}}); // 마커 생성 함수 호출
    //                     });

    //                 listElement.appendChild(listItem);
    //             });
    //         }
    //     } catch (error) {
    //         console.error('Failed to fetch store data:', error);
    //     }
    // }

    // async function fetchStoreData() {
    //     // 지도의 현재 중심 좌표를 가져옵니다.
    //     const center = map.getCenter();
    //     const level = map.getLevel();

    //     // API 요청을 위해 현재 지도의 범위를 계산
    //     const swLatLng = new kakao.maps.LatLng(center.La - 0.01, center.Ma - 0.01);
    //     const neLatLng = new kakao.maps.LatLng(center.La + 0.01, center.Ma + 0.01);

    //     try {
    //         const response = await fetch(`http://localhost:3008/api/seoul-data?minLat=${swLatLng.La}&minLng=${swLatLng.Ma}&maxLat=${neLatLng.La}&maxLng=${neLatLng.Ma}`);
    //         const data = await response.json();

    //         if (data && data.data) {
    //             updateStoreList(data.data); // 화면에 데이터를 업데이트하는 함수
    //         }
    //     } catch (error) {
    //         console.error('Failed to fetch store data:', error);
    //     }
    // }

    // 데이터 불러오기 및 마커 업데이트
    async function fetchStoreData() {
        clearRedMarkers(); // 기존 마커 제거
        const bounds = map.getBounds();
        const swLatLng = bounds.getSouthWest();
        const neLatLng = bounds.getNorthEast();

        try {
            const response = await fetch(`http://localhost:3008/api/seoul-data?minLat=${swLatLng.getLat()}&minLng=${swLatLng.getLng()}&maxLat=${neLatLng.getLat()}&maxLng=${neLatLng.getLng()}`);
            const data = await response.json();
            if (data && data.data) {
                data.data.forEach(createRedMarker); // 각 데이터에 대해 마커 생성
                updateStoreList(data.data); // 화면에 데이터를 업데이트하는 함수
            }
        } catch (error) {
            console.error('Failed to fetch store data:', error);
        }
    }

    // function updateStoreList(stores) {
    //     const listElement = document.getElementById('storeList');
    //     listElement.innerHTML = ''; // 기존 리스트를 클리어

    //     stores.forEach(store => {
    //         const listItem = document.createElement('li');
    //         listItem.textContent = `${store.name} - ${store.address} - (${store.coordinates.y}, ${store.coordinates.x})`;
    //         listItem.addEventListener('click', function() {
    //             const position = new kakao.maps.LatLng(store.coordinates.y, store.coordinates.x);
    //             map.setCenter(position); // 지도 중심을 클릭한 가게 위치로 이동
    //             createMarkerAtPosition({coords: {latitude: store.coordinates.y, longitude: store.coordinates.x}}); // 마커 생성 함수 호출
    //         });
    //         listElement.appendChild(listItem);
    //     });
    // }

    function updateStoreList(stores) {
        const listElement = document.getElementById('storeList');
        listElement.innerHTML = ''; // 기존 리스트를 클리어
    
        stores.forEach(store => {
            const listItem = document.createElement('li');
            listItem.textContent = `${store.name} - ${store.address} - (${store.coordinates.y}, ${store.coordinates.x})`;
            listItem.addEventListener('click', function() {
                //const position = new kakao.maps.LatLng(store.coordinates.y, store.coordinates.x);
                //map.setCenter(position);
                createMarkerAtPosition({coords: {latitude: store.coordinates.y, longitude: store.coordinates.x}},false);
            });
            listElement.appendChild(listItem);
            createRedMarker(store);
        });
    }

    // 페이지 로드 완료 후 가게 데이터를 불러옵니다.
    //fetchStoreData();



    /** 가게 데이터 조회 */
    // 예시 가게 데이터 배열
    // const stores = [
    //     { name: "카페 아이엠", address: "서울시 강남구 역삼동 123-1", lat: 37.500111, lng: 127.033333 },
    //     { name: "서울 북카페", address: "서울시 서초구 서초동 456-2", lat: 37.495432, lng: 127.028444 },
    //     { name: "한강 맛집", address: "서울시 영등포구 여의도동 789-3", lat: 37.528311, lng: 126.932521 },
    //     { name: "망원동 피자", address: "서울시 마포구 망원동 101-4", lat: 37.556122, lng: 126.901123 },
    //     { name: "홍대 타코", address: "서울시 마포구 서교동 212-5", lat: 37.551231, lng: 126.922567 },
    //     { name: "이태원 그릴", address: "서울시 용산구 이태원동 334-6", lat: 37.533121, lng: 126.993345 },
    //     { name: "삼성동 치킨", address: "서울시 강남구 삼성동 667-7", lat: 37.507891, lng: 127.056789 },
    //     { name: "명동 샐러드", address: "서울시 중구 명동 888-8", lat: 37.563456, lng: 126.982654 },
    //     { name: "노량진 수산물", address: "서울시 동작구 노량진동 999-9", lat: 37.513123, lng: 126.939876 },
    //     { name: "강동구 빵집", address: "서울시 강동구 성내동 111-10", lat: 37.529234, lng: 127.123456 },
    //     { name: "강동구 빵집", address: "서울시 강동구 성내동 111-10", lat: 37.529234, lng: 127.123456 },
    //     { name: "강동구 빵집", address: "서울시 강동구 성내동 111-10", lat: 37.529234, lng: 127.123456 },
    //     { name: "강동구 빵집", address: "서울시 강동구 성내동 111-10", lat: 37.529234, lng: 127.123456 },
    //     { name: "강동구 빵집", address: "서울시 강동구 성내동 111-10", lat: 37.529234, lng: 127.123456 },
    //     { name: "강동구 빵집", address: "서울시 강동구 성내동 111-10", lat: 37.529234, lng: 127.123456 },
    //     { name: "강동구 빵집", address: "서울시 강동구 성내동 111-10", lat: 37.529234, lng: 127.123456 },
    //     { name: "강동구 빵집", address: "서울시 강동구 성내동 111-10", lat: 37.529234, lng: 127.123456 }
    // ];

    // const storeListElement = document.getElementById('storeList');

    // 가게 데이터를 기반으로 리스트 항목을 생성합니다.
    // stores.forEach((store) => {
    //     const listItem = document.createElement('li');
    //     listItem.textContent = store.name + ' - ' + store.address;
    //     storeListElement.appendChild(listItem);
    // });

    // // 가게 데이터를 기반으로 리스트 항목을 생성하고 클릭 이벤트를 설정합니다.
    // stores.forEach((store, index) => {
    //     const listItem = document.createElement('li');
    //     listItem.textContent = store.name + ' - ' + store.address;
    //     listItem.addEventListener('click', function() {
    //         // 리스트 항목 클릭 시 실행될 함수
    //         const position = new kakao.maps.LatLng(store.lat, store.lng);
    //         map.setCenter(position); // 지도 중심을 클릭한 가게 위치로 이동
            
    //         createMarkerAtPosition({coords: {latitude: store.lat, longitude: store.lng}}); // 마커 생성 함수 호출
    //     });
    //     storeListElement.appendChild(listItem);
    // });



    /**  조회 날짜 설정 */ 
    const startDatePicker = document.getElementById('start-date');
    const endDatePicker = document.getElementById('end-date');
    // 오늘 날짜를 YYYY-MM-DD 포맷으로 설정
    const today = new Date().toISOString().split('T')[0];

    startDatePicker.value = today; // 시작일 기본값 설정
    endDatePicker.value = today; // 종료일 기본값 설정

    startDatePicker.setAttribute('min', today); // 시작일 최소값 설정
    endDatePicker.setAttribute('min', today); // 종료일 최소값 설정

    // 시작일 선택 변경 시
    startDatePicker.addEventListener('change', function() {
        if (startDatePicker.value > endDatePicker.value) {
            alert("종료일 이후는 불가합니다.");
            startDatePicker.value = endDatePicker.value; // 시작일을 종료일로 재설정
        }
        endDatePicker.setAttribute('min', startDatePicker.value); // 종료일의 최소값을 시작일로 설정
    });

    // 종료일 선택 변경 시
    endDatePicker.addEventListener('change', function() {
        if (startDatePicker.value > endDatePicker.value) {
            alert("종료일 이후는 불가합니다.");
            endDatePicker.value = startDatePicker.value; // 종료일을 시작일로 재설정
        }
    });


});
