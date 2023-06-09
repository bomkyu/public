import { Insert, Select, fileUpload } from '../db/database.js';
import { showSpinner, hideSpinner } from '../UI/spinner.js'

const loginForm = document.getElementById("register-form");

const idInput = document.getElementById('id');
const password1Input = document.getElementById('password1');
const password2Input = document.getElementById('password2');
const nameInput = document.getElementById('name');
const nickNameInput = document.getElementById('NickName');
const form = document.getElementById('register-form');

const realUpload = document.querySelector('.real-upload');
const upload = document.querySelector('.file-upload');
const imgThumb = document.querySelector('.img-thumb');

upload.addEventListener('click', () => realUpload.click());
realUpload.addEventListener('change', getImageFiles);

let file;
/*function getImageFiles(e) {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      file = files[0];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const imageUrl = e.target.result;
        imgThumb.style.backgroundImage = `url(${imageUrl})`;

        console.log('getImageFiles', file);
      };
      
      reader.readAsDataURL(file);
    }
}*/
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif']; // 이미지 파일 확장자 배열

function getImageFiles(e) {
  const files = e.currentTarget.files;
  if (files && files.length > 0) {
    file = files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase(); // 파일의 확장자 추출

    if (imageExtensions.includes(fileExtension)) {
      const reader = new FileReader();

      reader.onload = function(e) {
        const imageUrl = e.target.result;
        imgThumb.style.backgroundImage = `url(${imageUrl})`;

        console.log('getImageFiles', file);
      };

      reader.readAsDataURL(file);
    } else {
      console.log('이미지 파일이 아닙니다.');
    }
  }
}

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const idValue = idInput.value;
    const password1Value = password1Input.value;
    const password2Value = password2Input.value;
    const nameValue = nameInput.value;
    const nickNameValue = nickNameInput.value;

    //정규식
    const idRegex = /^.{8,}$/;
    const passwordRegex = /^.{8,}$/;
    
    if (!idRegex.test(idValue)) {
        alert('ID는 8글자 이상이어야 하며, 특수문자는 사용 불가능합니다.');
        return;
    }
    
    if (!passwordRegex.test(password1Value)) {
        alert('Password는 8글자 이상이어야 합니다.');
        return;
    }
    if (password1Value !== password2Value) {
        alert('Password가 일치하지 않습니다.');
        return;
    }

    // Name 유효성 검사: 특수문자 사용 불가
    const nameRegex = /^[a-zA-Z가-힣]+$/;
    if (!nameRegex.test(nameValue)) {
        alert('유효한 이름을 입력해 주세요.');
        return;
    }

    let users = await Select('User');
    let user = users.find((param) => param.id == idValue);

    if(user){
        alert('이미 등록된 아이디 입니다.');
        return;
    }

    

    const formatter = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });
    const parts = formatter.formatToParts(new Date());

    const currentDate = `${parts[0].value}-${parts[2].value}-${parts[4].value} ${parts[6].value}:${parts[8].value}:${parts[10].value}`;

    const userJson = {
        "id": idValue.trim(),
        "passWord": password1Value.trim(),
        "userName": nameValue.trim(),
        "userNickName": nickNameValue.trim(),
        "datetime": currentDate.trim()
    };
    showSpinner();
    fileUpload(file, currentDate)
    .then(downloadURL => {
      
        // 다운로드 URL을 얻은 후에 Insert 함수 호출
        const key = 'User'; // 컬렉션 키
        const value = { ...userJson, 'imgUrl': downloadURL }; // 다운로드 URL을 데이터에 추가
        return Insert(key, value);
    })
    .then(() => {
        
        console.log("모든 작업 완료");
        sessionStorage.setItem("userInfo", idValue.trim()); // 저장
        window.location.replace('./main.html');
        hideSpinner();
    })
    .catch((error) => {
        
        if (error.message === 'No image file') {
        // 이미지 파일이 없는 경우에 대한 예외 처리
        const key = 'User'; // 컬렉션 키
        const value = { ...userJson, 'imgUrl' : '' }; // 이미지 파일 없이 데이터만 추가
        return Insert(key, value);
        } else {
          alert("작업 실패:", error);
        }
    });
})
