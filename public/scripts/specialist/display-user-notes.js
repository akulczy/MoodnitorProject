const displayUserNotesSpecialist = (event, userId) => {
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
        url: "/dashboard/specialist/entries/ind/notes",
        method: "GET",
        data: {id: id, userId: userId},
        statusCode: {
            200: data => {
                $(".btn-spinner").remove();
                $(event.target).removeClass("activeBtn");

                let notes = data.notes;

                $.get( "/templates/entries/notes-box.ejs", noteswindow => {
                    let nwin = $(noteswindow);
                    nwin.find(".notes-txt").append(notes);

                    $("body").append(nwin);
                    $("#popup-background").css("display", "unset");   
                    
                    $("#popup-background").click((event) => {
                        closePopUpOnBackgroundClick(event);
                    });

                    $("#close-popup").click(() => {
                        closePopUpOnButtonClick();
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