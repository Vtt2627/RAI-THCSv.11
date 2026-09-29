const GAS_URL = "https://script.google.com/macros/s/AKfycbx_hLCpgHbloB3Sh6abgWnQ9vOpK5EXMiNDJRERL_G-FkK3qqlhOreKhOgeM1IzCGv1/exec";

const STORAGE_KEY = "aiResponsibleResults";

let currentQuestion = 0;
let answers = [];
let assignedCode = null;
let hasSubmitted = false;

const startButton = document.getElementById("startButton");
const quiz = document.getElementById("quiz");
const startSection = document.getElementById("startSection");
const nextButton = document.getElementById("nextButton");
const result = document.getElementById("result");
const scoreResult = document.getElementById("scoreResult");
const attentionResult = document.getElementById("attentionResult");
const recommendationResult = document.getElementById("recommendationResult");
const studentCodeDisplay = document.getElementById("studentCodeDisplay");

function clearPreviousLocalData() {
    localStorage.removeItem(STORAGE_KEY);
}

// Xin mã học sinh ngay khi vào trang
function requestStudentCode() {
    studentCodeDisplay.textContent = "Đang cấp mã học sinh...";
    startButton.disabled = true;

    fetch(GAS_URL + "?action=getCode")
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (!data.code) throw new Error("Không nhận được mã hợp lệ.");
            assignedCode = data.code;

            clearPreviousLocalData();

            studentCodeDisplay.textContent = assignedCode;
            startButton.disabled = false;
        })
        .catch(function(err) {
            console.error("Lỗi khi xin mã học sinh:", err);
            studentCodeDisplay.textContent = "Không thể cấp mã - vui lòng tải lại trang.";
        });
}

if (startButton) {
    startButton.addEventListener("click", function () {
        if (!assignedCode) {
            alert("Hệ thống chưa cấp được mã học sinh. Vui lòng tải lại trang.");
            return;
        }
        quiz.style.display = "block";
        startSection.style.display = "none";
        if (window.RaiBackground) {
            window.RaiBackground.setWarning(false);
        }
        showQuestion();
    });
}

function showQuestion() {
    const q = questions[currentQuestion];
    document.getElementById("questionNumber").textContent = q.id;
    document.getElementById("questionText").textContent = q.question;

    if (currentQuestion === questions.length - 1) {
        nextButton.textContent = "Nộp bài";
    } else {
        nextButton.textContent = "Tiếp tục";
    }

    const options = document.getElementById("options");
    options.innerHTML = "";
    q.options.forEach(function(option, index) {
        options.innerHTML += `
            <label>
                <input type="radio" name="answer" value="${index}">
                ${option}
            </label>
            <br><br>
        `;
    });
}

if (nextButton) {
    nextButton.addEventListener("click", function () {
        const selected = document.querySelector('input[name="answer"]:checked');
        if (!selected) {
            alert("Vui lòng chọn một phương án.");
            return;
        }
        answers[currentQuestion] = Number(selected.value);
        currentQuestion++;

        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            finishQuiz();
        }
    });
}

function calculateScore() {
    let totalScore = 0;
    for (let i = 0; i < questions.length; i++) {
        if (answers[i] === questions[i].answer) {
            totalScore++;
        }
    }
    return totalScore;
}

function analyzeBehaviors() {
    let behaviorResults = {};
    for (let i = 0; i < questions.length; i++) {
        const behavior = questions[i].behavior;
        if (answers[i] === questions[i].answer) {
            behaviorResults[behavior] = 1;
        } else {
            behaviorResults[behavior] = 0;
        }
    }
    return behaviorResults;
}

function getNeedAttention(behaviorResults) {
    let needAttention = [];
    for (const behavior in behaviorResults) {
        if (behaviorResults[behavior] === 0) {
            needAttention.push(behavior);
        }
    }
    return needAttention;
}

function getRecommendations(needAttention) {
    let result = [];
    for (let i = 0; i < needAttention.length; i++) {
        const behavior = needAttention[i];
        result.push({
            behavior: behavior,
            recommendation: recommendations[behavior]
        });
    }
    return result;
}

function saveResult(studentCode, score, average, behaviorResults, needAttention, resultRecommendations) {
    const resultData = {
        studentCode: studentCode,
        attempt: new Date().toLocaleString(),
        score: score,
        totalQuestions: questions.length,
        average: average,
        answers: answers,
        behaviorResults: behaviorResults,
        needAttention: needAttention,
        recommendations: resultRecommendations
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([resultData]));
}

// Gửi kết quả lên Google Sheet - đây là nơi lưu trữ vĩnh viễn, đúng thứ tự mã, không bị
// ảnh hưởng bởi việc xóa dữ liệu trên máy
function sendResultToSheet(studentCode, score, average, needAttention, resultRecommendations) {
    const recommendationsText = resultRecommendations
        .map(function(item) { return item.behavior + ": " + item.recommendation; })
        .join("\n");

    fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
            code: studentCode,
            score: score + "/" + questions.length,
            average: average,
            needAttention: needAttention,
            recommendations: recommendationsText
        })
    })
    .then(function(res) { return res.json(); })
    .catch(function(err) {
        console.error("Lỗi khi gửi kết quả lên Google Sheet:", err);
    });
}

function showResult(score, needAttention, resultRecommendations) {
    quiz.style.display = "none";
    result.style.display = "block";
    scoreResult.textContent = "Điểm của bạn: " + score + "/" + questions.length;

    attentionResult.innerHTML = "";
    recommendationResult.innerHTML = "";

    if (needAttention.length === 0) {
        attentionResult.innerHTML = "<p>Chưa có nội dung cần chú ý trong các tình huống đánh giá.</p>";
    } else {
        needAttention.forEach(function(behavior) {
            attentionResult.innerHTML += "<p>• " + behavior + " – " + behaviors[behavior] + "</p>";
        });
    }

    resultRecommendations.forEach(function(item) {
        recommendationResult.innerHTML += "<p>• " + item.behavior + ": " + item.recommendation + "</p>";
    });

    if (window.RaiBackground) {
        window.RaiBackground.setWarning(score < questions.length / 2);
    }
    if (window.RaiCharts){
        window.RaiCharts.show(assignedCode);
    }
}

function finishQuiz() {
    if (hasSubmitted) return; // chặn nộp trùng nếu bị gọi lại trong cùng phiên
    hasSubmitted = true;

    const score = calculateScore();
    const behaviorResults = analyzeBehaviors();
    const needAttention = getNeedAttention(behaviorResults);
    const resultRecommendations = getRecommendations(needAttention);
    const average = Number(((score / questions.length) * 10).toFixed(2));

    saveResult(assignedCode, score, average, behaviorResults, needAttention, resultRecommendations);
    sendResultToSheet(assignedCode, score, average, needAttention, resultRecommendations);
    showResult(score, needAttention, resultRecommendations);
}

// Xin mã ngay khi trang được tải
requestStudentCode();
