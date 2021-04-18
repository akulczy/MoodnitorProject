let emotionChartImg;
let freqChartImg;

const chooseBackgroundColor = (data) => {
    let color = "";
    switch(data) {
        case "Joy":
            color = "#ffcf66";
            break;
        case "Fear":
            color = "#000";
            break;
        case "Sadness":
            color = "#498a9e";
            break;
        case "Neutral":
            color = "#696764";
            break;
        case "Anger":
            color = "#ba3d2b";
            break;
        case "None":
            color = "#8c8c8c";
            break;
        default:
            //        
    }

    return color;
}

const createLineChart = (dataentries) => new Promise((resolve, reject) => {
    let colours = [];
    for(let entry of dataentries) {
        colours.push(chooseBackgroundColor(entry.y));
    }
    const ctx = $("#line-chart");
    const lineChart = new Chart(ctx, {
        type: 'scatter',
        data: {            
            datasets: [{
                label: "Emotional Variations",
                data: dataentries,
                borderColor: colours,
                showLine: false,
                pointRadius: 5
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
                yAxes: [{
                    type: 'category',
                    labels: ['', 'Joy', 'Fear', 'Anger', 'Sadness', 'Neutral', 'None']
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

const validateDateRange = () => {
    if($("#entry-date-from").val() != "" && $("#entry-date-to").val() != "") {
        let dateFrom = new Date($("#entry-date-from").val());
        let dateTo = new Date($("#entry-date-to").val());

        if(dateTo < dateFrom) {
            $("#entry-date-from").val("");
            $("#entry-date-to").val("");

            return alert("Please insert a valid date range");
        }        
    }
}

$("#entry-date-from").change(() => {
    validateDateRange();
});

$("#entry-date-to").change(() => {
    validateDateRange();
});

$(document).ready(() => {
    Promise.all([createLineChart(JSON.parse(dataset)), createActivityLineChart(JSON.parse(freqdata))])
    .then(() => {
        $("#download-btn").click(() => {
            generateReportPDF(emotionChartImg);
        });
    });
});