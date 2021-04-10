const appendEntries = (entries, individual) => {
    let i = 1;
    // Apending results to the table
    for(let entry of entries) {
        let entryTitle = "";
        if((entry.title).length > 18) {
            entryTitle = (entry.title).slice(0, 17) + "...";
        } else {
            entryTitle = entry.title;
        }

        let link = "";
        if(individual == true) {
            link = '<td class="e-summary"><a class="linkNoStyle" href="/dashboard/user/entries/ind/' + entry.id +'"><button class="btnGradBlueSm margin-auto">Overview</button></a></td>';
        } else {
            link = '<td class="e-summary"><a class="linkNoStyle" href="/dashboard/user/entries/sys/' + entry.id +'"><button class="btnGradBlueSm margin-auto">Overview</button></a></td>';
        }

        let addNotesBtn = "";
        if((entry.usernotes == "") || (entry.usernotes == null)) {
            addNotesBtn = `<button class="addNotesBtn btnNoStyle">
                <img src="/files/plus-icon-btn-2.png" alt="Button">
                <input type="hidden" class="eid" value="${entry.id}" />
            </button>
            <input type="hidden" class="eid" value="${entry.id}" />`;
        } else {
            addNotesBtn = `<button class="btnGradPurpleSm margin-auto notesBtn" value="${entry.id}">Notes</button>`;
        }

        $("#entries-body").append(
            '<tr>' +                            
                '<input type="hidden" class="enid" value="' + entry.id + '" />' +
                '<td class="e-no"><strong>' + eval(i) + '</strong></td>' +
                '<td class="e-date">' + entry.date + '</td>' +
                '<td class="e-title">' + entryTitle + '</td>' +
                link +
                `<td>` +
                addNotesBtn +
                `</td>` +
                '<td class="e-disable">' +
                    `<button class="btnGradDarkSm margin-auto disableBtn" value="${entry.id}">` +
                        'Archive' +
                    '</button>' +
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

const appendDisabledEntries = (entries, individual) => {
    let i = 1;
    // Apending results to the table
    for(let entry of entries) {
        let entryTitle = "";
        if((entry.title).length > 18) {
            entryTitle = (entry.title).slice(0, 17) + "...";
        } else {
            entryTitle = entry.title;
        }

        let link = "";
        if(individual == true) {
            link = '<td class="e-summary"><a class="linkNoStyle" href="/dashboard/user/entries/ind/' + entry.id +'"><button class="btnGradBlueSm margin-auto">Overview</button></a></td>';
        } else {
            link = '<td class="e-summary"><a class="linkNoStyle" href="/dashboard/user/entries/sys/' + entry.id +'"><button class="btnGradBlueSm margin-auto">Overview</button></a></td>';
        }

        let addNotesBtn = "";
        if((entry.usernotes == "") || (entry.usernotes == null)) {
            addNotesBtn = `<button class="addNotesBtn btnNoStyle">
                <img src="/files/plus-icon-btn-2.png" alt="Button">
                <input type="hidden" class="eid" value="${entry.id}" />
            </button>
            <input type="hidden" class="eid" value="${entry.id}" />`;
        } else {
            addNotesBtn = `<button class="btnGradPurpleSm margin-auto notesBtn" value="${entry.id}">Notes</button>`;
        }

        $("#entries-body").append(
            '<tr class="disabledTr">' +
                '<input type="hidden" class="enid" value="' + entry.id + '" />' +
                '<td class="e-no"><strong>' + eval(i) + '</strong></td>' +
                '<td class="e-date">' + entry.date + '</td>' +
                '<td class="e-title">' + entryTitle + '</td>' +
                link +
                `<td>` +
                addNotesBtn +
                `</td>` +
                '<td class="e-disable">' +
                    `<button class="btnGradDarkSm margin-auto disableBtn" value="${entry.id}">` +
                        'Unarchive' +
                    '</button>' +
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

const disableEntry = (event) => {
    // Retrieving id of the entry to be disabled from the button value
    let id = null;
    let pressedTr = $(event.target).closest("tr");

    try {
        id = parseInt($(event.target).val());
    } catch(error) {
        return alert("An error occurred when processing your request. Please try again.");
    }

    if(id === null) { return  alert("An error occurred when processing your request. Please try again."); }

    $.ajax({
        url: "/dashboard/user/entries/disable",
        method: "PATCH",
        data: {entryId: id},
        // Actions depending on the status code in the response
        statusCode: {
            200: (data) => {
                if(data.disabled) {
                    alert("Entry archived successfully. It will be moved into the Archived Entries section.");
                    pressedTr.addClass("disabledTr");
                    $(event.target).text("Unarchive");
                } else {
                    alert("Entry unarchived successfully.");
                    pressedTr.removeClass("disabledTr");
                    $(event.target).text("Archive");
                }
            },
            400: () => {
                alert("An error occurred while processing your request. Please try again.");
            }
        }
    });
}

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
        url: "/dashboard/user/entries/browse/title",
        method: "POST",
        data: {title: titleValue},
        // Actions depending on the status code in the response
        statusCode: {
            200: (data) => {
                $("#entries-body").empty();
                let entries = data.entries;
                let individual = data.individual;
                appendEntries(entries, individual);

                $(".spinner-grow").remove();
                $("#browse-title").removeClass(".activeBtn");

                // Disabling or enabling entries on the button click
                $(".disableBtn").click((event) => {
                    disableEntry(event);
                });

                $(".addNotesBtn").click((event) => {
                    addNewNotesToEntry(event);
                });
                
                $(".notesBtn").click((event) => {
                    updateNotesOfEntry(event);
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
        url: "/dashboard/user/entries/browse/date",
        method: "POST",
        data: {date: dateValue},
        // Actions depending on the status code in the response
        statusCode: {
            200: (data) => {
                $("#entries-body").empty();
                let entries = data.entries;
                let individual = data.individual;
                appendEntries(entries, individual);

                $(".spinner-grow").remove();
                $("#browse-date").removeClass(".activeBtn");

                // Disabling or enabling entries on the button click
                $(".disableBtn").click((event) => {
                    disableEntry(event);
                });

                $(".addNotesBtn").click((event) => {
                    addNewNotesToEntry(event);
                });
                
                $(".notesBtn").click((event) => {
                    updateNotesOfEntry(event);
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
        url: "/dashboard/user/entries/browse/date/range",
        method: "POST",
        data: {dateFrom: dateFrom, dateTo: dateTo},
        // Actions depending on the status code in the response
        statusCode: {
            200: (data) => {
                $("#entries-body").empty();
                let entries = data.entries;
                let individual = data.individual;
                appendEntries(entries, individual);

                $(".spinner-grow").remove();
                $("#browse-range").removeClass(".activeBtn");

                // Disabling or enabling entries on the button click
                $(".disableBtn").click((event) => {
                    disableEntry(event);
                });

                $(".addNotesBtn").click((event) => {
                    addNewNotesToEntry(event);
                });
                
                $(".notesBtn").click((event) => {
                    updateNotesOfEntry(event);
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

// Disabling or enabling entries on the button click
$(".disableBtn").click((event) => {
    disableEntry(event);
});

// Browsing disabled entries by date
$("#browse-disabled-date").click(() => {

    // Current value of the input field
    let dateValue = $("#entry-date").val();

    // The field cannot be left empty
    if(dateValue == "") {
        return alert("Please choose the date.");
    }

    // Displaying spinner element once the submit button is clicked
    if(!($("#browse-disabled-date").hasClass(".activeBtn"))) {
        $("#browse-disabled-date").append('<span class="spinner-grow text-light spinner-grow-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span>');
        $("#browse-disabled-date").addClass(".activeBtn");
    }

    $.ajax({
        url: "/dashboard/user/entries/archive/browse",
        method: "POST",
        data: {date: dateValue},
        // Actions depending on the status code in the response
        statusCode: {
            200: (data) => {
                $("#entries-body").empty();
                let entries = data.entries;
                let individual = data.individual;
                appendDisabledEntries(entries, individual);

                $(".spinner-grow").remove();
                $("#browse-disabled-date").removeClass(".activeBtn");

                // Disabling or enabling entries on the button click
                $(".disableBtn").click((event) => {
                    disableEntry(event);
                });

                $(".addNotesBtn").click((event) => {
                    addNewNotesToEntry(event);
                });
                
                $(".notesBtn").click((event) => {
                    updateNotesOfEntry(event);
                });
                
                $(".pdf-btn").click((event) => {
                    downloadPDF(event);
                });
            },
            400: () => {
                $(".spinner-grow").remove();
                $("#browse-disabled-date").removeClass(".activeBtn");
                return alert("An error occurred while processing your request. Please try again.");
            }
        }
    });
});

// Reseting browsing filters 
$("#reset-btn").click(() => {
    // Reseting all the browsing fields
    $("#entry-title").val("");
    $("#entry-date").val("");
    $("#entry-date-from").val("");
    $("#entry-date-to").val("");

    location.reload();
});

$(".addNotesBtn").click((event) => {
    addNewNotesToEntry(event);
});

$(".notesBtn").click((event) => {
    updateNotesOfEntry(event);
});


