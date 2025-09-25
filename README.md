# 목동에이원과학학원 - 학생 관리 시스템

## 프로젝트 소개
목동에이원과학학원의 학생 관리를 위한 웹 기반 시스템입니다.
학생 정보, 수업 카드, 테스트 결과를 관리하고 보고서를 생성할 수 있습니다.

## 🚀 주요 기능

### 학생 관리
- 학생 정보 등록 (이름, 학년, 연락처)
- 학생 목록 조회 및 검색
- 학년별 필터링

### 수업 카드
- 수업 내용 기록
- 과제 내용 추가
- 특이사항 메모

### 평가 관리
- 테스트 점수 입력
- 과제 제출 현황 관리
- 온라인 테스트 결과 기록

### 보고서 생성
- 월별 학생 보고서 자동 생성
- 성적 통계 및 분석
- 인쇄 및 PDF 내보내기

### 데이터 저장
- 로컬 스토리지 기반 데이터 저장
- Google Sheets 연동 지원
- JSON 형식 내보내기/가져오기

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **CSS Framework**: Tailwind CSS
- **Icons**: Font Awesome
- **Storage**: LocalStorage
- **External API**: Google Sheets API (선택적)

## 💻 설치 및 실행

### 방법 1: 로컬에서 직접 실행
1. 프로젝트 폴더로 이동
2. `index.html` 파일을 브라우저에서 열기

### 방법 2: 웹 서버 사용
```bash
# Python을 사용하는 경우
python -m http.server 8000

# Node.js를 사용하는 경우
npx serve
```

## 📊 Google Sheets 연동 설정

### 1. Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Google Sheets API 활성화
4. 사용자 인증 정보 생성 (OAuth 2.0)

### 2. API 키 설정
`js/googleSheets.js` 파일에서 다음 변수들을 업데이트:

```javascript
const GOOGLE_SHEETS_API_KEY = 'YOUR_API_KEY_HERE';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
```

### 3. Google Sheets 구조
스프레드시트에 다음 3개의 시트를 생성:
- **Sheet1**: 학생 정보
- **Sheet2**: 수업 카드
- **Sheet3**: 테스트 결과

## 📖 사용 방법

### 1. 학생 등록
1. "학생 관리" 탭 선택
2. "학생 추가" 버튼 클릭
3. 학생 정보 입력 후 저장

### 2. 수업 카드 작성
1. "수업 카드" 탭 선택
2. "수업 카드 작성" 버튼 클릭
3. 학생 선택 및 수업 내용 입력

### 3. 테스트 결과 입력
1. "평가 입력" 탭 선택
2. 학생과 평가 유형 선택
3. 점수 및 메모 입력

### 4. 보고서 생성
1. "보고서" 탭 선택
2. 학생과 월 선택
3. "보고서 생성" 버튼 클릭

## 💾 데이터 구조

### Student (students)
```javascript
{
  id: "unique_id",
  name: "학생 이름",
  grade: "학년",
  phone: "학생 전화번호",
  parentPhone: "학부모 연락처",
  registeredDate: "YYYY-MM-DD"
}
```

### Class Card (classCards)
```javascript
{
  id: "unique_id",
  studentId: "student_id",
  date: "YYYY-MM-DDTHH:mm",
  subject: "과목",
  content: "수업 내용",
  homework: "과제",
  notes: "특이사항",
  createdAt: "ISO_8601_timestamp"
}
```

### Test Result (testResults)
```javascript
{
  id: "unique_id",
  studentId: "student_id",
  type: "test|homework|online",
  subject: "과목",
  score: 0-100,
  date: "YYYY-MM-DD",
  memo: "메모",
  createdAt: "ISO_8601_timestamp"
}
```

## 🌐 브라우저 호환성
- Chrome (90+)
- Firefox (88+)
- Safari (14+)
- Edge (90+)

## 💡 특징
- **오프라인 우선**: 인터넷 연결 없이도 모든 기능 사용 가능
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **직관적 UI**: 교사들이 쉽게 사용할 수 있는 인터페이스
- **데이터 안전성**: LocalStorage 기반으로 데이터 유실 방지

## 🛡 보안 고려사항
- 중요 데이터는 주기적으로 백업
- Google Sheets 연동 시 API 키 보호
- HTTPS 환경에서 사용 권장

## 📈 향후 개선 계획
- [ ] 모바일 앱 개발 (PWA)
- [ ] 상세 통계 및 차트 기능
- [ ] 알림 및 일정 관리
- [ ] 다중 사용자 및 권한 관리
- [ ] 사진 및 파일 첨부 기능

## 📧 문의
목동에이원과학학원
- 전화: [TBD]
- 이메일: [TBD]

---

© 2025 목동에이원과학학원. All rights reserved.