import {
    get_time_compare_frequency,
    get_time_compare_sentiment,
    get_time_compare_share_of_voice
} from '../api/api.js';

// Register the datalabels plugin globally - check if available first
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

let chartInstances = {};

// Brand to category mapping
const brandCategoryMap = {
    'mamypoko': 'diaper',
    'huggies': 'diaper',
    'pampers': 'diaper',
    'drypers': 'diaper',
    'merries': 'diaper',
    'offspring': 'diaper',
    'rascal & friends': 'diaper',
    'homie': 'diaper',
    'hey tiger': 'diaper',
    'nino nana': 'diaper',
    'applecrumby': 'diaper',
    'nan': 'formula milk',
    'lactogen': 'formula milk',
    'friso': 'formula milk',
    'enfamil': 'formula milk',
    'aptamil': 'formula milk',
    's26': 'formula milk',
    'dumex dugro': 'formula milk',
    'karihome': 'formula milk',
    'bellamy organic': 'formula milk',
    'applecrumbly': 'weaning',
    'little blossom': 'weaning',
    'rafferty garden': 'weaning',
    'happy baby organics': 'weaning',
    'heinz baby': 'weaning',
    'only organic': 'weaning',
    'holle': 'weaning',
    'ella kitchen': 'weaning',
    'gerber': 'weaning',
    'mount alvernia': 'hospital',
    'thomson medical centre': 'hospital',
    'mount elizabeth': 'hospital',
    'gleneagles': 'hospital',
    'raffles hospital': 'hospital',
    'national university hospital': 'hospital',
    'kkh': 'hospital',
    'parkway east hospital': 'hospital',
    'singapore general hospital': 'hospital',
    'sengkang general hospital': 'hospital',
    'changi general hospital': 'hospital',
    'johnson': 'diaper'
};

// Export individual loading functions for each chart
export async function loadKeywordComparisonData(brandName, granularity, time1, time2) {
    console.log('Loading keyword comparison data:', { brandName, granularity, time1, time2 });
    await loadKeywordComparison(brandName, granularity, time1, time2);
}

export async function loadSentimentComparisonData(brandName, granularity, time1, time2) {
    console.log('Loading sentiment comparison data:', { brandName, granularity, time1, time2 });
    await loadSentimentComparison(brandName, granularity, time1, time2);
}

export async function loadShareOfVoiceComparisonData(category, granularity, time1, time2) {
    console.log('Loading share of voice comparison data:', { category, granularity, time1, time2 });
    await loadShareOfVoiceComparison(category, granularity, time1, time2);
}

async function loadKeywordComparison(brandName, granularity, time1, time2) {
    const canvasId = 'keywordCompareChart';
    const loadingOverlay = document.getElementById(`loadingOverlay-${canvasId}`);

    if (loadingOverlay) loadingOverlay.classList.add('active');

    try {
        // Get selected group chat
        const groupChat = window.getSelectedGroupChats ? window.getSelectedGroupChats() : [];
        const params = {
            brand_name: brandName,
            granularity: granularity,
            time1: time1,
            time2: time2
        };
        if (groupChat && Array.isArray(groupChat) && groupChat.length > 0) {
            params.group_id = groupChat; // Pass as array, not joined string
        }

        const data = await get_time_compare_frequency(params);

        console.log('Keyword comparison data:', data);

        if (data.error) {
            showNoDataMessage(canvasId, data.error);
            return;
        }

        renderKeywordComparisonChart(canvasId, data, time1, time2);
    } catch (err) {
        console.error('Error loading keyword comparison:', err);
        showNoDataMessage(canvasId, 'Error loading data');
    } finally {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
}

async function loadSentimentComparison(brandName, granularity, time1, time2) {
    const canvasId = 'sentimentCompareChart';
    const loadingOverlay = document.getElementById('loadingOverlay-sentimentCompareChart');

    if (loadingOverlay) loadingOverlay.classList.add('active');

    try {
        // Get selected group chat
        const groupChat = window.getSelectedGroupChats ? window.getSelectedGroupChats() : [];
        const params = {
            brand_name: brandName,
            granularity: granularity,
            time1: time1,
            time2: time2
        };
        if (groupChat && Array.isArray(groupChat) && groupChat.length > 0) {
            params.group_id = groupChat; // Pass as array, not joined string
        }

        const data = await get_time_compare_sentiment(params);

        console.log('Sentiment comparison data:', data);

        if (data.error) {
            showNoDataMessage(canvasId, data.error);
            return;
        }

        renderSentimentComparisonChart(canvasId, data, time1, time2);
    } catch (err) {
        console.error('Error loading sentiment comparison:', err);
        showNoDataMessage(canvasId, 'Error loading data');
    } finally {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
}

async function loadShareOfVoiceComparison(category, granularity, time1, time2) {
    const canvasId = 'shareOfVoiceCompareChart';
    const loadingOverlay = document.getElementById(`loadingOverlay-${canvasId}`);

    if (loadingOverlay) loadingOverlay.classList.add('active');

    try {
        // Get selected group chat
        const groupChat = window.getSelectedGroupChats ? window.getSelectedGroupChats() : [];
        const params = {
            category_name: category,
            granularity: granularity,
            time1: time1,
            time2: time2
        };
        if (groupChat && Array.isArray(groupChat) && groupChat.length > 0) {
            params.group_id = groupChat; // Pass as array, not joined string
        }

        const data = await get_time_compare_share_of_voice(params);

        console.log('Share of voice comparison data:', data);

        if (data.error) {
            showNoDataMessage(canvasId, data.error);
            return;
        }

        renderShareOfVoiceComparisonChart(canvasId, data, time1, time2);
    } catch (err) {
        console.error('Error loading share of voice comparison:', err);
        showNoDataMessage(canvasId, 'Error loading data');
    } finally {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
}

// Chart Rendering Functions
function renderKeywordComparisonChart(canvasId, data, time1, time2) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const compare = data.compare;

    // Extract keyword data from both time periods
    const time1Data = compare[time1] || [];
    const time2Data = compare[time2] || [];

    // Handle error cases
    if (time1Data.error || time2Data.error) {
        showNoDataMessage(canvasId, time1Data.error || time2Data.error);
        return;
    }

    // Combine all keywords from both periods
    const allKeywords = new Set();
    time1Data.forEach(item => allKeywords.add(item.keyword));
    time2Data.forEach(item => allKeywords.add(item.keyword));

    const keywords = Array.from(allKeywords);

    // Create count maps
    const time1Map = Object.fromEntries(time1Data.map(item => [item.keyword, item.count]));
    const time2Map = Object.fromEntries(time2Data.map(item => [item.keyword, item.count]));

    // Prepare datasets
    const dataset1 = keywords.map(kw => time1Map[kw] || 0);
    const dataset2 = keywords.map(kw => time2Map[kw] || 0);

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: keywords,
            datasets: [
                {
                    label: `${time1}`,
                    data: dataset1,
                    backgroundColor: '#4ab4deff'
                },
                {
                    label: `${time2}`,
                    data: dataset2,
                    backgroundColor: '#60a5fa'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#9ca3af' }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#9ca3af',
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    formatter: function(value) {
                        return value > 0 ? value : '';
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Keywords',
                        color: '#9ca3af',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        color: '#9ca3af',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { color: '#3d4456' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Count',
                        color: '#9ca3af',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: { color: '#9ca3af' },
                    grid: { color: '#3d4456' }
                }
            }
        }
    });
}

function renderSentimentComparisonChart(canvasId, data, time1, time2) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const compare = data.compare;

    const time1Data = compare[time1];
    const time2Data = compare[time2];

    // Handle error cases
    if (!time1Data || !time2Data || time1Data.error || time2Data.error) {
        showNoDataMessage(canvasId, time1Data?.error || time2Data?.error || 'No sentiment data');
        return;
    }

    // Extract sentiment percentages for both time periods
    const time1Percent = time1Data.sentiment_percent?.reduce((acc, item) => {
        acc[item.sentiment] = item.value;
        return acc;
    }, {}) || {};

    const time2Percent = time2Data.sentiment_percent?.reduce((acc, item) => {
        acc[item.sentiment] = item.value;
        return acc;
    }, {}) || {};

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [
                {
                    label: `${time1}`,
                    data: [time1Percent.positive || 0, time1Percent.neutral || 0, time1Percent.negative || 0],
                    backgroundColor: '#29b0e5ff',
                    position: 'bottom'
                },
                {
                    label: `${time2}`,
                    data: [time2Percent.positive || 0, time2Percent.neutral || 0, time2Percent.negative || 0],
                    backgroundColor: '#16539eff',
                    position: 'bottom'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            layout: {
                padding: {
                    top:40
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            return label + ': ' + value.toFixed(1) + '%';
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#9ca3af',
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    formatter: function(value) {
                        return value > 0 ? value.toFixed(1) + '%' : '';
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Sentiment',
                        color: '#9ca3af',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: { color: '#9ca3af' },
                    grid: { color: '#3d4456' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Percentage (%)',
                        color: '#9ca3af',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        color: '#9ca3af',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: { color: '#3d4456' }
                }
            }
        }
    });
}

function renderShareOfVoiceComparisonChart(canvasId, data, time1, time2) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const compare = data.compare;

    const time1Data = compare[time1]?.share_of_voice || [];
    const time2Data = compare[time2]?.share_of_voice || [];

    // Handle error cases
    if (compare[time1]?.error || compare[time2]?.error) {
        showNoDataMessage(canvasId, compare[time1]?.error || compare[time2]?.error);
        return;
    }

    // Combine all brands from both periods
    const allBrands = new Set();
    time1Data.forEach(item => allBrands.add(item.brand));
    time2Data.forEach(item => allBrands.add(item.brand));

    const brands = Array.from(allBrands);

    // Create percent maps
    const time1Map = Object.fromEntries(time1Data.map(item => [item.brand, item.percent]));
    const time2Map = Object.fromEntries(time2Data.map(item => [item.brand, item.percent]));

    // Prepare datasets
    const dataset1 = brands.map(b => time1Map[b] || 0);
    const dataset2 = brands.map(b => time2Map[b] || 0);

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: brands,
            datasets: [
                {
                    label: `${time1}`,
                    data: dataset1,
                    backgroundColor: '#4ab4deff'
                },
                {
                    label: `${time2}`,
                    data: dataset2,
                    backgroundColor: '#60a5fa'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#9ca3af' }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#9ca3af',
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    formatter: function(value) {
                        return value > 0 ? value.toFixed(1) + '%' : '';
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Brands',
                        color: '#9ca3af',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        color: '#9ca3af',
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 10 }
                    },
                    grid: { color: '#3d4456' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Share of Voice (%)',
                        color: '#9ca3af',
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        color: '#9ca3af',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: { color: '#3d4456' }
                }
            }
        }
    });
}

function showNoDataMessage(canvasId, message) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
        delete chartInstances[canvasId];
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}
