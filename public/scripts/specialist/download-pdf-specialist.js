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

createPDF = (entry, chart) => new Promise((resolve, reject) => {
    const doc = new jsPDF("p", "mm", "a4");
    let y;

    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.text(`Date: ${(new Date(entry.date)).toISOString().slice(0,10)}`, 200, 10, null, null, "right");
    doc.text(`Time: ${entry.time.slice(0,5)}`, 200, 15, null, null, "right");
    doc.text(`Author: ${entry.SystemUser.name} ${entry.SystemUser.surname}`, 200, 20, null, null, "right");

    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.text(entry.title, 105, 30, null, null, "center");

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("Entry Content:", 20, 40);

    doc.setFontSize(11);
    doc.setFont("times", "normal");
    let splitContent = doc.splitTextToSize(entry.content, 170);

    doc.text(splitContent, 20, 50)

    // Dimensions after content of an entry is added 
    let dim = doc.getTextDimensions(splitContent);
    y = eval(50 + dim.h + 15);

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("Main Detected Emotion:", 20, y);

    y = eval(y + 10);
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text(entry.UserEntryResult.emotion, 20, y);

    y = y + 10;
    let image = new Image();
    image.src = chart;
    doc.addImage(image, "PNG", 20, y, 158, 79);

    y = y + 15 + 79;
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("Detected Emotions:", 20, y);

    doc.setFontSize(11);
    doc.setFont("times", "normal");

    y = y + 10;
    doc.text(`Joy: ${entry.UserEntryResult.predictions[0].percentage} %`, 20, y);

    y = y + 10;
    doc.text(`Fear: ${entry.UserEntryResult.predictions[1].percentage} %`, 20, y);

    y = y + 10;
    doc.text(`Anger: ${entry.UserEntryResult.predictions[2].percentage} %`, 20, y);

    y = y + 10;
    doc.text(`Sadness: ${entry.UserEntryResult.predictions[3].percentage} %`, 20, y);

    y = y + 10;
    doc.text(`Neutral: ${entry.UserEntryResult.predictions[4].percentage} %`, 20, y);

    doc.save("Entry.pdf");
        
    resolve("Fine");
});

const generateCanvas = (entry) => new Promise((resolve, reject) =>{
    $("body").append("<canvas class='chart-sm' id='chart'></canvas>");
    const ctx = $("#chart");
    let emotions = [];
    let percentages = [];
    let colors = [];

    let data = entry.UserEntryResult.predictions;

    for(let i=0; i<data.length; i++) {
        let color;
        emotions.push(data[i].emotion);
        percentages.push(data[i].percentage);

        color = chooseBackgroundColor(data[i].emotion);
        colors.push(color);
    }

    let c;
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
            responsive: true,
            animation : {
                onComplete : function(){    
                    c = pieChart.toBase64Image();
                    resolve(c);
                }
            },        
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
});

const removeCanvas = () => {
    $("#chart").remove();
}

const downloadPDF = async (event) => {
    let id = $(event.target).parents("tr").find(".enid").val();
    let uid = $(event.target).parents("tr").find(".uid").val();

    if(id == null || uid == null) { return alert("Entry could not be found. Please try again."); }

    $.ajax({
        url: `/dashboard/specialist/entries/fetch/${uid}/${id}`,
        method: "GET",
        data: {},
        statusCode: {
            200: data => {
                let entry = data.entry;
                let individual = data.individual;
                
                generateCanvas(entry, individual)
                .then((result) => {
                    createPDF(entry, result)
                    .then(() => {
                        removeCanvas();
                    })
                });                
            },
            404: () => {
                alert("Entry could not be retrieved. Please try again.");
            },
            400: () => {
                alert("An error occurred while processing your request. Please try again.");
            }
        }
    });
}

$(".pdf-btn").click((event) => {
    downloadPDF(event);
});