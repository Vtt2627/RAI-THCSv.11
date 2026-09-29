(function () {
    "use strict";

    if (typeof Chart === "undefined") {
        console.warn("[charts.js] Không tìm thấy Chart.js — bỏ qua biểu đồ.");
        return;
    }

    const leftPanel = document.getElementById("left-chart-panel");
    const rightPanel = document.getElementById("right-chart-panel");
    const scoreCanvas = document.getElementById("scoreHistoryChart");
    const radarCanvas = document.getElementById("competencyRadarChart");

    if (!leftPanel || !rightPanel || !scoreCanvas || !radarCanvas) {
        console.warn("[charts.js] Thiếu khung biểu đồ trong HTML — bỏ qua biểu đồ.");
        return;
    }

    const STORAGE_KEY = "aiResponsibleResults";
    const MAX_ITEMS = 5;                          
    const TOTAL = questions.length;              
    const PASS_SCORE = TOTAL / 2;                 
    const PASS_MIN = Math.ceil(PASS_SCORE);       

    const COLOR_OK = "56, 189, 248";
    const COLOR_LOW = "239, 68, 68";
    const COLOR_RADAR_OK = "129, 140, 248";
    const POINT_OK = "#4ade80";
    const POINT_LOW = "#f87171";

    Chart.defaults.color = "#cbd5e1";
    Chart.defaults.font.family = "'Inter', sans-serif";

    let scoreChart = null;
    let radarChart = null;
    let shownRecords = [];                       
    function loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    // Điểm thang 
    function getAverage(record) {
        if (typeof record.average === "number") return record.average;
        const total = record.totalQuestions || TOTAL;
        return Number(((record.score / total) * 9).toFixed(2));
    }

    function isLow(record) {
        return record.score < PASS_SCORE;
    }

    function setText(panel, selector, text) {
        const el = panel.querySelector(selector);
        if (el) el.textContent = text;
    }

    // Ngắt dòng văn bản dài cho tooltip
    function wrapText(text, maxLength) {
        const words = text.split(" ");
        const lines = [];
        let line = "";
        words.forEach(function (word) {
            if ((line + " " + word).trim().length > maxLength) {
                lines.push(line);
                line = word;
            } else {
                line = (line + " " + word).trim();
            }
        });
        if (line) lines.push(line);
        return lines;
    }

    const passLinePlugin = {
        id: "passLine",
        afterDatasetsDraw: function (chart) {
            const ctx = chart.ctx;
            const area = chart.chartArea;
            const y = chart.scales.y.getPixelForValue(PASS_SCORE);

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "#f87171";
            ctx.lineWidth = 2;
            ctx.moveTo(area.left, y);
            ctx.lineTo(area.right, y);
            ctx.stroke();
            ctx.restore();
        }
    };

    function buildScoreChart() {
        scoreChart = new Chart(scoreCanvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Số câu đúng",
                        data: [],
                        backgroundColor: [],
                        borderColor: [],
                        borderWidth: 2,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: TOTAL,
                        ticks: { stepSize: 1, precision: 0, color: "#94a3b8" },
                        grid: { color: "rgba(255, 255, 255, 0.1)" },
                        title: { display: true, text: "Số câu đúng", color: "#94a3b8" }
                    },
                    x: {
                        ticks: { color: "#94a3b8" },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (item) {
                                const r = shownRecords[item.dataIndex];
                                const total = r.totalQuestions || TOTAL;
                                return r.score + "/" + total + " câu đúng (" + getAverage(r).toFixed(2) + "/10)";
                            },
                            afterLabel: function (item) {
                                const r = shownRecords[item.dataIndex];
                                return r.attempt || "";
                            }
                        }
                    }
                }
            },
            plugins: [passLinePlugin]
        });
    }

    function buildRadarChart() {
        radarChart = new Chart(radarCanvas.getContext("2d"), {
            type: "radar",
            data: {
                labels: Object.keys(behaviors),
                datasets: [
                    {
                        label: "Bài vừa làm",
                        data: [],
                        backgroundColor: "rgba(" + COLOR_RADAR_OK + ", 0.4)",
                        borderColor: "rgb(" + COLOR_RADAR_OK + ")",
                        borderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: []
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { display: false, stepSize: 25 },
                        angleLines: { color: "rgba(255, 255, 255, 0.2)" },
                        grid: { color: "rgba(255, 255, 255, 0.2)" },
                        pointLabels: {
                            color: "#f8fafc",
                            font: { size: 12, weight: "bold" }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: "top",
                        align: "center",
                        labels: {
                            color: "#f8fafc",
                            font: { size: 11, weight: "500" },
                            boxWidth: 14,
                            boxHeight: 14,
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function (items) {
                                return items[0].label;
                            },
                            afterTitle: function (items) {
                                return wrapText(behaviors[items[0].label] || "", 34);
                            },
                            label: function (item) {
                                if (item.datasetIndex === 0) {
                                    return item.parsed.r === 100
                                        ? "Bài vừa làm: làm đúng"
                                        : "Bài vừa làm: cần chú ý";
                                }
                                return item.dataset.label + ": " + item.parsed.r + "% làm đúng";
                            }
                        }
                    }
                }
            }
        });
    }

    function refresh(currentCode) {
        const history = loadHistory();
        if (history.length === 0) return;

        // Cả hai biểu đồ dùng chung một phạm vi: MAX_ITEMS bài gần nhất
        const recent = history.slice(-MAX_ITEMS);
        shownRecords = recent;

        // Biểu đồ cột trái
        const barDataset = scoreChart.data.datasets[0];
        scoreChart.data.labels = recent.map(function (r) { return r.studentCode; });
        barDataset.data = recent.map(function (r) { return r.score; });
        barDataset.backgroundColor = recent.map(function (r) {
            const rgb = isLow(r) ? COLOR_LOW : COLOR_OK;
            const alpha = r.studentCode === currentCode ? 0.9 : 0.45;   // bài vừa làm đậm hơn
            return "rgba(" + rgb + ", " + alpha + ")";
        });
        barDataset.borderColor = recent.map(function (r) {
            return "rgb(" + (isLow(r) ? COLOR_LOW : COLOR_OK) + ")";
        });
        scoreChart.update();

        //  Biểu đồ mạng nhện phải
        const codes = Object.keys(behaviors);

        let current = recent[recent.length - 1];
        for (let i = recent.length - 1; i >= 0; i--) {
            if (recent[i].studentCode === currentCode) {
                current = recent[i];
                break;
            }
        }

        const currentData = codes.map(function (code) {
            return current.behaviorResults && current.behaviorResults[code] === 1 ? 100 : 0;
        });

        const mainColor = isLow(current) ? COLOR_LOW : COLOR_RADAR_OK;
        const currentDataset = radarChart.data.datasets[0];
        currentDataset.data = currentData;
        currentDataset.backgroundColor = "rgba(" + mainColor + ", 0.4)";
        currentDataset.borderColor = "rgb(" + mainColor + ")";
        currentDataset.pointBackgroundColor = currentData.map(function (v) {
            return v === 100 ? POINT_OK : POINT_LOW;
        });
        currentDataset.pointBorderColor = currentDataset.pointBackgroundColor;
        const datasets = radarChart.data.datasets;
        datasets.length = 1;
        if (recent.length > 1) {
            const averageData = codes.map(function (code) {
                let correct = 0;
                recent.forEach(function (r) {
                    if (r.behaviorResults && r.behaviorResults[code] === 1) correct++;
                });
                return Math.round((correct / recent.length) * 100);
            });

            datasets.push({
                label: "TB " + recent.length + " bài gần nhất",
                data: averageData,
                backgroundColor: "rgba(56, 189, 248, 0.08)",
                borderColor: "#38bdf8",
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 2,
                pointBackgroundColor: "#38bdf8"
            });
        }
        radarChart.update();

        // Tiêu đề & chú thích cho đúng bản chất dữ liệu 
        setText(leftPanel, "h4", "📊 ĐIỂM CÁC BÀI GẦN ĐÂY");
        setText(
            leftPanel,
            ".chart-note",
            "Đường đỏ nét đứt: mức đạt tối thiểu (từ " + PASS_MIN + "/" + TOTAL + " câu). " +
            "Hiển thị " + recent.length + " bài gần nhất trên thiết bị này."
        );
        setText(
            rightPanel,
            ".chart-note",
            "Chấm xanh: làm đúng · Chấm đỏ: cần chú ý (khớp mục \"Các nội dung cần chú ý\"). Rê chuột để xem mô tả."
        );
    }

    function show(currentCode) {
        // Hiện khung TRƯỚC rồi mới tạo biểu đồ
        leftPanel.classList.add("is-visible");
        rightPanel.classList.add("is-visible");

        if (!scoreChart) buildScoreChart();
        if (!radarChart) buildRadarChart();

        refresh(currentCode);
    }

    window.RaiCharts = { show: show };
})();
