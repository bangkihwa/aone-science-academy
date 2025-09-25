// Data Storage
let students = JSON.parse(localStorage.getItem('students') || '[]');
let classCards = JSON.parse(localStorage.getItem('classCards') || '[]');
let testResults = JSON.parse(localStorage.getItem('testResults') || '[]');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    loadStudents();
    updateDashboard();
    setupEventListeners();
    
    // Set today's date as default
    document.getElementById('test-date').valueAsDate = new Date();
    const now = new Date();
    document.getElementById('class-date').value = now.toISOString().slice(0, 16);
    document.getElementById('report-month').value = now.toISOString().slice(0, 7);
});

// Tab Navigation
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('tab-active'));
            tab.classList.add('tab-active');
            
            // Show corresponding content
            contents.forEach(content => {
                if (content.id === `${targetTab}-tab`) {
                    content.classList.remove('hidden');
                    content.classList.add('fade-in');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Student form
    document.getElementById('student-form').addEventListener('submit', handleStudentSubmit);
    
    // Class form
    document.getElementById('class-form').addEventListener('submit', handleClassSubmit);
    
    // Test form
    document.getElementById('test-form').addEventListener('submit', handleTestSubmit);
    
    // Search and filter
    document.getElementById('student-search').addEventListener('input', filterStudents);
    document.getElementById('grade-filter').addEventListener('change', filterStudents);
}

// Student Management
function handleStudentSubmit(e) {
    e.preventDefault();
    
    const student = {
        id: Date.now().toString(),
        name: document.getElementById('student-name').value,
        grade: document.getElementById('student-grade').value,
        phone: document.getElementById('student-phone').value,
        parentPhone: document.getElementById('parent-phone').value,
        registeredDate: new Date().toISOString().split('T')[0]
    };
    
    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));
    
    loadStudents();
    closeStudentModal();
    document.getElementById('student-form').reset();
    showNotification('학생이 성공적으로 추가되었습니다.');
    updateDashboard();
}

function loadStudents() {
    const tbody = document.getElementById('students-table');
    const testSelect = document.getElementById('test-student');
    const classSelect = document.getElementById('class-student');
    const reportSelect = document.getElementById('report-student');
    
    tbody.innerHTML = '';
    testSelect.innerHTML = '<option value="">학생을 선택하세요</option>';
    classSelect.innerHTML = '<option value="">학생 선택</option>';
    reportSelect.innerHTML = '<option value="">학생 선택</option>';
    
    students.forEach(student => {
        // Table row
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-4 py-3 font-medium">${student.name}</td>
            <td class="px-4 py-3">${student.grade}</td>
            <td class="px-4 py-3">${student.phone}</td>
            <td class="px-4 py-3">${student.registeredDate}</td>
            <td class="px-4 py-3">
                <button onclick="viewStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="deleteStudent('${student.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
        
        // Add to select options
        const option = new Option(student.name, student.id);
        testSelect.add(option.cloneNode(true));
        classSelect.add(option.cloneNode(true));
        reportSelect.add(option.cloneNode(true));
    });
}

function filterStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const gradeFilter = document.getElementById('grade-filter').value;
    const rows = document.getElementById('students-table').getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const grade = row.cells[1].textContent;
        
        const matchesSearch = name.includes(searchTerm);
        const matchesGrade = !gradeFilter || grade.includes(gradeFilter);
        
        row.style.display = matchesSearch && matchesGrade ? '' : 'none';
    });
}

function deleteStudent(id) {
    if (confirm('정말 이 학생을 삭제하시겠습니까?')) {
        students = students.filter(s => s.id !== id);
        localStorage.setItem('students', JSON.stringify(students));
        loadStudents();
        updateDashboard();
        showNotification('학생이 삭제되었습니다.');
    }
}

function viewStudent(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        const studentTests = testResults.filter(t => t.studentId === id);
        const studentClasses = classCards.filter(c => c.studentId === id);
        
        alert(`학생 정보\n\n이름: ${student.name}\n학년: ${student.grade}\n수업 횟수: ${studentClasses.length}\n테스트 횟수: ${studentTests.length}`);
    }
}

// Class Card Management
function handleClassSubmit(e) {
    e.preventDefault();
    
    const classCard = {
        id: Date.now().toString(),
        studentId: document.getElementById('class-student').value,
        date: document.getElementById('class-date').value,
        subject: document.getElementById('class-subject').value,
        content: document.getElementById('class-content').value,
        homework: document.getElementById('class-homework').value,
        notes: document.getElementById('class-notes').value,
        createdAt: new Date().toISOString()
    };
    
    classCards.push(classCard);
    localStorage.setItem('classCards', JSON.stringify(classCards));
    
    loadClassCards();
    closeClassModal();
    document.getElementById('class-form').reset();
    showNotification('수업 카드가 저장되었습니다.');
    updateDashboard();
}

function loadClassCards() {
    const container = document.getElementById('class-cards');
    container.innerHTML = '';
    
    const recentCards = classCards.slice(-9).reverse();
    
    recentCards.forEach(card => {
        const student = students.find(s => s.id === card.studentId);
        const cardDate = new Date(card.date);
        
        const cardEl = document.createElement('div');
        cardEl.className = 'bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition';
        cardEl.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="font-semibold text-lg">${student ? student.name : '알 수 없음'}</h3>
                <span class="text-sm text-gray-500">${cardDate.toLocaleDateString('ko-KR')}</span>
            </div>
            <div class="space-y-2">
                <p class="text-sm"><strong>과목:</strong> ${card.subject}</p>
                <p class="text-sm"><strong>수업 내용:</strong> ${card.content.substring(0, 50)}...</p>
                ${card.homework ? `<p class="text-sm"><strong>과제:</strong> ${card.homework}</p>` : ''}
                ${card.notes ? `<p class="text-sm text-orange-600"><strong>특이사항:</strong> ${card.notes}</p>` : ''}
            </div>
            <button onclick="deleteClassCard('${card.id}')" class="mt-3 text-red-600 hover:text-red-800 text-sm">
                <i class="fas fa-trash mr-1"></i>삭제
            </button>
        `;
        container.appendChild(cardEl);
    });
}

function deleteClassCard(id) {
    if (confirm('이 수업 카드를 삭제하시겠습니까?')) {
        classCards = classCards.filter(c => c.id !== id);
        localStorage.setItem('classCards', JSON.stringify(classCards));
        loadClassCards();
        updateDashboard();
    }
}

// Test Results Management
function handleTestSubmit(e) {
    e.preventDefault();
    
    const testResult = {
        id: Date.now().toString(),
        studentId: document.getElementById('test-student').value,
        type: document.getElementById('test-type').value,
        subject: document.getElementById('test-subject').value,
        score: parseInt(document.getElementById('test-score').value),
        date: document.getElementById('test-date').value,
        memo: document.getElementById('test-memo').value,
        createdAt: new Date().toISOString()
    };
    
    testResults.push(testResult);
    localStorage.setItem('testResults', JSON.stringify(testResults));
    
    loadTestResults();
    document.getElementById('test-form').reset();
    document.getElementById('test-date').valueAsDate = new Date();
    showNotification('평가 결과가 저장되었습니다.');
    updateDashboard();
}

function loadTestResults() {
    const tbody = document.getElementById('tests-table');
    tbody.innerHTML = '';
    
    const recentTests = testResults.slice(-20).reverse();
    
    recentTests.forEach(test => {
        const student = students.find(s => s.id === test.studentId);
        const typeLabels = {
            'test': '테스트',
            'homework': '과제',
            'online': '온라인테스트'
        };
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-4 py-3">${test.date}</td>
            <td class="px-4 py-3 font-medium">${student ? student.name : '-'}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    ${typeLabels[test.type] || test.type}
                </span>
            </td>
            <td class="px-4 py-3">${test.subject}</td>
            <td class="px-4 py-3">
                <span class="font-semibold ${test.score >= 80 ? 'text-green-600' : test.score >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                    ${test.score}점
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">${test.memo || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Report Generation
function generateReport() {
    const studentId = document.getElementById('report-student').value;
    const month = document.getElementById('report-month').value;
    
    if (!studentId || !month) {
        alert('학생과 월을 선택해주세요.');
        return;
    }
    
    const student = students.find(s => s.id === studentId);
    const monthStart = new Date(month + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    
    const monthTests = testResults.filter(t => {
        return t.studentId === studentId &&
               new Date(t.date) >= monthStart &&
               new Date(t.date) <= monthEnd;
    });
    
    const monthClasses = classCards.filter(c => {
        return c.studentId === studentId &&
               new Date(c.date) >= monthStart &&
               new Date(c.date) <= monthEnd;
    });
    
    const reportDetails = document.getElementById('report-details');
    reportDetails.innerHTML = `
        <div class="mb-6">
            <h4 class="text-lg font-semibold mb-2">학생 정보</h4>
            <p><strong>이름:</strong> ${student.name}</p>
            <p><strong>학년:</strong> ${student.grade}</p>
            <p><strong>기간:</strong> ${month}</p>
        </div>
        
        <div class="mb-6">
            <h4 class="text-lg font-semibold mb-2">수업 내역 (${monthClasses.length}회)</h4>
            <div class="space-y-2">
                ${monthClasses.map(c => `
                    <div class="border-l-4 border-purple-500 pl-4">
                        <p class="font-medium">${new Date(c.date).toLocaleDateString('ko-KR')} - ${c.subject}</p>
                        <p class="text-sm text-gray-600">${c.content}</p>
                        ${c.homework ? `<p class="text-sm text-orange-600">과제: ${c.homework}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="mb-6">
            <h4 class="text-lg font-semibold mb-2">평가 결과</h4>
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2 text-left">날짜</th>
                        <th class="px-4 py-2 text-left">과목</th>
                        <th class="px-4 py-2 text-left">유형</th>
                        <th class="px-4 py-2 text-left">점수</th>
                    </tr>
                </thead>
                <tbody>
                    ${monthTests.map(t => `
                        <tr>
                            <td class="px-4 py-2">${t.date}</td>
                            <td class="px-4 py-2">${t.subject}</td>
                            <td class="px-4 py-2">${t.type === 'test' ? '테스트' : t.type === 'homework' ? '과제' : '온라인'}</td>
                            <td class="px-4 py-2">${t.score}점</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${monthTests.length > 0 ? `
                <p class="mt-2 text-sm text-gray-600">
                    평균 점수: ${Math.round(monthTests.reduce((sum, t) => sum + t.score, 0) / monthTests.length)}점
                </p>
            ` : '<p class="text-gray-500">평가 결과가 없습니다.</p>'}
        </div>
        
        <div class="mt-6 pt-6 border-t">
            <p class="text-sm text-gray-500">작성일: ${new Date().toLocaleDateString('ko-KR')}</p>
            <p class="text-sm text-gray-500">목동에이원과학학원</p>
        </div>
    `;
    
    document.getElementById('report-content').classList.remove('hidden');
}

// Dashboard
function updateDashboard() {
    document.getElementById('total-students').textContent = students.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayClasses = classCards.filter(c => c.date.startsWith(today));
    document.getElementById('today-classes').textContent = todayClasses.length;
    
    const pendingHomework = classCards.filter(c => c.homework && c.homework.trim()).length;
    document.getElementById('pending-tasks').textContent = pendingHomework;
    
    if (testResults.length > 0) {
        const avgScore = Math.round(testResults.reduce((sum, t) => sum + t.score, 0) / testResults.length);
        document.getElementById('avg-score').textContent = avgScore;
    }
    
    updateRecentActivities();
    loadClassCards();
    loadTestResults();
}

function updateRecentActivities() {
    const activities = [];
    
    // Add recent students
    students.slice(-3).forEach(s => {
        activities.push({
            type: 'student',
            text: `새 학생 등록: ${s.name} (${s.grade})`,
            date: new Date(s.registeredDate)
        });
    });
    
    // Add recent classes
    classCards.slice(-3).forEach(c => {
        const student = students.find(s => s.id === c.studentId);
        activities.push({
            type: 'class',
            text: `수업 카드 작성: ${student?.name || '알 수 없음'} - ${c.subject}`,
            date: new Date(c.createdAt)
        });
    });
    
    // Add recent tests
    testResults.slice(-3).forEach(t => {
        const student = students.find(s => s.id === t.studentId);
        activities.push({
            type: 'test',
            text: `평가 기록: ${student?.name || '알 수 없음'} - ${t.subject} (${t.score}점)`,
            date: new Date(t.createdAt)
        });
    });
    
    // Sort by date
    activities.sort((a, b) => b.date - a.date);
    
    const container = document.getElementById('recent-activities');
    container.innerHTML = activities.slice(0, 5).map(a => {
        const icon = a.type === 'student' ? 'fa-user-plus' :
                     a.type === 'class' ? 'fa-chalkboard' : 'fa-clipboard-check';
        const color = a.type === 'student' ? 'text-blue-500' :
                      a.type === 'class' ? 'text-purple-500' : 'text-green-500';
        
        return `
            <div class="flex items-center space-x-3">
                <i class="fas ${icon} ${color}"></i>
                <div class="flex-1">
                    <p class="text-sm">${a.text}</p>
                    <p class="text-xs text-gray-400">${a.date.toLocaleDateString('ko-KR')}</p>
                </div>
            </div>
        `;
    }).join('') || '<p class="text-gray-500">최근 활동이 없습니다.</p>';
}

// Modal Functions
function openStudentModal() {
    document.getElementById('student-modal').classList.add('active');
}

function closeStudentModal() {
    document.getElementById('student-modal').classList.remove('active');
}

function openClassModal() {
    document.getElementById('class-modal').classList.add('active');
}

function closeClassModal() {
    document.getElementById('class-modal').classList.remove('active');
}

// Utility Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
    notification.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function printReport() {
    window.print();
}

function exportToPDF() {
    alert('PDF 내보내기 기능은 추가 개발이 필요합니다.');
}

function showSettings() {
    alert('설정 페이지는 추가 개발 예정입니다.');
}

// Export functions for global access
window.openStudentModal = openStudentModal;
window.closeStudentModal = closeStudentModal;
window.openClassModal = openClassModal;
window.closeClassModal = closeClassModal;
window.generateReport = generateReport;
window.printReport = printReport;
window.exportToPDF = exportToPDF;
window.showSettings = showSettings;
window.deleteStudent = deleteStudent;
window.viewStudent = viewStudent;
window.deleteClassCard = deleteClassCard;
window.exportToGoogleSheets = () => {
    if (typeof exportToGoogleSheets !== 'undefined') {
        exportToGoogleSheets();
    }
};