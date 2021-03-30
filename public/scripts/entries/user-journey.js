let emotionChartImg;
let freqChartImg;

const createLineChart = (dataentries) => new Promise((resolve, reject) => {
    const ctx = $("#line-chart");
    const lineChart = new Chart(ctx, {
        type: 'scatter',
        labels: [0, 1, 2, 3],
        data: {            
            datasets: [{
                label: "Emotional Variations",
                data: dataentries,
                borderColor:"rgba(75, 192, 192, 1)",
                showLine: true,
            }]
        },
        options: {
            responsive: true,
            animation : {
                onComplete : function(){    
                    emotionChartImg = lineChart.toBase64Image(); 
                    resolve("Chart Loaded");                   
                }
            },
            tooltips: {
                mode: 'index',
                intersect: true,
                callbacks: {
                    label: function (tooltipItem, data) {
                        let x = data.datasets[0].data[tooltipItem.index].x;
                        let y = data.datasets[0].data[tooltipItem.index].y;
                        return x + " - " + y;
                    }
                }
            },
            scales: {
                xAxes: [{
                    type: 'category',
                    position: 'bottom',
                    labels: JSON.parse(datalabels)
                }],
                /*yAxes: [{
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        min: 0,
                        beginAtZero: true,
                        max: 5
                    }
                }],*/
                yAxes: [{
                    type: 'category',
                    labels: ['Joy', 'Fear', 'Anger', 'Sadness', 'Neutral', 'None']
                }]
            }
        }
    }
    );
});

const createActivityLineChart = (dataentries) => new Promise((resolve, reject) => {
    const ctx = document.getElementById("activity-chart");
    const lineChart = new Chart(ctx, {
        type: 'scatter',
        data: {            
            datasets: [{
                label: "Number of entries per day",
                data: dataentries,
                borderColor:"#3053a0",
                showLine: true
            }]
        },
        options: {
            responsive: true,
            animation : {
                onComplete : function(){    
                    freqChartImg = lineChart.toBase64Image(); 
                    resolve("Chart Loaded");                   
                }
            },
            tooltips: {
                mode: 'index',
                intersect: true,
                callbacks: {
                    label: function (tooltipItem, data) {
                        let x = data.datasets[0].data[tooltipItem.index].x;
                        let y = data.datasets[0].data[tooltipItem.index].y;
                        return x + " - " + y;
                    }
                }
            },
            scales: {
                xAxes: [{
                    type: 'category',
                    position: 'bottom',
                    labels: JSON.parse(datalabels)
                }],
                yAxes: [{ ticks: { min: 0, stepSize: 1 } }]
            }
        }
    });
});

$(document).ready(() => {
    Promise.all([createLineChart(JSON.parse(dataset)), createActivityLineChart(JSON.parse(freqdata))])
    .then(() => {
        $("#download-btn").click(() => {
            generateReportPDF(emotionChartImg);
        });
    });
});