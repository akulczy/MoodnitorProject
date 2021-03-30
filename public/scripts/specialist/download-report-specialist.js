const generateReportPDF = (emotionChartImg) => {
    let assignedUser = $("#username").text();

    const doc = new jsPDF("p", "mm", "a4");
    let y = 25;

    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.text("User's Journey with the Moodnitor", 105, y, null, null, "center");
    y += 15;

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("Patient's details:", 20, y);
    y += 7;

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(assignedUser, 20, y);
    y += 10;

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("Time period:", 20, y);
    y += 7;

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text($("#time-period").text(), 20, y);
    y += 15;

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("Emotions detected in individual days:", 20, y);
    y += 10;

    let image = new Image();
    image.src = emotionChartImg;
    doc.addImage(image, "PNG", 20, y, 158, 79);
    y += 100;

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("In this time period:", 20, y);
    y += 10;

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text("- User added " + entriesNoPDF + " entries in total.", 20, y);
    y += 10;

    doc.text("- User active " + daysActivePDF + " days in total.", 20, y);
    y += 10;

    doc.text("- On average, user added " + averagePDF + " entries a day.", 20, y);
    y += 15;

    if(mainEmotionsPDF.length > 0) {
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.text("Most often occurring emotions:", 20, y);
        y += 10;

        doc.setFont("times", "normal");
        doc.setFontSize(12);
        for(let em of mainEmotionsPDF) {
            doc.text(" - " + em.emotion + " - " + em.times + " times", 20, y);
            y += 10;
        }
    }
    
    doc.addPage();
    y = 30;
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("User's frequency of usage:", 20, y);
    y += 15;
    let image2 = new Image();
    image2.src = freqChartImg;
    doc.addImage(image2, "PNG", 20, y, 158, 79);
    
    doc.save("report.pdf");
}

