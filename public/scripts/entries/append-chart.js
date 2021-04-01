const appendChart = (data, newEntry) => {
    $.get( "/templates/entries/chart-window.ejs", chartwindow => {
        let chwin = $(chartwindow);
        $("body").append(chwin);
        $("#popup-background").css("display", "unset");   
        
        $("#popup-background").click((event) => {
            closePopUpOnBackgroundClick(event);
        });

        $("#close-popup").click(() => {
            closePopUpOnButtonClick();
        });

        createSentencePieChart(data, $("#sentence-chart"));

        if(newEntry) {
            for(let i=0; i<data.prediction.length; i++) {
                let emotion = (data.prediction[i].emotion).charAt(0).toUpperCase() + (data.prediction[i].emotion).slice(1);
                let pred = parseFloat((data.prediction[i].percentage).toFixed(2));
                $(".ul-emotions").append(`<li><span class='emotion-list-title'>${emotion}</span> - ${pred} %</li>`)
            }
        } else {
            for(let i=0; i<data.predictions.length; i++) {
                let emotion = (data.predictions[i].emotion).charAt(0).toUpperCase() + (data.predictions[i].emotion).slice(1);
                let pred = parseFloat((data.predictions[i].percentage).toFixed(2));
                $(".ul-emotions").append(`<li><span class='emotion-list-title'>${emotion}</span> - ${pred} %</li>`)
            }
        }
    });
}