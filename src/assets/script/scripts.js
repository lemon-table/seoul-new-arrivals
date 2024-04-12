document.addEventListener('DOMContentLoaded', function() {
    const startDatePicker = document.getElementById('start-date');
    const endDatePicker = document.getElementById('end-date');

    // const datePickers = document.querySelectorAll('.date-picker');
    // datePickers.forEach(picker => {
    //     // 키보드 입력 무시
    //     picker.addEventListener('keydown', function(event) {
    //         event.preventDefault();
    //     });
    // });

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
