// Google Sheets API Configuration
const GOOGLE_SHEETS_API_KEY = 'YOUR_API_KEY_HERE';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';

// Google API loaded flag
let googleAPILoaded = false;
let gapi = window.gapi;

// Initialize Google Sheets API
function initGoogleSheetsAPI() {
    // Load the Google API client library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = handleClientLoad;
    document.body.appendChild(script);
}

function handleClientLoad() {
    gapi = window.gapi;
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: GOOGLE_SHEETS_API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets'
    }).then(() => {
        googleAPILoaded = true;
        console.log('Google Sheets API 초기화 완료');
    }).catch(error => {
        console.error('Google API 초기화 실패:', error);
        showNotification('Google API 연결 실패. API 키를 확인해주세요.', 'error');
    });
}

// Export data to Google Sheets
function exportToGoogleSheets() {
    if (!googleAPILoaded) {
        // Alternative: Direct form submission to Google Forms
        exportViaGoogleForms();
        return;
    }

    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const classCards = JSON.parse(localStorage.getItem('classCards') || '[]');
    const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');

    // Prepare data for sheets
    const studentData = prepareStudentData(students);
    const classData = prepareClassData(classCards, students);
    const testData = prepareTestData(testResults, students);

    // Create batch update request
    const requests = [
        {
            updateCells: {
                range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    startColumnIndex: 0
                },
                rows: studentData,
                fields: 'userEnteredValue'
            }
        },
        {
            updateCells: {
                range: {
                    sheetId: 1,
                    startRowIndex: 0,
                    startColumnIndex: 0
                },
                rows: classData,
                fields: 'userEnteredValue'
            }
        },
        {
            updateCells: {
                range: {
                    sheetId: 2,
                    startRowIndex: 0,
                    startColumnIndex: 0
                },
                rows: testData,
                fields: 'userEnteredValue'
            }
        }
    ];

    gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
            requests: requests
        }
    }).then(response => {
        console.log('데이터 업로드 성공:', response);
        showNotification('Google Sheets로 데이터가 성공적으로 내보내졌습니다!');
    }).catch(error => {
        console.error('데이터 업로드 실패:', error);
        showNotification('Google Sheets 내보내기 실패. 다시 시도해주세요.', 'error');
    });
}

// Alternative: Export via Google Forms
function exportViaGoogleForms() {
    // Google Forms URL (replace with your actual form URL)
    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
    
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const classCards = JSON.parse(localStorage.getItem('classCards') || '[]');
    const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');

    // Create export data summary
    const exportData = {
        timestamp: new Date().toISOString(),
        totalStudents: students.length,
        totalClasses: classCards.length,
        totalTests: testResults.length,
        students: students,
        classCards: classCards,
        testResults: testResults
    };

    // Create a download link for JSON data
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `aone-academy-data-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    // Show instructions for manual Google Sheets import
    showGoogleSheetsInstructions();
}

// Prepare data for Google Sheets format
function prepareStudentData(students) {
    const headers = ['이름', '학년', '전화번호', '학부모 연락처', '등록일'];
    const rows = [headers.map(h => ({ userEnteredValue: { stringValue: h } }))];
    
    students.forEach(student => {
        rows.push([
            { userEnteredValue: { stringValue: student.name } },
            { userEnteredValue: { stringValue: student.grade } },
            { userEnteredValue: { stringValue: student.phone } },
            { userEnteredValue: { stringValue: student.parentPhone || '' } },
            { userEnteredValue: { stringValue: student.registeredDate } }
        ]);
    });
    
    return rows.map(row => ({ values: row }));
}

function prepareClassData(classCards, students) {
    const headers = ['날짜', '학생', '과목', '수업 내용', '과제', '특이사항'];
    const rows = [headers.map(h => ({ userEnteredValue: { stringValue: h } }))];
    
    classCards.forEach(card => {
        const student = students.find(s => s.id === card.studentId);
        rows.push([
            { userEnteredValue: { stringValue: card.date } },
            { userEnteredValue: { stringValue: student ? student.name : '' } },
            { userEnteredValue: { stringValue: card.subject } },
            { userEnteredValue: { stringValue: card.content } },
            { userEnteredValue: { stringValue: card.homework || '' } },
            { userEnteredValue: { stringValue: card.notes || '' } }
        ]);
    });
    
    return rows.map(row => ({ values: row }));
}

function prepareTestData(testResults, students) {
    const headers = ['날짜', '학생', '유형', '과목', '점수', '메모'];
    const rows = [headers.map(h => ({ userEnteredValue: { stringValue: h } }))];
    
    testResults.forEach(test => {
        const student = students.find(s => s.id === test.studentId);
        const typeLabels = {
            'test': '테스트',
            'homework': '과제',
            'online': '온라인테스트'
        };
        
        rows.push([
            { userEnteredValue: { stringValue: test.date } },
            { userEnteredValue: { stringValue: student ? student.name : '' } },
            { userEnteredValue: { stringValue: typeLabels[test.type] || test.type } },
            { userEnteredValue: { stringValue: test.subject } },
            { userEnteredValue: { numberValue: test.score } },
            { userEnteredValue: { stringValue: test.memo || '' } }
        ]);
    });
    
    return rows.map(row => ({ values: row }));
}

// Show instructions for manual Google Sheets import
function showGoogleSheetsInstructions() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 m-auto max-w-lg">
            <h3 class="text-xl font-bold mb-4">📊 Google Sheets 내보내기 안내</h3>
            <div class="space-y-3">
                <p class="text-gray-700">데이터가 JSON 파일로 다운로드되었습니다.</p>
                <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="font-semibold mb-2">Google Sheets에 업로드하는 방법:</p>
                    <ol class="list-decimal list-inside text-sm space-y-1">
                        <li>Google Sheets 새 문서 생성</li>
                        <li>파일 > 가져오기 메뉴 선택</li>
                        <li>업로드 탭에서 다운로드한 JSON 파일 선택</li>
                        <li>JSON 데이터를 시트로 변환</li>
                    </ol>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <p class="text-sm text-yellow-800">
                        <strong>팁:</strong> Google Apps Script를 사용하면 자동화된 업로드가 가능합니다.
                    </p>
                </div>
            </div>
            <button onclick="this.closest('.modal').remove()" class="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                확인
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Notification helper
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in`;
    notification.innerHTML = `
        <i class="fas ${icon} mr-2"></i>${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleSheetsAPI);
} else {
    initGoogleSheetsAPI();
}

// Export function for global access
window.exportToGoogleSheets = exportToGoogleSheets;