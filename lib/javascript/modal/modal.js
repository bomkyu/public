import { Insert, Select, fileUpload } from '../db/database.js';
import { showSpinner, hideSpinner } from '../UI/spinner.js';
import { modalDataReciver, modalCarendarReciver } from '../controller/write.js';

const modalWrap = document.querySelector('.modal-wrap');
const modalContain = modalWrap.querySelector('.modal-contain')
const modalContent = document.querySelector('.modal-content');

let session = sessionStorage.getItem("userInfo");


// moddal의 type
export const modalEventHandeller = (sort, data_type) => {
    switch (sort) {
        case 'h_80':
            
            openModal(sort);
            createElementHandler(data_type);
            break;
            
        case 'full' :
            openModal(sort);
            createElementHandler(data_type);
            break;
        default:
            break;
    }
}

// moddal 열기

function openModal(sort) {
  disableScroll();
  modalWrap.classList.add('active');
  modalWrap.classList.add(sort);
}

// moddal 닫기
export const closeModal = () => {
  enableScroll();
  modalWrap.classList.remove('active');
  modalWrap.classList.remove('h_80');
  modalWrap.classList.remove('full');
};

// 모달 창이 열릴 때 스크롤을 막기 위한 코드
function disableScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

// 모달 창이 닫힐 때 스크롤을 다시 허용하기 위한 코드
function enableScroll() {
  document.documentElement.style.overflow = 'auto';
  document.body.style.overflow = 'auto';
}

function preventDefault(e) {
  e.preventDefault();
}

//html 생성
let myArray = []; // 값을 담을 배열

let departureDate; //시작일
let returnDate; //오는일

const createElementHandler = async (data_type) => {
  let html = '';
  modalContent.innerHTML = '';
  switch (data_type) {
    case 'friend':
      const user_data = await Select('User');
      const friend_request_data = await Select('FriendRequest');
      const friendRequests = friend_request_data.filter(param => (param.requestFriend === session || param.sendFriend === session) && param.status === 'accept');
      const friendIds = friendRequests.map(param => {
        if (param.requestFriend === session) {
          return param.sendFriend;
        } else {
          return param.requestFriend;
        }
      });

      const friendLists = user_data.filter(user => friendIds.includes(user.id) && user.id !== session);

      if(friendLists.length === 0){
        const html = '<p>친구가 없어요</p>'
        modalContent.innerHTML += html;
        
        }else{
          friendLists.forEach((param)=>{
              html = `
                      <dl class="friend-list ${myArray.length != 0 ? myArray.includes(param.id) ? 'active' : '' : ''}" data-friend_id="${param.id}">
                          <dt>
                          <div class="img-wrap">
                              <div class="img-thumb" style="background-image: url('${param.imgUrl ? param.imgUrl : '../lib/images/img_user.png'}');"></div>
                          </div>
                          </dt>
                          <dd>
                          <p class="nick-name">${param.userName}</p>
                          <p class="user-name">${param.userNickName}</p>
                          </dd>
                      </dl>
                      `;
            modalContent.innerHTML += html;

            const friend_list = modalContent.querySelectorAll('.friend-list');
            friend_list.forEach((el)=>{
                el.addEventListener('click', (e)=>{
                  const friend_id = e.currentTarget.dataset.friend_id;
                  el.classList.toggle('active');
                    
                  if (el.classList.contains('active')) {
                    // 'active' 클래스가 있는 경우 배열에 값을 추가
                    myArray.push(friend_id);
                  } else {
                    myArray = myArray.filter(item => item !== friend_id);
                  }
                  modalDataReciver(myArray);
                })
            })
          })
        }
    break;

    
    
    case 'calendar':
      const createCalendar = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        const departureDateLi = document.getElementById('departure-date');
        const todayDateLi = document.getElementById('today-date');
        let calendarHTML = '';
      
        for (let year = currentYear; year <= currentYear; year++) {
          for (let month = currentMonth; month <= 12; month++) {
            const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
            calendarHTML += `<h2 class="calendar-title">${monthName}</h2>`;
            calendarHTML += '<ul class="calendar-list">';
      
            const date = new Date(year, month - 1);
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
      
            // 요일 헤더를 추가합니다.
            calendarHTML += '<li class="weekdays">';
            for (let i = 0; i < 7; i++) {
              calendarHTML += `<p><span>${daysOfWeek[i]}</span></p>`;
            }
            calendarHTML += '</li>';
      
            let currentDay = 1;
      
            // 이전 달의 마지막 날짜를 구합니다.
            const previousMonth = month === 1 ? 12 : month - 1;
            const previousYear = month === 1 ? year - 1 : year;
            const previousLastDay = new Date(previousYear, previousMonth, 0).getDate();
      
            // 다음 달의 첫 날짜를 구합니다.
            const nextMonth = month === 12 ? 1 : month + 1;
            const nextYear = month === 12 ? year + 1 : year;
      
            // 이전 달의 일수를 추가합니다.
            const previousDays = (firstDay.getDay() + 6) % 7;
            const previousMonthDays = previousDays === 0 ? 7 : previousDays;
            const previousStartDay = previousLastDay - previousMonthDays + 1;
      
            // 첫 주에 이전 달의 일수를 추가합니다.
            if (previousMonthDays < 7) {
              calendarHTML += '<li>';
      
              for (let i = 0; i < 7; i++) {
                if (i < previousMonthDays) {
                  const previousDay = previousStartDay + i;
                  calendarHTML += `<p class="previous-month"><span>${previousDay}</span></p>`;
                } else {
                  const dayClass = currentDay <= currentDate.getDate() && month === currentMonth ? 'previous-day' : '';
                  calendarHTML += `<p class="${dayClass}"><span>${currentDay}</span></p>`;
                  currentDay++;
                }
              }
      
              calendarHTML += '</li>';
            }
      
            // 현재 달의 일수를 추가합니다.
            while (currentDay <= lastDay.getDate()) {
              calendarHTML += '<li>';
      
              for (let i = 0; i < 7; i++) {
                if (currentDay <= lastDay.getDate()) {
                  const dayClass = currentDay === currentDate.getDate() && month === currentMonth ? 'today' : currentDay < currentDate.getDate() && month === currentMonth ? 'previous-day' : '';
                  calendarHTML += `<p class="${dayClass}"><span>${currentDay}</span></p>`;
                  currentDay++;
                } else {
                  const nextDay = currentDay - lastDay.getDate();
                  calendarHTML += `<p class="next-month"><span>${nextDay}</span></p>`;
                  currentDay++;
                }
              }
      
              calendarHTML += '</li>';
            }
      
            calendarHTML += '</ul>';
          }
        }
      
        return calendarHTML;
      };
      
      const calendar = createCalendar();
      modalContent.innerHTML = calendar;

      const calendarList = document.querySelectorAll('.calendar-list > li > p');


      calendarList.forEach((li) => {
        li.addEventListener('click', (e) => {
          if (li.classList.contains('previous-day') || li.classList.contains('previous-month') || li.classList.contains('previous-year') || li.classList.contains('next-day') || li.classList.contains('next-month')) {
            return;
          }
          const clickedDay = parseInt(e.target.innerText);
          const calendarTitle = document.querySelector('.calendar-title').innerText;
          const [year, monthName] = calendarTitle.split(' ');
          //console.log(`${year} ${monthName} ${clickedDay}일`);
          // 출발 날짜가 선택되지 않은 경우
          if (!departureDate) {
            // 출발 날짜에 해당하는 class를 추가
            li.classList.add('go-day');
            // 출발 날짜 정보를 저장
            departureDate = {
              sort : 'go_date',
              year: parseInt(calendarTitle.split(' ')[0]),
              month: parseInt(calendarTitle.split(' ')[1]),
              day: parseInt(e.target.innerText),
            };
            modalCarendarReciver(departureDate); // write.js에 출발 값전달
          } else {
            // 도착 날짜가 선택되지 않은 경우
            if (!returnDate) {
              // 출발 날짜 이전을 선택한 경우
              if (isDateBefore(departureDate, calendarTitle, e.target.innerText)) {
                // 기존의 go-day 클래스를 제거하고 come-day 클래스를 추가하여 선택된 날짜로 변경
                document.querySelector('.go-day').classList.remove('go-day');
                li.classList.add('come-day');
                // 출발 날짜 정보를 갱신
                departureDate = {
                  sort : 'go_date',
                  year: parseInt(calendarTitle.split(' ')[0]),
                  month: parseInt(calendarTitle.split(' ')[1]),
                  day: parseInt(e.target.innerText),
                };
                modalCarendarReciver(departureDate); // write.js에 출발 값전달

              } else {
                // 도착 날짜에 해당하는 class를 추가
                li.classList.add('come-day');
                // 도착 날짜 정보를 저장
                returnDate = {
                  sort : 'come_date',
                  year: parseInt(calendarTitle.split(' ')[0]),
                  month: parseInt(calendarTitle.split(' ')[1]),
                  day: parseInt(e.target.innerText),
                };
                modalCarendarReciver(returnDate); // write.js에 도착 값전달
              }
            } else {
              // 출발 날짜와 도착 날짜가 이미 선택된 경우, 모든 날짜 선택 해제
              document.querySelectorAll('.go-day, .come-day').forEach((date) => {
                date.classList.remove('go-day', 'come-day');
              });
          
              // 출발 날짜에 해당하는 class를 추가
              li.classList.add('go-day');
              // 출발 날짜 정보를 저장
              departureDate = {
                sort : 'go_date',
                year: parseInt(calendarTitle.split(' ')[0]),
                month: parseInt(calendarTitle.split(' ')[1]),
                day: parseInt(e.target.innerText),
              };
              modalCarendarReciver(departureDate); // write.js에 출발 값전달
              // 도착 날짜 초기화
              returnDate = null;
            }
          }
          
        });
      });
      // 출발 날짜가 선택된 날짜 이전인지 확인하는 함수
      function isDateBefore(departureDate, calendarTitle, selectedDay) {
        const [year, monthName] = calendarTitle.split(' ');
        const selectedDate = new Date(`${year}-${monthName}-${selectedDay}`);
        const departureDateString = `${departureDate.year}-${departureDate.month}-${departureDate.day}`;
        const departureDateObj = new Date(departureDateString);

        return selectedDate < departureDateObj;
      }

    break;
    default:
      break;
  }
};