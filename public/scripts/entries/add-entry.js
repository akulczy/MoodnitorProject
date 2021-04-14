let acceptedMimeTypes = ["image/jpg", "image/png", "image/jpeg", "application/pdf"];
const MAX_FILES = 3;

const checkFilesNo = () => {
    let files = document.getElementById("customFile").files;
    if(files.length > MAX_FILES) {
        document.getElementById("customFile").value = "";
        $(".custom-file-label").html("Choose files...");
        return alert("The maximum number of files is 3.");
    }
}

const checkMimeTypes = () => {
    let files = document.getElementById("customFile").files;

    for(let file of files) {
        if(file != null) {
            if(!(acceptedMimeTypes.includes(file.type))) {
                document.getElementById("customFile").value = "";
                $(".custom-file-label").html("Choose files...");
                return alert("Wrong file type. Please ensure you upload JPG, JPEG, PNG, or PDF files.");
            }
        }
    }
};

$("#customFile").change(() => {
    checkFilesNo();
    checkMimeTypes();
});

let options = {
    modules: {
        toolbar: [
            [{ header: [] }],
            ['bold', 'italic', 'underline', 'link'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean']
        ]
    },
    readOnly: false,
    theme: 'snow',
    placeholder: 'Type in your entry here...'
};

let container = document.getElementById("entry-field");
let editor = new Quill(container, options);

const addNotesToEntry = (entryId) => {
    let notesContent = $("#note-content").val();

    // Displaying spinner element once the submit button is clicked
    if(!($("#save-notes-btn").hasClass(".activeBtn"))) {
        $("#save-notes-btn").append('<span class="spinner-grow text-light spinner-grow-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span>');
        $("#save-notes-btn").addClass(".activeBtn");        

        $.ajax({
            url: "/dashboard/user/entries/add/notes",
            method: "PATCH",
            data: {notes: notesContent, entryId: entryId},
            // Actions depending on the status code in the response
            statusCode: {
                200: () => {
                    // Displaying information that the entry had been added successfully
                    $(".spinner-grow").remove();
                    $("#submitEntryBtn").removeClass(".activeBtn");
                    $(".note-area").empty();
                    $(".note-btn-align").empty();
                    $(".note-area").append('<div class="notetxt">' + notesContent + '</div>');
                    $(".note-btn-align").append('<button class="btnGradPurpleSm margin-auto" id="edit-notes-btn">Edit</button>');

                    $("#edit-notes-btn").click(() => {
                        $(".note-area").empty();
                        $(".note-btn-align").empty();
                        $(".note-area").append('<textarea class="form-control" id="note-content" rows="6" style="resize:none;">' + notesContent + '</textarea>');
                        $(".note-btn-align").append('<button class="btnGradPurpleSm margin-auto" id="save-notes-btn">Save</button>');

                        $("#save-notes-btn").click(() => {
                            if($("#note-content").val() != "") {
                                addNotesToEntry(entryId);
                            } else {
                                alert ("Please fill in the text field.");
                            }
                        });
                    });    
                },
                400: () => {
                    // Displaying an error message
                    $(".spinner-grow").remove();
                    $("#save-notes-btn").removeClass(".activeBtn");
                    alert("An error occurred while processing your request. Please try again.");
                }
            }
        });
    }
}

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

    for(let i=0; i<data.prediction.length; i++) {
        let color;
        emotions.push(data.prediction[i].emotion);
        percentages.push(data.prediction[i].percentage);

        color = chooseBackgroundColor(data.prediction[i].emotion);
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
            for(let k = 0; k < data[j].prediction.length; k++) {
                if(cl == data[j].prediction[k].emotion) {
                    percentages.push(data[j].prediction[k].percentage);
                    bg = chooseBackgroundColor(data[j].prediction[k].emotion);
                    lbl = data[j].prediction[k].emotion;
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
                appendChart(bardata, true);
            }
        }
    });
}

const addEntry = () => {
    let entryContent = editor.getText();
    let entryHtmlContent = $(".ql-editor").first().html();
    let entryTitle = $("#entry-title").val();

    // Entry cannot be submitted if the main field is left empty
    if(entryContent.replace(/\s+/g, "") == "") {
        return alert("Please fill in your entry before submitting.");
    }

    // Apending elements from the form to the FormData object
    let entryData = new FormData();
    entryData.append("entryContent", entryContent);
    entryData.append("entryHtmlContent", entryHtmlContent);
    entryData.append("entryTitle", entryTitle);

    // Appending potential additional files
    entryData.append( 'action','uploadImages');
    jQuery.each($("#customFile")[0].files, function(i, file) {
        entryData.append('addfiles', file);
    });
    
    // Displaying spinner element once the submit button is clicked
    if(!($("#submitEntryBtn").hasClass(".activeBtn"))) {
        $("#submitEntryBtn").append('<span class="spinner-grow text-light spinner-grow-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span>');
        $("#submitEntryBtn").addClass(".activeBtn");
    }

    $.ajax({
        url: "/dashboard/user/entries/add",
        method: "POST",
        data: entryData,
        processData: false,
        contentType: false,
        // Actions depending on the status code in the response
        statusCode: {
            200: (data) => {
                // Displaying information that the entry had been added successfully
                $(".spinner-grow").remove();
                $("#submitEntryBtn").removeClass(".activeBtn");
                $(".main-body").empty();
                let entryId = data.id;
                $.get("/templates/entries/entry-box-success.ejs", template => {
                    let boxTemplate = $(template);
                    boxTemplate.find("#detected-emotion-class").text(data.emotion); 
                    boxTemplate.find("#emotion-inline").text(data.emotion); 

                    createPieChart(data.totalClasses, boxTemplate.find("#chart"));
                    createBarChart(data.predictions, boxTemplate.find("#chart2"));

                    for(let emotion of data.totalClasses) {
                        boxTemplate.find(".detected-main-emotions-list").append(
                            `<li><span class='emotion-list-title'>${(emotion.emotion).charAt(0).toUpperCase() + (emotion.emotion).slice(1)}: </span>${emotion.percentage} %</li>`
                        );
                    }

                    console.log(data.totalClasses)

                    $(".main-body").append(boxTemplate);

                    $("#save-notes-btn").click(() => {
                        if($("#note-content").val() != "") {
                            addNotesToEntry(entryId);
                        } else {
                            alert ("Please fill in the text field.");
                        }
                    });
                });
            },
            400: () => {
                // Displaying an error message
                $(".spinner-grow").remove();
                $("#submitEntryBtn").removeClass(".activeBtn");
                $(".main-body").empty();
                $(".main-body").append(
                    '<div class="entry-cont success-cont">' +
                        '<div class="success-sub">' +
                            '<div class="success-lg">Something went wrong</div>' +
                            '<div class="success-min">An error occurred while processing your entry. Please try again.</div>' +
                            '<div class="success-click"><a class="linkNoStyle" href="/dashboard/user/entries/add"><div class="success-click-style">Add entry</a></div></div>' +
                        '</div>'+
                        '<div class="success-space"></div>' +
                        '<div class="success-sub">' +
                            '<img alt="success-icon" src="/files/entry-error.png" />' +
                        '</div>'+
                    '</div>'
                );
            }
        }
    });
}

$("#submitEntryBtn").click(() => {
    addEntry();
});

