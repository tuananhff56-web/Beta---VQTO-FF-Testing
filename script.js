
const BATCH_COST_FIRST = 89;
const BATCH_COST_SUBSEQUENT = 179;
const SINGLE_COST_FIRST = 9;
const SINGLE_COST_SUBSEQUENT = 19;
const SINGLE_THRESHOLD = 6;

const VAR_VALUES = [1, 2, 3, 5, 10];

const runBtn = document.getElementById('runBtn');
if (runBtn) {
    runBtn.addEventListener('click', runSimulation);
}

function runSimulation() {
    const targetBadges = parseInt(document.getElementById('targetBadges').value);
    const simCount = parseInt(document.getElementById('simCount').value) || 10000;
    const p1 = parseFloat(document.getElementById('prob1').value);
    const p2 = parseFloat(document.getElementById('prob2').value);
    const p3 = parseFloat(document.getElementById('prob3').value);
    const p5 = parseFloat(document.getElementById('prob5').value);
    const p10 = parseFloat(document.getElementById('prob10').value);

    // Validate Percentages
    const totalProb = p1 + p2 + p3 + p5 + p10;
    const errorEl = document.getElementById('prob-error');

    if (Math.abs(totalProb - 100) > 0.1) {
        errorEl.textContent = `Tổng tỷ lệ hiện tại là ${totalProb.toFixed(1)}%. Vui lòng điều chỉnh về 100%.`;
        return;
    } else {
        errorEl.textContent = '';
    }

    const weights = [p1, p2, p3, p5, p10];

    // UI Feedback
    const btn = document.getElementById('runBtn');
    const originalText = btn.textContent;
    btn.textContent = "Đang chạy...";
    btn.disabled = true;

    // Run async to not freeze UI
    // Reset & Show Progress UI
    const progressContainer = document.getElementById('progressContainer');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');

    progressContainer.classList.remove('hidden');
    progressContainer.classList.add('active');
    progressBarFill.style.width = '0%';
    progressPercent.textContent = '0%';
    progressText.textContent = 'Loading...';

    // Simulate "loading" effect
    let width = 0;
    const interval = setInterval(() => {
        width += 5;
        if (width > 100) width = 100;
        progressBarFill.style.width = width + '%';
        progressPercent.textContent = width + '%';

        if (width >= 100) {
            clearInterval(interval);

            // Actual Monte Carlo Run
            // Use setTimeout to allow UI to render 100% first
            setTimeout(() => {
                try {
                    const results = monteCarlo(targetBadges, weights, simCount);
                    displayResults(results, simCount);

                    // Update Progress to "Done" state
                    progressText.textContent = `Đã chạy thử ${simCount.toLocaleString()} lần!`;

                    document.getElementById('resultsPanel').classList.remove('hidden');
                    document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });
                } catch (e) {
                    console.error("Simulation error:", e);
                    alert("Đã có lỗi xảy ra khi chạy mô phỏng. Vui lòng kiểm tra console.");
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            }, 200); // Small delay after bar fills
        }
    }, 20); // Loading animation speed
}

function monteCarlo(target, weights, N) {
    // N is passed from runSimulation
    const costs = [];

    for (let i = 0; i < N; i++) {
        costs.push(simulateOneRun(target, weights));
    }

    return calculateStats(costs);
}

function simulateOneRun(target, weights) {
    let currentBadges = 0;
    let batchPulls = 0;
    let singlePulls = 0;

    // Batch Phase
    while (currentBadges < target) {
        let remaining = target - currentBadges;
        if (remaining < SINGLE_THRESHOLD) break;

        currentBadges += simulateBatch(weights);
        batchPulls++;
    }

    // Single Phase
    while (currentBadges < target) {
        currentBadges += simulateSingle(weights);
        singlePulls++;
    }

    // Calculate Cost
    let totalCost = 0;
    if (batchPulls > 0) {
        totalCost += BATCH_COST_FIRST + (batchPulls - 1) * BATCH_COST_SUBSEQUENT;
    }
    if (singlePulls > 0) {
        totalCost += SINGLE_COST_FIRST + (singlePulls - 1) * SINGLE_COST_SUBSEQUENT;
    }
    return totalCost;
}

function simulateBatch(weights) {
    // Fixed part
    let badges = 6;

    // Variable part
    while (true) {
        const items = [];
        for (let i = 0; i < 4; i++) {
            items.push(weightedRandom(VAR_VALUES, weights));
        }

        if (isValidBatch(items)) {
            badges += items.reduce((a, b) => a + b, 0);
            break;
        }
    }
    return badges;
}

function isValidBatch(items) {
    const count10 = items.filter(x => x === 10).length;
    const count5 = items.filter(x => x === 5).length;

    if (count10 > 2) return false;
    if (count5 > 2) return false;
    if (count10 === 2 && count5 > 1) return false;

    // Check [3, 3, 3, 3]
    const count3 = items.filter(x => x === 3).length;
    if (count3 === 4) return false;

    return true;
}

// --- Fantasy Background Particles ---
function initParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 50; // Slightly increased for density with low opacity

    // Clear existing
    container.innerHTML = '';

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const p = document.createElement('div');
    p.classList.add('particle');

    // Random properties
    const size = Math.random() * 5 + 3; // 3px to 8px (Larger)
    const posX = Math.random() * 100; // 0% to 100%
    const delay = Math.random() * -40; // Spread out start times
    const duration = Math.random() * 20 + 20; // 20s to 40s (Very Slow)
    const driftX = (Math.random() - 0.5) * 150 + 'px'; // -75px to 75px sway
    const maxOpacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8 opacity (More visible)

    // Color Palette: Gold (#ffd700), Soft Purple (#c084fc), White (#ffffff)
    const colors = ['#ffd700', '#c084fc', '#ffffff', '#fbbf24'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Apply styles
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${posX}%`;
    p.style.backgroundColor = color;
    p.style.color = color; // For box-shadow currentColor
    p.style.animationDelay = `${delay}s`;
    p.style.animationDuration = `${duration}s`;
    p.style.setProperty('--drift-x', driftX);
    p.style.setProperty('--max-opacity', maxOpacity);

    container.appendChild(p);
}

function simulateSingle(weights) {
    // 60% chance for 1 badge (fixed part equivalent)
    if (Math.random() < 0.6) {
        return 1;
    } else {
        // 40% chance for variable part logic
        return weightedRandom(VAR_VALUES, weights);
    }
}

function weightedRandom(values, weights) {
    let sum = 0;
    const r = Math.random() * 100;
    for (let i = 0; i < values.length; i++) {
        sum += weights[i];
        if (r < sum) return values[i];
    }
    return values[values.length - 1];
}

function calculateStats(costs) {
    costs.sort((a, b) => a - b);
    const sum = costs.reduce((a, b) => a + b, 0);

    return {
        min: costs[0],
        max: costs[costs.length - 1],
        mean: sum / costs.length,
        median: costs[Math.floor(costs.length / 2)],
        p99: costs[Math.floor(costs.length * 0.99)],
        percentiles: {
            10: costs[Math.floor(costs.length * 0.10)],
            25: costs[Math.floor(costs.length * 0.25)],
            50: costs[Math.floor(costs.length * 0.50)],
            75: costs[Math.floor(costs.length * 0.75)],
            90: costs[Math.floor(costs.length * 0.90)]
        }
    };
}

function displayResults(stats, simCount) {
    document.getElementById('meanCost').textContent = Math.round(stats.mean);
    document.getElementById('p99Cost').textContent = stats.p99;
    document.getElementById('minCost').textContent = stats.min;
    document.getElementById('maxCost').textContent = stats.max;

    const pList = document.getElementById('percentilesList');
    pList.innerHTML = '';

    const pKeys = [10, 25, 50, 75, 90];
    const labels = {
        10: "Hên (10%)",
        25: "Hơi hên (25%)",
        50: "Trung bình (50%)",
        75: "Hơi xui (75%)",
        90: "Chắc chắn (90%)"
    };

    pKeys.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${labels[p]}</span> <span>${stats.percentiles[p]} 💎</span>`;
        pList.appendChild(li);
    });

    // Dynamic Insight Message
    const targetBadges = document.getElementById('targetBadges').value;
    const medianCost = stats.median;
    const insightMsg = `Bảng này cho biết thường cần khoảng bao nhiêu KC để đủ ${targetBadges} huy hiệu. <br>
    Ví dụ: khoảng 50% người chơi sẽ cần tầm <strong>${medianCost} 💎</strong> hoặc ít hơn.`;


    document.getElementById('insight-message').innerHTML = insightMsg;

    // Get current probabilities
    const probs = {
        1: document.getElementById('prob1').value,
        2: document.getElementById('prob2').value,
        3: document.getElementById('prob3').value,
        5: document.getElementById('prob5').value,
        10: document.getElementById('prob10').value
    };

    // Save to history
    const historyItem = {
        timestamp: new Date().toISOString(),
        targetBadges: targetBadges,
        medianCost: stats.median,
        p99Cost: stats.p99,
        simCount: simCount,
        probs: probs
    };
    saveHistory(historyItem);
}

// --- History System ---
const HISTORY_KEY = 'gacha_simulation_history_v2'; // Changed key to reset history structure

function loadHistory() {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
}

function saveHistory(result) {
    const history = loadHistory();
    // Add new result to the beginning
    history.unshift(result);
    // Keep only last 50 entries
    if (history.length > 50) history.pop();

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = loadHistory();
    const listEl = document.getElementById('historyList');
    const panelEl = document.getElementById('historyPanel');

    // Only show panel if history exists
    if (history.length > 0) {
        panelEl.classList.remove('hidden');
    } else {
        listEl.innerHTML = '<div class="empty-message">Chưa có dữ liệu lịch sử.</div>';
        return;
    }

    listEl.innerHTML = '';

    history.forEach(item => {
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

        const card = document.createElement('div');
        card.className = 'history-card average';

        // Format probabilities if they exist
        let probString = '';
        if (item.probs) {
            probString = `
            <div style="font-size: 0.8rem; color: #aaa; margin-top: 5px; font-style: italic;">
                Tỷ lệ: 1(${item.probs[1]}%) - 2(${item.probs[2]}%) - 3(${item.probs[3]}%) - 5(${item.probs[5]}%) - 10(${item.probs[10]}%)
            </div>`;
        }

        card.innerHTML = `
            <div class="history-info">
                <span class="history-time">${timeStr}</span>
                <span class="history-badge-target">Mục tiêu: ${item.targetBadges} Huy hiệu</span>
                ${probString}
            </div>
            <div class="history-stats">
                <div class="stat-row">
                    <span class="history-label">Trung bình (50%):</span>
                    <span class="history-cost">${item.medianCost.toLocaleString()} 💎</span>
                </div>
                 <div class="stat-row" style="margin-top:2px">
                    
                </div>
            </div>
            
        `;
        listEl.appendChild(card);
    });
}


// --- Modal Logic ---
function showClearModal() {
    document.getElementById('confirmationModal').classList.remove('hidden');
}

function hideClearModal() {
    document.getElementById('confirmationModal').classList.add('hidden');
}

function confirmClearHistory() {
    localStorage.removeItem(HISTORY_KEY);

    // Update UI
    renderHistory();
    document.getElementById('historyPanel').classList.add('hidden');

    hideClearModal();

    // Optional: Toast notification instead of alert
    // For now, let's just show the modal closed. 
    // Or we can simple use existing alert
    // alert("Đã xóa lịch sử thành công!"); 
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    try {
        const clearBtn = document.getElementById('clearHistoryBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', showClearModal);
        } else {
            console.error("Clear History button not found!");
        }

        // Modal Event Listeners
        const cancelBtn = document.getElementById('cancelDeleteBtn');
        const confirmBtn = document.getElementById('confirmDeleteBtn');

        if (cancelBtn) cancelBtn.addEventListener('click', hideClearModal);
        if (confirmBtn) confirmBtn.addEventListener('click', confirmClearHistory);

        // Close modal on click outside
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) hideClearModal();
            });
        }

        initParticles();
        initSpin(); // Initialize Spin Logic
        renderHistory();
    } catch (e) {
        console.error("Initialization error:", e);
    }
});

// --- Spin Logic (Visual Only Phase 1) ---
function initSpin() {
    const spinOneBtn = document.getElementById('spinOneBtn');
    const spinTenBtn = document.getElementById('spinTenBtn');

    if (spinOneBtn) {
        spinOneBtn.addEventListener('click', () => doSpin(1));
    }
    if (spinTenBtn) {
        spinTenBtn.addEventListener('click', () => doSpin(10));
    }
}

function doSpin(times) {
    const grid = document.querySelector('.honeycomb-grid');
    if (!grid) return;

    // Visual Feedback
    const cells = document.querySelectorAll('.hex-cell:not(.center-cell)');
    let activeIndex = 0;

    // Simple visual cycle
    const interval = setInterval(() => {
        cells.forEach(c => c.classList.remove('active'));
        cells[activeIndex].classList.add('active');
        activeIndex = (activeIndex + 1) % cells.length;
    }, 100);

    // Stop after random time (simulation)
    setTimeout(() => {
        clearInterval(interval);
        cells.forEach(c => c.classList.remove('active'));

        // Show placeholder result
        const resultDiv = document.getElementById('spinResult');
        const rewardSpan = document.getElementById('rewardValue');

        if (resultDiv && rewardSpan) {
            resultDiv.classList.remove('hidden');
            rewardSpan.textContent = times === 1 ? "1 Huy hiệu (Mô phỏng)" : "15 Huy hiệu (Mô phỏng)";
        }
    }, 2000);
}
