const chooseBackgroundColor = (data) => {
    let color = "";
    switch(data) {
        case "joy":
            color = "#ffcf66";
            break;
        case "fear":
            color = "#363b3d";
            break;
        case "sadness":
            color = "#9ce2e6";
            break;
        case "neutral":
            color = "#bdbdbd";
            break;
        case "anger":
            color = "#ba3d2b";
            break;
        default:
            //        
    }

    return color;
}

const createPieChart = (data, box) => {
    const ctx = $(box);
    let emotions = [];
    let percentages = [];
    let colors = [];

    for(let i=0; i<data.length; i++) {
        let color;
        emotions.push(data[i].emotion);
        percentages.push(data[i].percentage);

        color = chooseBackgroundColor(data[i].emotion);
        colors.push(color);
    }

    const pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: emotions,
            datasets: [{
                label: "Emotions",
                data: percentages,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

const createSentencePieChart = (data, box) => {
    const ctx = $(box);
    let emotions = [];
    let percentages = [];
    let colors = [];

    for(let i=0; i<data.predictions.length; i++) {
        let color;
        emotions.push(data.predictions[i].emotion);
        percentages.push(data.predictions[i].percentage);

        color = chooseBackgroundColor(data.predictions[i].emotion);
        colors.push(color);
    }

    const pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: emotions,
            datasets: [{
                label: "Emotions",
                data: percentages,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

const createBarChart = (data, container) => {
    console.log(data)
    let chartLabels = [];
    let barChartData = [];
    for(let pr of data) {
        chartLabels.push(pr.sentenceNo);       
    }

    let class_names = ['joy', 'fear', 'anger', 'sadness', 'neutral'];

    for(let cl of class_names) {  
        let bg;
        let lbl;
        let percentages = [];          
        for(let j = 0; j < data.length; j++) {
            for(let k = 0; k < data[j].predictions.length; k++) {
                if(cl == data[j].predictions[k].emotion) {
                    percentages.push(data[j].predictions[k].percentage);
                    bg = chooseBackgroundColor(data[j].predictions[k].emotion);
                    lbl = data[j].predictions[k].emotion;
                }
            }
        }

        barChartData.push({
            label: lbl,
            backgroundColor: bg,
            data: percentages
        });
    }

    const ctx = $(container);
    const barChart  = new Chart(ctx, {
        type: "bar",
        data: {
            labels: chartLabels,
            datasets: barChartData
        },
        options: {
            title: {
                display: true,
                text: "Bar Chart - Sentences"
            },
            tooltips: {
                mode: "index",
                intersect: false
            },
            legend: {
                display: false
            },
            responsive: true,
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            },
            onClick: function(event, array) {
                // Index of a given bar
                let ind = array[0]._index;
                let bardata = data[ind];
                appendChart(bardata, false);
            }
        }
    });
}

$(document).ready(() => {
    createPieChart(JSON.parse(mainpred), $("#piechart"));
    createBarChart(JSON.parse(sentencespred), $("#sentenceschart"));
});