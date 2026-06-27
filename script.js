// --- DỮ LIỆU GIẢ LẬP VÀ BIẾN TOÀN CỤC ---
const mockDatabase = [
    { username: 'admin', password: '123', role: 'Admin', name: 'Quản trị viên' },
    { username: 'user1', password: '123', role: 'User', name: 'Học viên 1' }
];

const flashcards = [
    { keyword: "AI", explanation: "Trí tuệ nhân tạo (Artificial Intelligence)." },
    { keyword: "Machine Learning", explanation: "Học máy - Nhánh của AI cho phép hệ thống tự học từ dữ liệu." }
];

const quizData = {
    question: "Đâu là đặc điểm chính của hệ thống AI?",
    options: ["A. Chỉ thực hiện theo lệnh code cứng", "B. Khả năng tự học và thích ứng", "C. Không bao giờ sai", "D. Không cần dữ liệu"],
    correctIndex: 1, explanation: "Hệ thống AI có khả năng tự học từ dữ liệu đầu vào."
};

const mockExams = [
    { id: 1, title: "Mock Exam 1 (Đề thi thử số 1)", questions: [{ qId: "m1_q1", question: "Câu 1: Mục đích chính của AI Testing là gì?", options: ["A. Viết code", "B. Đảm bảo chất lượng hệ thống AI", "C. Thay thế Tester"], correctIndex: 1, explanation: "Đánh giá tính chính xác của mô hình AI." }] }
];

const systemProgressData = [{ name: "Học viên 1", lastChapter: "Chương 2", avgScore: "85%" }, { name: "Học viên 2", lastChapter: "Chương 1", avgScore: "60%" }];
const personalProgressData = { completionRate: 75, averageScore: 8.5 };

let currentFlashcardIndex = 0;
let isViewAsUser = false; // Biến kiểm soát chế độ xem của Admin 

// --- LOGIC ĐĂNG NHẬP & TẠO MENU ---
function handleLogin() {
    const userInp = document.getElementById('username').value;
    const passInp = document.getElementById('password').value;
    const user = mockDatabase.find(u => u.username === userInp && u.password === passInp);
    if (user) { localStorage.setItem('loggedInUser', JSON.stringify(user)); window.location.href = 'dashboard.html'; } 
    else { document.getElementById('login-error').style.display = 'block'; document.getElementById('login-error').textContent = "Sai thông tin!"; }
}

function checkAuth() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser && window.location.pathname.includes('dashboard.html')) { window.location.href = 'login.html'; return; }
    if (loggedInUser && window.location.pathname.includes('dashboard.html')) {
        const user = JSON.parse(loggedInUser);
        document.getElementById('welcome-msg').textContent = `Xin chào, ${user.name} (${user.role})`;
        
        // Tạo các nút riêng cho Admin
        if (user.role === 'Admin') {
            const menu = document.getElementById('sidebar-menu');
            // Tránh tạo trùng lặp nút nếu gọi lại hàm
            if(!document.getElementById('admin-manage-btn')) {
                menu.innerHTML += `<button id="admin-manage-btn" onclick="changeContent('manageUsers')">Quản lý User</button>`;
                menu.innerHTML += `<button id="admin-view-btn" onclick="toggleViewAsUser()" style="color: #f1c40f;">👀 Chế độ: ${isViewAsUser ? 'Học viên' : 'Admin'}</button>`;
            }
        }
    }
}
function handleLogout() { localStorage.removeItem('loggedInUser'); window.location.href = 'login.html'; }

// Bật/Tắt chế độ View as User 
function toggleViewAsUser() {
    isViewAsUser = !isViewAsUser;
    const btn = document.getElementById('admin-view-btn');
    btn.textContent = `👀 Chế độ: ${isViewAsUser ? 'Học viên' : 'Admin'}`;
    changeContent('learning'); // Tải lại trang Học tập để ẩn/hiện các nút Import
}

// --- LOGIC ĐIỀU HƯỚNG ---
function changeContent(menuType) {
    const contentArea = document.getElementById('dynamic-content');
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    
    // Admin chỉ thấy nút chức năng khi không bật View As User 
    const isAdminMode = (user && user.role === 'Admin' && !isViewAsUser);

    if (menuType === 'learning') {
        contentArea.innerHTML = `<h2>Module Học tập</h2><div class="tabs"><button onclick="openTab('theory')">Lý thuyết</button> <button onclick="openTab('flashcard')">Flashcard</button> <button onclick="openTab('exercise')">Bài tập</button></div><div id="tab-content"></div>`;
        openTab('theory'); 
    } else if (menuType === 'mockExam') {
        let adminBtn = isAdminMode ? `<div style="margin-bottom:15px;"><button class="action-btn" onclick="triggerFileUpload()">Tải Excel Import Đề Thi</button></div>` : '';
        let html = `<h2>Module Luyện đề</h2>${adminBtn}<ul style="list-style: none; padding: 0;">`;
        mockExams.forEach((exam, index) => { html += `<li style="margin-bottom: 10px; padding: 15px; background: #ecf0f1; border-radius: 5px; cursor: pointer;" onclick="startMockExam(${index})">📄 ${exam.title}</li>`; });
        contentArea.innerHTML = html + `</ul>`;
    } else if (menuType === 'progress') {
        contentArea.innerHTML = `<h2>Tiến độ học tập</h2><div class="tabs"><button id="dash-btn-personal" onclick="openDashTab('personal')" style="background: #3498db; color: white;">Cá nhân</button> <button id="dash-btn-system" onclick="openDashTab('system')">Hệ thống</button></div><div id="dashboard-content"></div>`;
        openDashTab('personal');
    } else if (menuType === 'manageUsers' && !isViewAsUser) {
        contentArea.innerHTML = `<h2>Quản lý User</h2><p>Chức năng thêm và phân quyền User dành cho Admin.</p>`;
    }
}

// --- LOGIC HỌC TẬP VÀ IMPORT EXCEL ---
function openTab(tabName) {
    const tabContent = document.getElementById('tab-content');
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const isAdminMode = (user.role === 'Admin' && !isViewAsUser);

    if (tabName === 'theory') { 
        let adminBtn = isAdminMode ? `<button class="action-btn" style="margin-bottom: 15px;">+ Upload File PDF/MP4</button>` : '';
        tabContent.innerHTML = `${adminBtn}<h3>Chương 1: Tổng quan AI Testing</h3><ul><li>Bài 1: Khái niệm AI (Video)</li></ul>`; 
    }
    else if (tabName === 'flashcard') { 
        currentFlashcardIndex = 0; 
        // Khi bấm nút này, nó sẽ gọi hàm triggerFileUpload() để mở hộp thoại chọn file của máy tính 
        let adminBtn = isAdminMode ? `<div style="margin-bottom:15px;"><button class="action-btn" onclick="triggerFileUpload()">Import Excel Flashcard</button></div>` : '';
        tabContent.innerHTML = `${adminBtn}<div class="flashcard-container"><div class="flashcard" id="flashcard-element" onclick="flipCard()"><div class="card-face card-front" id="card-front-text"></div><div class="card-face card-back" id="card-back-text"></div></div></div><div class="flashcard-controls"><button onclick="prevCard()">Prev</button> <span id="flashcard-counter"></span> <button onclick="nextCard()">Next</button></div>`; 
        renderFlashcard(); 
    }
    else if (tabName === 'exercise') { 
        let adminBtn = isAdminMode ? `<div style="margin-bottom:15px;"><button class="action-btn" onclick="triggerFileUpload()">Import Excel Bài Tập</button></div>` : '';
        let optionsHTML = quizData.options.map((opt, i) => `<li id="option-box-${i}"><label><input type="radio" name="quiz" onclick="checkAnswer(${i})"> ${opt}</label></li>`).join(''); 
        tabContent.innerHTML = `${adminBtn}<div class="quiz-container"><div class="quiz-question">${quizData.question}</div><ul class="quiz-options">${optionsHTML}</ul><div id="quiz-explanation" class="explanation-box"><strong>Giải thích:</strong> ${quizData.explanation}</div></div>`; 
    }
}

// --- TÍCH HỢP SHEETJS ĐỂ ĐỌC FILE EXCEL CỦA ADMIN ---
// 1. Tạo một thẻ input ẩn để gọi cửa sổ chọn file
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.xlsx, .xls, .csv';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// 2. Kích hoạt cửa sổ chọn file khi bấm nút Import 
function triggerFileUpload() {
    fileInput.click(); 
}

// 3. Xử lý sau khi người dùng chọn file Excel 
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result;
        // Sử dụng thư viện XLSX (SheetJS) để đọc dữ liệu
        const workbook = XLSX.read(data, { type: 'binary' });
        // Lấy tên sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        // Chuyển đổi dữ liệu sheet thành định dạng JSON dễ đọc
        const jsonResult = XLSX.utils.sheet_to_json(worksheet);
        
        alert("Đã đọc file Excel thành công! \nHệ thống phát hiện " + jsonResult.length + " dòng dữ liệu.\n\nTrong thực tế, dữ liệu này sẽ được đẩy xuống Database.");
        console.log("Dữ liệu Excel:", jsonResult);
    };
    reader.readAsBinaryString(file);
    fileInput.value = ""; // Xóa bộ nhớ file cũ
});

// Các hàm phụ trợ được rút gọn
function renderFlashcard() { document.getElementById('flashcard-element').classList.remove('is-flipped'); document.getElementById('card-front-text').textContent = flashcards[currentFlashcardIndex].keyword; document.getElementById('card-back-text').textContent = flashcards[currentFlashcardIndex].explanation; document.getElementById('flashcard-counter').textContent = `${currentFlashcardIndex + 1} / ${flashcards.length}`; }
function flipCard() { document.getElementById('flashcard-element').classList.toggle('is-flipped'); }
function nextCard() { if (currentFlashcardIndex < flashcards.length - 1) { currentFlashcardIndex++; renderFlashcard(); } }
function prevCard() { if (currentFlashcardIndex > 0) { currentFlashcardIndex--; renderFlashcard(); } }
function checkAnswer(selectedIndex) { document.getElementsByName('quiz').forEach(r => r.disabled = true); document.getElementById(`option-box-${selectedIndex}`).classList.add(selectedIndex === quizData.correctIndex ? 'correct' : 'incorrect'); if(selectedIndex !== quizData.correctIndex) document.getElementById(`option-box-${quizData.correctIndex}`).classList.add('correct'); document.getElementById('quiz-explanation').style.display = 'block'; }
function openDashTab(tabName) { const dashContent = document.getElementById('dashboard-content'); const btnPersonal = document.getElementById('dash-btn-personal'); const btnSystem = document.getElementById('dash-btn-system'); if(tabName === 'personal') { btnPersonal.style.background = '#3498db'; btnPersonal.style.color = 'white'; btnSystem.style.background = '#ecf0f1'; btnSystem.style.color = '#2c3e50'; dashContent.innerHTML = `<div style="margin-top: 20px;"><h3>Tỷ lệ hoàn thành</h3><div class="progress-container"><div class="progress-bar" style="width: ${personalProgressData.completionRate}%;">${personalProgressData.completionRate}%</div></div><h3>Điểm trung bình</h3><div class="score-box">${personalProgressData.averageScore} / 10</div></div>`; } else { btnSystem.style.background = '#3498db'; btnSystem.style.color = 'white'; btnPersonal.style.background = '#ecf0f1'; btnPersonal.style.color = '#2c3e50'; dashContent.innerHTML = `<div style="margin-top: 20px;"><table class="data-table"><thead><tr><th>Tên</th><th>Chương</th><th>Điểm</th></tr></thead><tbody>${systemProgressData.map(s => `<tr><td>${s.name}</td><td>${s.lastChapter}</td><td><strong>${s.avgScore}</strong></td></tr>`).join('')}</tbody></table></div>`; } }
function startMockExam(examIndex) { const exam = mockExams[examIndex]; let html = `<h2>${exam.title}</h2><button onclick="changeContent('mockExam')" style="margin-bottom: 20px;">🔙 Quay lại</button>`; exam.questions.forEach((q) => { html += `<div class="quiz-container" style="margin-bottom: 30px;"><div class="quiz-question">${q.question}</div><ul class="quiz-options">${q.options.map((opt, i) => `<li id="mock-${q.qId}-${i}"><label><input type="radio" name="mock-${q.qId}" onclick="checkMock('${q.qId}', ${i}, ${q.correctIndex})">${opt}</label></li>`).join('')}</ul><div id="expl-${q.qId}" class="explanation-box"><strong>Giải thích:</strong> ${q.explanation}</div></div>`; }); document.getElementById('dynamic-content').innerHTML = html; }
function checkMock(qId, selectedIndex, correctIndex) { document.getElementsByName(`mock-${qId}`).forEach(r => r.disabled = true); document.getElementById(`mock-${qId}-${selectedIndex}`).classList.add(selectedIndex === correctIndex ? 'correct' : 'incorrect'); if(selectedIndex !== correctIndex) document.getElementById(`mock-${qId}-${correctIndex}`).classList.add('correct'); document.getElementById(`expl-${qId}`).style.display = 'block'; }

checkAuth();