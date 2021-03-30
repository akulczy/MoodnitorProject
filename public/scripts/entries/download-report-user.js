const generateReportPDF = (emotionChartImg) => {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 25;

    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.text("Your Journey with the Moodnitor", 105, y, null, null, "center");
    y += 15;

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
    doc.text("- You added" + entriesNoPDF + " entries in total.", 20, y);
    y += 10;

    doc.text("- You were active " + daysActivePDF + " days in total.", 20, y);
    y += 10;

    doc.text("- On average, you added " + average + " entries a day.", 20, y);
    y += 10;

    doc.addPage();
    let image2 = new Image();
    image2.src = freqChartImg;
    doc.addImage(image2, "PNG", 20, y, 158, 79);
    

    doc.save("report.pdf");

}

