const addNewNotesToEntry = (event) => {
    let id = null;
    try {
        id = parseInt($(event.target).siblings(".eid").val());
    } catch(error) {
        return alert("An error occurred when processing your request. Please try again.");
    }

    if(id === null) { return alert("An error occurred when processing your request. Please try again."); }

    $.get( "/templates/entries/add-notes-box.ejs", noteswindow => {
        let nwin = $(noteswindow);

        $("body").append(nwin);
        $("#popup-background").css("display", "unset");   
        
        $("#popup-background").click((event) => {
            closePopUpOnBackgroundClick(event);
        });

        $("#close-popup").click(() => {
            closePopUpOnButtonClick();
        });

        $("#save-notes-button").click(() => {
            if(!($("#save-notes-button").hasClass("activeBtn"))){
                $("#save-notes-button").append('<div class="spinner-border spinner-border-sm btn-spinner" role="status"><span class="sr-only">Loading...</span></div>');
                $("#save-notes-button").addClass("activeBtn");
            }

            let notesVal = $("#notes-content").val();

            if(notesVal.replace(/\s+/g, "") != "") {
                $.ajax({
                    url: "/dashboard/user/entries/add/notes",
                    method: "PATCH",
                    data: {entryId: id, notes: notesVal},
                    statusCode: {
                        200: data => {
                            let notes = data.notes;
                            $("#notes-content").val(notes);

                            $(".btn-spinner").remove();
                            $("#save-notes-button").removeClass("activeBtn"); 

                            let closestTr = $(event.target).closest("tr");
                            $(closestTr).find(".e-notes").empty();
                            $(closestTr).find(".e-notes").append(`<button class="btnGradPurpleSm margin-auto notesBtn" value="${id}">Notes</button>`);

                            $(closestTr).find(".notesBtn").click((event) => {
                                updateNotesOfEntry(event);
                            });
                            
                            alert("Your notes have been added successfully.");                      
                        },
                        404: () => {
                            alert("Entry could not be retrieved. Please try again.");
                            $(".btn-spinner").remove();
                            $("#save-notes-button").removeClass("activeBtn");
                        },
                        400: () => {
                            alert("An error occurred while processing your request. Please try again.");
                            $(".btn-spinner").remove();
                            $("#save-notes-button").removeClass("activeBtn");
                        }
                    }
                });
            } else {
                alert("Please fill in the notes field before submitting.");
                $(".btn-spinner").remove();
                $("#save-notes-button").removeClass("activeBtn"); 
            }            
        })
    });
}

const updateNotesOfEntry = (event) => {
    let id = null;
    try {
        id = parseInt($(event.target).val());
    } catch(error) {
        return alert("An error occurred when processing your request. Please try again.");
    }

    if(id === null) { return alert("An error occurred when processing your request. Please try again."); }

    if(!($(event.target).hasClass("activeBtn"))){
        $(event.target).append('<div class="spinner-border spinner-border-sm btn-spinner" role="status"><span class="sr-only">Loading...</span></div>');
        $(event.target).addClass("activeBtn");
    }
    
    $.ajax({
        url: "/dashboard/user/entries/get/notes",
        method: "GET",
        data: {entryId: id},
        statusCode: {
            200: data => {
                let notes = data.notes;
                
                $.get( "/templates/entries/add-notes-box.ejs", noteswindow => {
                    let nwin = $(noteswindow);
            
                    $("body").append(nwin);
                    $(".btn-spinner").remove();
                    $(event.target).removeClass("activeBtn");
                    $("#popup-background").css("display", "unset");   

                    $("#notes-content").val(notes);
                    $("#popup-box-title").text("Update Your Notes");
                    
                    $("#popup-background").click((event) => {
                        closePopUpOnBackgroundClick(event);
                    });
            
                    $("#close-popup").click(() => {
                        closePopUpOnButtonClick();
                    });

                    $("#save-notes-button").click(() => {
                        if(!($("#save-notes-button").hasClass("activeBtn"))){
                            $("#save-notes-button").append('<div class="spinner-border spinner-border-sm btn-spinner" role="status"><span class="sr-only">Loading...</span></div>');
                            $("#save-notes-button").addClass("activeBtn");
                        }
            
                        let notesVal = $("#notes-content").val();
            
                        if(notesVal.replace(/\s+/g, "") != "") {
                            $.ajax({
                                url: "/dashboard/user/entries/add/notes",
                                method: "PATCH",
                                data: {entryId: id, notes: notesVal},
                                statusCode: {
                                    200: data => {
                                        let notes = data.notes;
                                        $("#notes-content").val(notes);
            
                                        $(".btn-spinner").remove();
                                        $("#save-notes-button").removeClass("activeBtn"); 
            
                                        alert("Your notes have been updated successfully.");                      
                                    },
                                    404: () => {
                                        alert("Your notes could not be updated. Please try again.");
                                        $(".btn-spinner").remove();
                                        $(event.target).removeClass("activeBtn");
                                    },
                                    400: () => {
                                        alert("An error occurred while processing your request. Please try again.");
                                        $(".btn-spinner").remove();
                                        $(event.target).removeClass("activeBtn");
                                    }
                                }
                            });
                        } else {
                            alert("Please fill in the notes field before submitting.");
                            $(".btn-spinner").remove();
                            $("#save-comment-button").removeClass("activeBtn"); 
                        }
                    });
                });
            },
            404: () => {
                alert("Entry could not be retrieved. Please try again.");
                $(".btn-spinner").remove();
                $(event.target).removeClass("activeBtn");
            },
            400: () => {
                alert("An error occurred while processing your request. Please try again.");
                $(".btn-spinner").remove();
                $(event.target).removeClass("activeBtn");
            }
        }
    });
}