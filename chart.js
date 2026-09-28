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
    const MAX_BARS = 5;         
    const PASS_LINE = 5;      
    const COLOR_OK = "56, 189, 248";
    const COLOR_LOW = "239, 68, 68";
    const COLOR_RADAR_OK = "129, 140, 248";

    Chart.defaults.color = "#cbd5e1";
    Chart.defaults.font.family = "'Inter', sans-serif";

    let scoreChart = null;
    let radarChart = null;

    function loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function getAverage(record) {
        if (typeof record.average === "number") return record.average;
        const total = record.totalQuestions || questions.length;
        return Number(((record.score / total) * 10).toFixed(2));
    }

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

    function legendConfig() {
        return {
            position: "top",
            align: "center",
            labels: {
                color: "#f8fafc",
                font: { size: 11, weight: "500" },
                boxWidth: 14,
                boxHeight: 14,
                padding: 10
            }
        };
    }

    function buildScoreChart() {
        scoreChart = new Chart(scoreCanvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Điểm (thang 10)",
                        data: [],
                        backgroundColor: [],
                        borderColor: [],
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    {
                        label: "Mức tối thiểu (" + PASS_LINE + ")",
                        data: [],
                        type: "line",
                        borderColor: "#f87171",
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: 10,
                        ticks: { stepSize: 2, color: "#94a3b8" },
                        grid: { color: "rgba(255, 255, 255, 0.1)" }
                    },
                    x: {
                        ticks: { color: "#94a3b8" },
                        grid: { display: false }
                    }
                },
                plugins: { legend: legendConfig() }
            }
        });
    }

    function buildRadarChart() {
        radarChart = new Chart(radarCanvas.getContext("2d"), {
            type: "radar",
            data: {
                labels: Object.keys(behaviors),
                datasets: [
                    {
                        label: "Bài vừa làm (%)",
                        data: [],
                        backgroundColor: "rgba(" + COLOR_RADAR_OK + ", 0.4)",
                        borderColor: "rgb(" + COLOR_RADAR_OK + ")",
                        borderWidth: 2,
                        pointBackgroundColor: "#38bdf8"
                    },
                    {
                        label: "TB các lượt trên thiết bị (%)",
                        data: [],
                        backgroundColor: "rgba(56, 189, 248, 0.08)",
                        borderColor: "#38bdf8",
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 2,
                        pointBackgroundColor: "#38bdf8"
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
                    legend: legendConfig(),
                    tooltip: {
                        callbacks: {
                            title: function (items) {
                                return items[0].label;
                            },
                            afterTitle: function (items) {
                                return wrapText(behaviors[items[0].label] || "", 34);
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

        const recent = history.slice(-MAX_BARS);
        const barDataset = scoreChart.data.datasets[0];

        scoreChart.data.labels = recent.map(function (r) { return r.studentCode; });
        barDataset.data = recent.map(getAverage);
        barDataset.backgroundColor = recent.map(function (r) {
            const rgb = getAverage(r) < PASS_LINE ? COLOR_LOW : COLOR_OK;
            const alpha = r.studentCode === currentCode ? 0.9 : 0.45;
            return "rgba(" + rgb + ", " + alpha + ")";
        });
        barDataset.borderColor = recent.map(function (r) {
            return "rgb(" + (getAverage(r) < PASS_LINE ? COLOR_LOW : COLOR_OK) + ")";
        });
        scoreChart.data.datasets[1].data = recent.map(function () { return PASS_LINE; });
        scoreChart.update();

        const codes = Object.keys(behaviors);

        let current = history[history.length - 1];
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].studentCode === currentCode) {
                current = history[i];
                break;
            }
        }

        const currentData = codes.map(function (code) {
            return current.behaviorResults && current.behaviorResults[code] === 1 ? 100 : 0;
        });

        const averageData = codes.map(function (code) {
            let correct = 0;
            history.forEach(function (r) {
                if (r.behaviorResults && r.behaviorResults[code] === 1) correct++;
            });
            return Math.round((correct / history.length) * 100);
        });

        const mainColor = getAverage(current) < PASS_LINE ? COLOR_LOW : COLOR_RADAR_OK;
        const currentDataset = radarChart.data.datasets[0];
        currentDataset.data = currentData;
        currentDataset.backgroundColor = "rgba(" + mainColor + ", 0.4)";
        currentDataset.borderColor = "rgb(" + mainColor + ")";

        radarChart.data.datasets[1].data = averageData;
        radarChart.update();
    }

    function show(currentCode) {
        leftPanel.classList.add("is-visible");
        rightPanel.classList.add("is-visible");

        if (!scoreChart) buildScoreChart();
        if (!radarChart) buildRadarChart();

        refresh(currentCode);
    }

    window.RaiCharts = { show: show };
})();