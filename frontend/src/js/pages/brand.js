import {
    get_brand_keyword,
    get_sentiment_analysis,
    get_consumer_perception
} from '../api/api.js';

// Register the datalabels plugin globally
Chart.register(ChartDataLabels);

let chartInstances = {};

// Export individual loading functions for each chart
export async function loadBrandKeywordData(brandName) {
    console.log('Loading brand keyword data:', { brandName });
    await loadBrandKeyword(brandName);
}

export async function loadSentimentAnalysisData(brandName) {
    console.log('Loading sentiment analysis data:', { brandName });
    await loadSentimentAnalysis(brandName);
}

export async function loadConsumerPerceptionData(brandName) {
    console.log('Loading consumer perception data:', { brandName });
    await loadConsumerPerception(brandName);
}

// Load all brand charts sequentially
export async function loadAllBrandData(brandName) {
    console.log('Loading all brand data sequentially...');
    await loadBrandKeyword(brandName);
    await loadSentimentAnalysis(brandName);
    await loadConsumerPerception(brandName);
    console.log('All brand data loaded');
}

// Individual chart loading functions
async function loadBrandKeyword(brandName) {
    const canvasId = 'keywordChart';
    const loadingOverlay = document.getElementById(`loadingOverlay-${canvasId}`);

    if (loadingOverlay) loadingOverlay.classList.add('active');

    try {
        const groupChat = window.getSelectedGroupChats ? window.getSelectedGroupChats() : [];
        const params = { brand_name: brandName };
        if (groupChat && Array.isArray(groupChat) && groupChat.length > 0) {
            params.group_id = groupChat;
        }

        console.log("API Params:", params);

        const data = await get_brand_keyword(params);
        console.log(`Data received for ${canvasId}:`, data);

        if (isValidData(data)) {
            renderChart(canvasId, data, buildKeywordConfig);
        } else {
            const canvas = document.getElementById(canvasId);
            showNoDataMessage(canvas.getContext("2d"), canvas, "No data available");
        }
    } catch (err) {
        console.error(`Error loading ${canvasId}:`, err);
        const canvas = document.getElementById(canvasId);
        showNoDataMessage(canvas.getContext("2d"), canvas, `Error loading ${canvasId}`);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
}

async function loadSentimentAnalysis(brandName) {
    const canvasId = 'sentimentChart';
    const loadingOverlay = document.getElementById(`loadingOverlay-${canvasId}`);

    if (loadingOverlay) loadingOverlay.classList.add('active');

    try {
        const groupChat = window.getSelectedGroupChats ? window.getSelectedGroupChats() : [];
        const params = { brand_name: brandName };
        if (groupChat && Array.isArray(groupChat) && groupChat.length > 0) {
            params.group_id = groupChat;
        }

        console.log("API Params:", params);

        const data = await get_sentiment_analysis(params);
        console.log(`Data received for ${canvasId}:`, data);

        if (isValidData(data)) {
            renderChart(canvasId, data, buildSentimentConfig);
        } else {
            const canvas = document.getElementById(canvasId);
            showNoDataMessage(canvas.getContext("2d"), canvas, "No data available");
        }
    } catch (err) {
        console.error(`Error loading ${canvasId}:`, err);
        const canvas = document.getElementById(canvasId);
        showNoDataMessage(canvas.getContext("2d"), canvas, `Error loading ${canvasId}`);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
}

async function loadConsumerPerception(brandName) {
    const canvasId = 'perceptionChart';
    const loadingOverlay = document.getElementById(`loadingOverlay-${canvasId}`);

    if (loadingOverlay) loadingOverlay.classList.add('active');

    try {
        const groupChat = window.getSelectedGroupChats ? window.getSelectedGroupChats() : [];
        const params = { brand_name: brandName, top_k: 20 };
        if (groupChat && Array.isArray(groupChat) && groupChat.length > 0) {
            params.group_id = groupChat;
        }

        console.log("API Params:", params);

        const data = await get_consumer_perception(params);
        console.log(`Data received for ${canvasId}:`, data);

        if (isValidData(data)) {
            renderChart(canvasId, data, buildPerceptionConfig);
        } else {
            const canvas = document.getElementById(canvasId);
            showNoDataMessage(canvas.getContext("2d"), canvas, "No data available");
        }
    } catch (err) {
        console.error(`Error loading ${canvasId}:`, err);
        const canvas = document.getElementById(canvasId);
        showNoDataMessage(canvas.getContext("2d"), canvas, `Error loading ${canvasId}`);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
}


// Chart Rendering Core
function renderChart(canvasId, data, configBuilder) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    if (!ctx) return console.error(`No context for ${canvasId}`);

    const validData = isValidData(data);
    console.log(`isValidData for ${canvasId}:`, validData, 'Data:', data); // Debug log

    if (!validData) {
        console.warn(`No valid data for ${canvasId}`, data);
        return showNoDataMessage(ctx, canvas, "No data available");
    }

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    try {
        chartInstances[canvasId] = new Chart(ctx, configBuilder(data));
    } catch (err) {
        console.error(`Error creating chart for ${canvasId}:`, err);
        showNoDataMessage(ctx, canvas, "Error creating chart");
    }
}

// ---- CONFIG BUILDERS ----
function buildKeywordConfig(data) {
    return {
        type: "bar",
        data: {
            labels: data.map(d => d.keyword),
            datasets: [{
                label: "Keyword Frequency",
                data: data.map(d => d.count),
                backgroundColor: "#4ab4deff"
            }]
        },
        options: {
            ...baseOptions,
            plugins: {
                ...baseOptions.plugins,
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#9ca3af',
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    formatter: function(value) {
                        return value;
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Keywords",
                        color: "#9ca3af",
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: { color: "#9ca3af" },
                    grid: { color: "#3d4456" }
                },
                y: {
                    title: {
                        display: true,
                        text: "Count",
                        color: "#9ca3af",
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: { color: "#9ca3af" },
                    grid: { color: "#3d4456" }
                }
            }
        }
    };
}

function buildSentimentConfig(data) {
    const percent = data.sentiment_percent.reduce((acc, item) => {
        acc[item.sentiment] = item.value;
        return acc;
    }, {});

    return {
        type: "pie",
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [percent.positive || 0, percent.neutral || 0, percent.negative || 0],
                backgroundColor: ['#72e49cff', '#15b5faff', '#fe8d8dff']
            }]
        },
        options:{
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.2,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#9ca3af' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return label + ': ' + value.toFixed(1) + '%';
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: function(value) {
                        return value.toFixed(1) + '%';
                    }
                }
            }
        }


    };
}

function buildPerceptionConfig(data) {
    console.log('buildPerceptionConfig received:', data); // Debug log

    // Handle different possible data structures
    const words = data.associated_words || data.words || data || [];

    if (!Array.isArray(words) || words.length === 0) {
        console.error('Invalid perception data structure:', data);
        return {
            type: "bar",
            data: { labels: [], datasets: [{ label: "Associated Words", data: [], backgroundColor: "#60a5fa" }] },
            options: { ...baseOptions, indexAxis: 'y' }
        };
    }

    const labels = words.map(w => w.word || w.text || w.label || '');
    const values = words.map(w => w.count || w.frequency || w.value || 0);

    console.log('Perception chart labels:', labels);
    console.log('Perception chart values:', values);

    return {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Associated Words",
                data: values,
                backgroundColor: "#60a5fa"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af' }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#9ca3af',
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    formatter: function(value) {
                        return value;
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Words",
                        color: "#9ca3af",
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: { color: '#9ca3af',
                        rotation: 45,
                        autoSkip: false,
                        font: { size: 10 }
                    },
                    grid: { color: '#3d4456' }
                },
                y: {
                    title: {
                        display: true,
                        text: "Count",
                        color: "#9ca3af",
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        color: '#9ca3af',
                        autoSkip: false,
                        font: { size: 10 }
                    },
                    grid: { color: '#3d4456' }
                }
            }
        }
    };
}

// ---- SHARED CHART OPTIONS ----
const baseOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            labels: { color: '#9ca3af' }
        }
    },
    scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: '#3d4456' } },
        y: { ticks: { color: '#9ca3af' }, grid: { color: '#3d4456' } }
    }
};

// ---- HELPERS ----
function isValidData(data) {
    return Array.isArray(data) ? data.length > 0 :
        data?.sentiment_count?.length > 0 ||
        data?.associated_words?.length > 0;
}

function showNoDataMessage(ctx, canvas, message) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}
