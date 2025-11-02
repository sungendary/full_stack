// 백엔드 서버 URL 
const API_BASE_URL = 'http://localhost:3000';

// 현재 로그인된 사용자 정보
let currentUser = null;

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 프론트엔드 애플리케이션이 시작되었습니다.');
    
    // 이벤트 리스너 등록
    setupEventListeners();
    
    // 서버 상태 자동 확인
    checkServerStatus();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로그인 폼 이벤트
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
    
    // 로그아웃 버튼 이벤트
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
    
    // 사용자 목록 불러오기 버튼
    const loadUsersBtn = document.getElementById('loadUsersBtn');
    loadUsersBtn.addEventListener('click', loadUsers);
    
    // 서버 상태 확인 버튼
    const checkStatusBtn = document.getElementById('checkStatusBtn');
    checkStatusBtn.addEventListener('click', checkServerStatus);
    
    // Enter 키로 데이터 처리 실행
    const dataInput = document.getElementById('dataInput');
    dataInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            processData('echo');
        }
    });
}

// 로그인 처리
async function handleLogin(event) {
    event.preventDefault(); // 폼 기본 제출 동작 방지
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('아이디와 비밀번호를 입력해주세요.', 'error');
        return;
    }
    
    try {
        showMessage('로그인 중...', 'info');
        
        // 백엔드 로그인 API 호출
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 로그인 성공
            currentUser = data.user;
            showMessage(`${data.user.name}님, 환영합니다!`, 'success');
            showUserSections();
            displayUserInfo(data.user);
            
            // 폼 초기화
            document.getElementById('loginForm').reset();
        } else {
            // 로그인 실패
            showMessage(data.message, 'error');
        }
        
    } catch (error) {
        console.error('로그인 에러:', error);
        showMessage('서버와 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.', 'error');
    }
}

// 로그아웃 처리
function handleLogout() {
    currentUser = null;
    hideUserSections();
    showMessage('로그아웃되었습니다.', 'info');
    
    // 결과 영역들 초기화
    document.getElementById('userInfo').innerHTML = '';
    document.getElementById('dataResult').innerHTML = '';
    document.getElementById('usersList').innerHTML = '';
}

// 데이터 처리 함수
async function processData(action) {
    const dataInput = document.getElementById('dataInput');
    const inputValue = dataInput.value.trim();
    
    if (!inputValue) {
        showMessage('처리할 데이터를 입력해주세요.', 'error');
        return;
    }
    
    if (!currentUser) {
        showMessage('먼저 로그인해주세요.', 'error');
        return;
    }
    
    try {
        showMessage('데이터 처리 중...', 'info');
        
        // 백엔드 데이터 처리 API 호출
        const response = await fetch(`${API_BASE_URL}/api/process-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                data: inputValue
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayDataResult(result);
            showMessage('데이터 처리 완료!', 'success');
        } else {
            showMessage('데이터 처리 중 오류가 발생했습니다.', 'error');
        }
        
    } catch (error) {
        console.error('데이터 처리 에러:', error);
        showMessage('서버와 연결할 수 없습니다.', 'error');
    }
}

// 사용자 목록 불러오기
async function loadUsers() {
    if (!currentUser) {
        showMessage('먼저 로그인해주세요.', 'error');
        return;
    }
    
    try {
        showMessage('사용자 목록을 불러오는 중...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/api/users`);
        const data = await response.json();
        
        if (data.success) {
            displayUsersList(data.users);
            showMessage(`${data.total}명의 사용자를 불러왔습니다.`, 'success');
        } else {
            showMessage('사용자 목록을 불러올 수 없습니다.', 'error');
        }
        
    } catch (error) {
        console.error('사용자 목록 로드 에러:', error);
        showMessage('서버와 연결할 수 없습니다.', 'error');
    }
}

// 서버 상태 확인
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        const data = await response.json();
        
        displayServerStatus(data, true);
        showMessage('서버가 정상적으로 작동 중입니다.', 'success');
        
    } catch (error) {
        console.error('서버 상태 확인 에러:', error);
        displayServerStatus(null, false);
        showMessage('백엔드 서버에 연결할 수 없습니다. 서버를 시작해주세요.', 'error');
    }
}

// UI 표시 함수들
function showUserSections() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('userSection').classList.remove('hidden');
    document.getElementById('dataSection').classList.remove('hidden');
    document.getElementById('usersSection').classList.remove('hidden');
}

function hideUserSections() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('userSection').classList.add('hidden');
    document.getElementById('dataSection').classList.add('hidden');
    document.getElementById('usersSection').classList.add('hidden');
}

function displayUserInfo(user) {
    const userInfoDiv = document.getElementById('userInfo');
    userInfoDiv.innerHTML = `
        <div class="user-card">
            <h4>🎉 로그인 성공!</h4>
            <p><strong>사용자 ID:</strong> ${user.id}</p>
            <p><strong>아이디:</strong> ${user.username}</p>
            <p><strong>이름:</strong> ${user.name}</p>
            <p><strong>로그인 시간:</strong> ${new Date().toLocaleString()}</p>
        </div>
    `;
}

function displayDataResult(result) {
    const resultDiv = document.getElementById('dataResult');
    resultDiv.innerHTML = `
        <div class="result-card">
            <h4>📊 처리 결과</h4>
            <p><strong>동작:</strong> ${result.action}</p>
            <p><strong>입력값:</strong> ${result.data.input}</p>
            <p><strong>결과값:</strong> ${result.data.result}</p>
            <p><strong>메시지:</strong> ${result.data.message}</p>
            <p><strong>처리 시간:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
        </div>
    `;
}

function displayUsersList(users) {
    const usersListDiv = document.getElementById('usersList');
    
    if (users.length === 0) {
        usersListDiv.innerHTML = '<p>등록된 사용자가 없습니다.</p>';
        return;
    }
    
    const usersHTML = users.map(user => `
        <div class="user-card">
            <h4>${user.name}</h4>
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>아이디:</strong> ${user.username}</p>
        </div>
    `).join('');
    
    usersListDiv.innerHTML = `
        <h4>👥 전체 사용자 (${users.length}명)</h4>
        ${usersHTML}
    `;
}

function displayServerStatus(data, isOnline) {
    const statusDiv = document.getElementById('serverStatus');
    
    if (isOnline && data) {
        statusDiv.innerHTML = `
            <div class="status-card">
                <h4>✅ 서버 온라인</h4>
                <p><strong>상태:</strong> 정상 작동</p>
                <p><strong>메시지:</strong> ${data.message}</p>
                <p><strong>확인 시간:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                <p><strong>서버 URL:</strong> ${API_BASE_URL}</p>
            </div>
        `;
    } else {
        statusDiv.innerHTML = `
            <div class="status-card error">
                <h4>❌ 서버 오프라인</h4>
                <p><strong>상태:</strong> 연결 불가</p>
                <p><strong>메시지:</strong> 백엔드 서버가 실행되지 않았습니다.</p>
                <p><strong>확인 시간:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>서버 URL:</strong> ${API_BASE_URL}</p>
            </div>
        `;
    }
}

// 메시지 표시 함수
function showMessage(message, type = 'info') {
    const messageArea = document.getElementById('messageArea');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // 클릭하면 메시지 제거
    messageDiv.addEventListener('click', function() {
        messageDiv.remove();
    });
    
    messageArea.appendChild(messageDiv);
    
    // 5초 후 자동으로 메시지 제거
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
    
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
}

// 유틸리티 함수들
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString('ko-KR');
}

// 전역 에러 핸들러
window.addEventListener('error', function(e) {
    console.error('전역 에러:', e.error);
    showMessage('예상치 못한 오류가 발생했습니다.', 'error');
});

// 네트워크 상태 모니터링
window.addEventListener('online', function() {
    showMessage('네트워크 연결이 복구되었습니다.', 'success');
});

window.addEventListener('offline', function() {
    showMessage('네트워크 연결이 끊어졌습니다.', 'error');
});

console.log('🎯 프론트엔드 스크립트가 로드되었습니다.');
console.log('📡 백엔드 서버 URL:', API_BASE_URL);