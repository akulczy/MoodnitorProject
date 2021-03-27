// Chart displayed on the main page
$(document).ready(() => {
    let ctx = document.getElementById("usage-graph");
    const lineChart = new Chart(ctx, {
        type: 'scatter',
        data: {            
            datasets: [{
                label: "Number of entries per day",
                data: JSON.parse(dataentries),
                borderColor:"rgba(75, 192, 192, 1)",
                showLine: true
            }]
        },
        options: {
            responsive: true,
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
