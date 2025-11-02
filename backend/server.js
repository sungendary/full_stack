const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors()); // 프론트엔드에서 백엔드로 요청할 수 있도록 CORS 허용
app.use(bodyParser.json()); // JSON 형태의 요청 본문을 파싱

// 간단한 사용자 데이터 (실제로는 데이터베이스를 사용해야 함)
const users = [
  { id: 1, username: 'admin', password: '1234', name: '관리자' },
  { id: 2, username: 'user1', password: 'pass1', name: '사용자1' },
  { id: 3, username: 'user2', password: 'pass2', name: '사용자2' },
];

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '백엔드 서버가 정상적으로 동작하고 있습니다!',
    timestamp: new Date().toISOString()
  });
});

// 로그인 API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('로그인 시도:', { username, password });
  
  // 사용자 찾기
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // 로그인 성공
    res.json({
      success: true,
      message: '로그인 성공!',
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } else {
    // 로그인 실패
    res.status(401).json({
      success: false,
      message: '아이디 또는 비밀번호가 잘못되었습니다.'
    });
  }
});

// 사용자 정보 가져오기 API
app.get('/api/users', (req, res) => {
  // 비밀번호 제외하고 사용자 목록 반환
  const safeUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    name: user.name
  }));
  
  res.json({
    success: true,
    users: safeUsers,
    total: safeUsers.length
  });
});

// 간단한 데이터 처리 API (버튼 클릭 시 호출)
app.post('/api/process-data', (req, res) => {
  const { action, data } = req.body;
  
  console.log('데이터 처리 요청:', { action, data });
  
  // 간단한 데이터 처리 시뮬레이션
  let result;
  switch (action) {
    case 'calculate':
      result = {
        input: data,
        result: data * 2,
        message: `입력값 ${data}을(를) 2배로 계산했습니다.`
      };
      break;
    case 'reverse':
      result = {
        input: data,
        result: data.toString().split('').reverse().join(''),
        message: `입력값을 역순으로 변경했습니다.`
      };
      break;
    default:
      result = {
        input: data,
        result: data,
        message: '데이터를 그대로 반환합니다.'
      };
  }
  
  res.json({
    success: true,
    action: action,
    data: result,
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('사용 가능한 API:');
  console.log('- GET  /                  : 서버 상태 확인');
  console.log('- POST /api/login         : 로그인');
  console.log('- GET  /api/users         : 사용자 목록');
  console.log('- POST /api/process-data  : 데이터 처리');
});