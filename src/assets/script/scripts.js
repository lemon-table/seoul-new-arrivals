document.addEventListener('DOMContentLoaded', function() {

    // 검색 버튼 이벤트 리스너 추가
    const searchButton = document.querySelector('button[type="submit"]');
    const inputKeyword = document.querySelector('input[type="text"]');
    const businessStatusSelect = document.getElementById('business-status');

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

    // 검색 버튼 이벤트
    searchButton.addEventListener('click', async function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const businessStatus = businessStatusSelect.value;
        const keyword = inputKeyword.value;

        try {
            // API 요청 URL 구성
            const url = new URL('http://localhost:3008/api/search');
            // URLSearchParams를 사용하여 쿼리 파라미터를 구성
            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
                status: businessStatus,
                keyword: keyword
            });
            url.search = params.toString();

            // Fetch API를 사용하여 데이터 요청
            const response = await fetch(url);
            if (!response.ok) throw new Error('서버 응답이 올바르지 않습니다.');
            const data = await response.json();

            // 여기에서 응답 데이터를 처리 (예: 지도에 마커 추가, 목록 업데이트 등)
            console.log(data); // 콘솔에 결과 출력
        } catch (error) {
            console.error('데이터 검색 중 에러 발생:', error);
        }
    });

    function createRedMarker(store) {
        const position = new kakao.maps.LatLng(store.coordinates.y, store.coordinates.x);
        const marker = new kakao.maps.Marker({
            position: position,
            map: map,
            image: new kakao.maps.MarkerImage(
                'http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                new kakao.maps.Size(24, 30)
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

    // 가게 목록
    function updateStoreList(stores) {
        const listElement = document.getElementById('storeList');
        listElement.innerHTML = ''; // 기존 리스트를 클리어
    
        stores.forEach(store => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span style="font-size: 16px;">${store.name}</span><br><span style="font-size: 10px;">${store.address}</span>`;
            listItem.addEventListener('click', function() {
                createMarkerAtPosition({coords: {latitude: store.coordinates.y, longitude: store.coordinates.x}}, false);
            });
            listElement.appendChild(listItem);
            createRedMarker(store);
        });
    }


    /**  조회 날짜 설정 */ 
    const startDatePicker = document.getElementById('start-date');
    const endDatePicker = document.getElementById('end-date');
    // 오늘 날짜를 YYYY-MM-DD 포맷으로 설정
    const today = new Date().toISOString().split('T')[0];
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 6));

    // 날짜를 YYYY-MM-DD 형식으로 포매팅하는 함수
    function formatDate(date) {
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        return [year, month, day].join('-');
    }

    //startDatePicker.value = today; // 시작일 기본값 설정
    startDatePicker.value = formatDate(sixMonthsAgo); // 6개월 전
    endDatePicker.value = formatDate(today); // 종료일 기본값 설정

    startDatePicker.setAttribute('min', sixMonthsAgo ); // 시작일 최소값 설정
    endDatePicker.setAttribute('min', sixMonthsAgo ); // 종료일 최소값 설정

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
