// Chart displayed on the main page

let ctx = document.getElementById("usage-graph");

let data =  [{
    x: 10,
    y: 20
}, {
    x: 15,
    y: 10
}];

let lineChart = new Chart(ctx, {
    type: 'line',
    data: data
    //options: options
});