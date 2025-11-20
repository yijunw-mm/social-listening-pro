// import {
//     get_comparison_consumer_perception
// } from '../api/api.js';

// // Register the datalabels plugin globally - check if available first
// if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
//     Chart.register(ChartDataLabels);
// }

// let chartInstances = {};

// // Category options mapping
// const categoryOptions = [
//     'diaper',
//     'formula milk',
//     'weaning',
//     'hospital'
// ];

// // Export loading function
// export async function loadConsumerPerceptionData(category) {
//     console.log('Loading consumer perception data:', { category });
//     await loadConsumerPerception(category);
// }

// async function loadConsumerPerception(category) {
//     const canvasId = 'consumerPerceptionChart';
//     const loadingOverlay = document.getElementById(`loadingOverlay-${canvasId}`);

//     if (loadingOverlay) loadingOverlay.classList.add('active');

//     try {
//         // Get selected group chat
//         const groupChat = window.getSelectedGroupChats ? window.getSelectedGroupChats() : [];
//         const params = {
//             category_name: category
//         };
//         if (groupChat && Array.isArray(groupChat) && groupChat.length > 0) {
//             params.group_id = groupChat; // Pass as array
//         }

//         const data = await get_comparison_consumer_perception(params);

//         console.log('Consumer perception data:', data);

//         if (data.error) {
//             showNoDataMessage(canvasId, data.error);
//             return;
//         }

//         // Check if data has associated_words (backend returns array directly from api.js)
//         if (!data || !Array.isArray(data) || data.length === 0) {
//             showNoDataMessage(canvasId, 'No consumer perception data available for this category');
//             return;
//         }

//         renderConsumerPerceptionChart(canvasId, data, category);
//     } catch (err) {
//         console.error('Error loading consumer perception:', err);
//         showNoDataMessage(canvasId, 'Error loading data');
//     } finally {
//         if (loadingOverlay) loadingOverlay.classList.remove('active');
//     }
// }

// // Chart Rendering Function
// function renderConsumerPerceptionChart(canvasId, data, category) {
//     const canvas = document.getElementById(canvasId);
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');

//     // Extract words and counts
//     const words = data.map(item => item.word);
//     const counts = data.map(item => item.count);

//     if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

//     chartInstances[canvasId] = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: words,
//             datasets: [{
//                 label: 'Word Frequency',
//                 data: counts,
//                 backgroundColor: '#60a5fa',
//                 borderColor: '#3b82f6',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: true,
//             layout: {
//                 padding: {
//                     top: 40
//                 }
//             },
//             plugins: {
//                 legend: {
//                     position: 'top',
//                     labels: { color: '#9ca3af' }
//                 },
//                 tooltip: {
//                     callbacks: {
//                         label: function(context) {
//                             const label = context.dataset.label || '';
//                             const value = context.parsed.y || 0;
//                             return label + ': ' + value;
//                         }
//                     }
//                 },
//                 datalabels: {
//                     anchor: 'end',
//                     align: 'top',
//                     color: '#9ca3af',
//                     font: {
//                         weight: 'bold',
//                         size: 11
//                     },
//                     formatter: function(value) {
//                         return value > 0 ? value : '';
//                     }
//                 }
//             },
//             scales: {
//                 x: {
//                     title: {
//                         display: true,
//                         text: 'Associated Words',
//                         color: '#9ca3af',
//                         font: { size: 14, weight: 'bold' }
//                     },
//                     ticks: {
//                         color: '#9ca3af',
//                         maxRotation: 45,
//                         minRotation: 45,
//                         font: { size: 10 }
//                     },
//                     grid: { color: '#3d4456' }
//                 },
//                 y: {
//                     title: {
//                         display: true,
//                         text: 'Frequency Count',
//                         color: '#9ca3af',
//                         font: { size: 14, weight: 'bold' }
//                     },
//                     ticks: { color: '#9ca3af' },
//                     grid: { color: '#3d4456' },
//                     beginAtZero: true
//                 }
//             }
//         }
//     });
// }

// function showNoDataMessage(canvasId, message) {
//     const canvas = document.getElementById(canvasId);
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');

//     if (chartInstances[canvasId]) {
//         chartInstances[canvasId].destroy();
//         delete chartInstances[canvasId];
//     }

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.font = "16px sans-serif";
//     ctx.fillStyle = "#9ca3af";
//     ctx.textAlign = "center";
//     ctx.fillText(message, canvas.width / 2, canvas.height / 2);
// }
