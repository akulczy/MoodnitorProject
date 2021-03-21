let userId = $("#uid").val();

$(".notesBtn").click((event) =>{
    displayUserNotesSpecialist(event, userId);
});

$(".addCommentsBtn").click((event) => {
    addNewCommentsToEntrySpecialist(event, userId);
});

$(".commentsBtn").click((event) => {
    updateCommentOfEntrySpecialist(event, userId);
});

// Reseting browsing
$("#reset-btn").click(() => {
    // Reseting all the browsing fields
    $("#entry-title").val("");
    $("#entry-date").val("");
    $("#entry-date-from").val("");
    $("#entry-date-to").val("");

    location.reload();
});

const appendEntries = (entries) => {
    let i = 1;
    // Apending results to the table
    for(let entry of entries) {
        let entryTitle = "";
        if((entry.title).length > 18) {
            entryTitle = (entry.title).slice(0, 17) + "...";
        } else {
            entryTitle = entry.title;
        }

        let entryComment = "";
        if(entry.SpecialistComment != null) {
            entryComment = `<button class="btnGradGreenSm margin-auto commentsBtn" value="${entry.id}">Comments</button>`;
        } else {
            entryComment = `<button class="addCommentsBtn btnNoStyle">
                <img src="/files/plus-icon-btn.png" alt="Button">
                <input type="hidden" class="eid" value="${entry.id}" />
            </button>
            <input type="hidden" class="eid" value="${entry.id}" />`;
        }

        $("#entries-body").append(
            '<tr>' +
                '<input type="hidden" class="enid" value="' + entry.id + '" />' +
                '<input type="hidden" class="uid" value="' + entry.SystemUser.id + '" />' +
                '<td class="e-no"><strong>' + eval(i) + '</strong></td>' +
                '<td class="e-date">' + entry.date + '</td>' +
                '<td class="e-title">' + entryTitle + '</td>' +
                `<td class="e-summary"><a class="linkNoStyle" href="/dashboard/specialist/entries/summary/${entry.id}"><button class="btnGradBlueSm margin-auto">Summary</button></a></td>` +
                `<td class="e-notes"><a class="linkNoStyle" href="/dashboard/specialist/users/edit/${entry.id}"><button class="btnGradPurpleSm margin-auto">Notes</button></a></td>` +
                '<td class="e-comments">' +
                    entryComment +
                '</td>' +
                '<td class="e-pdf">' +
                    '<div class="pdf-btn">' +
                        `<input type="hidden" value="${entry.id}" />` +
                        '<img src="/files/pdf-icon.png" alt="pdf" />' +
                    '</div>' +
                '</td>' +
            '</tr>'                        
        );
        i++;
    }
}

// Browsing methods for Specialist searching entries of an individual, chosen user

// Browsing by entry title
$("#browse-title").click(() => {

    // Current value of the input field
    let titleValue = $("#entry-title").val();

    // The field cannot be left empty
    if(titleValue == "") {
        return alert("Please enter the title.");
    }

    $("#entry-date").val("");
    $("#entry-date-from").val("");
    $("#entry-date-to").val("");

    // Displaying spinner element once the submit button is clicked
    if(!($("#browse-title").hasClass(".activeBtn"))) {
        $("#browse-title").append('<span class="spinner-grow text-light spinner-grow-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span>');
        $("#browse-title").addClass(".activeBtn");
    }

    $.ajax({
        url: "/dashboard/specialist/entries/ind/browse/title",
        method: "POST",
        data: {title: titleValue, userId: userId},
        // Actions depending on the status code in the response
        statusCode: {
            200: (data) => {
                $("#entries-body").empty();
                let entries = data.entries;
                appendEntries(entries);

                $(".spinner-grow").remove();
                $("#browse-title").removeClass(".activeBtn");

                // Disabling or enabling entries on the button click
                $(".disableBtn").click((event) => {
                    disableEntry(event);
                });

                $(".notesBtn").click((event) =>{
                    let userId = $("#uid").val();
                    displayUserNotesSpecialist(event, userId);
                });
                
                $(".addCommentsBtn").click((event) => {
                    let userId = $("#uid").val();
                    addNewCommentsToEntrySpecialist(event, userId);
                });
                
                $(".commentsBtn").click((event) => {
                    let userId = $("#uid").val();
                    updateCommentOfEntrySpecialist(event, userId);
                });

                $(".pdf-btn").click((event) => {
                    downloadPDF(event);
                });
            },
            400: () => {
                $(".spinner-grow").remove();
                $("#browse-title").removeClass(".activeBtn");
                return alert("An error occurred while processing your request. Please try again.");
            }
        }
    });
});

// Browsing by entry date
$("#browse-date").click(() => {

    // Current value of the input field
    let dateValue = $("#entry-date").val();

    // The field cannot be left empty
    if(dateValue == "") {
        return alert("Please choose the date.");
    }

    $("#entry-title").val("");
    $("#entry-date-from").val("");
    $("#entry-date-to").val("");

    // Displaying spinner element once the submit button is clicked
    if(!($("#browse-date").hasClass(".activeBtn"))) {
        $("#browse-date").append('<span class="spinner-grow text-light spinner-grow-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span>');
        $("#browse-date").addClass(".activeBtn");
    }

    $.ajax({
        url: "/dashboard/specialist/entries/ind/browse/date",
        method: "POST",
        data: {date: dateValue, userId: userId},
        // Actions depending on the status code in the response
        statusCode: {
            200: (data) => {
                $("#entries-body").empty();
                let entries = data.entries;
                appendEntries(entries);

                $(".spinner-grow").remove();
                $("#browse-date").removeClass(".activeBtn");

                // Disabling or enabling entries on the button click
                $(".disableBtn").click((event) => {
                    disableEntry(event);
                });

                $(".notesBtn").click((event) =>{
                    let userId = $("#uid").val();
                    displayUserNotesSpecialist(event, userId);
                });
                
                $(".addCommentsBtn").click((event) => {
                    let userId = $("#uid").val();
                    addNewCommentsToEntrySpecialist(event, userId);
                });
                
                $(".commentsBtn").click((event) => {
                    let userId = $("#uid").val();
                    updateCommentOfEntrySpecialist(event, userId);
                });

                $(".pdf-btn").click((event) => {
                    downloadPDF(event);
                });
            },
            400: () => {
                $(".spinner-grow").remove();
                $("#browse-date").removeClass(".activeBtn");
                return alert("An error occurred while processing your request. Please try again.");
            }
        }
    });
});

// Browsing by date range
$("#browse-range").click(() => {

    // Current value of the input field
    let dateFrom = $("#entry-date-from").val();
    let dateTo = $("#entry-date-to").val();

    let rDateFrom = new Date(dateFrom);
    let rDateTo = new Date(dateTo);

    if((rDateFrom > rDateTo)) {
        return alert("Please ensure that the date range which you chose is correct.");
    }

    // The field cannot be left empty
    if(dateFrom == "" && dateTo == "") {
        return alert("Please choose the date range.");
    }

    $("#entry-title").val("");
    $("#entry-date").val("");

    // Displaying spinner element once the submit button is clicked
    if(!($("#browse-range").hasClass(".activeBtn"))) {
        $("#browse-range").append('<span class="spinner-grow text-light spinner-grow-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span>');
        $("#browse-range").addClass(".activeBtn");
    }

    $.ajax({
        url: "/dashboard/specialist/entries/ind/browse/date/range",
        method: "POST",
        data: {dateFrom: dateFrom, dateTo: dateTo, userId: userId},
        // Actions depending on the status code in the response
        statusCode: {
            200: (data) => {
                $("#entries-body").empty();
                let entries = data.entries;
                appendEntries(entries);

                $(".spinner-grow").remove();
                $("#browse-range").removeClass(".activeBtn");

                // Disabling or enabling entries on the button click
                $(".disableBtn").click((event) => {
                    disableEntry(event);
                });

                $(".notesBtn").click((event) =>{
                    let userId = $("#uid").val();
                    displayUserNotesSpecialist(event, userId);
                });
                
                $(".addCommentsBtn").click((event) => {
                    let userId = $("#uid").val();
                    addNewCommentsToEntrySpecialist(event, userId);
                });
                
                $(".commentsBtn").click((event) => {
                    let userId = $("#uid").val();
                    updateCommentOfEntrySpecialist(event, userId);
                });

                $(".pdf-btn").click((event) => {
                    downloadPDF(event);
                });
            },
            400: () => {
                $(".spinner-grow").remove();
                $("#browse-range").removeClass(".activeBtn");
                return alert("An error occurred while processing your request. Please try again.");
            }
        }
    });
});