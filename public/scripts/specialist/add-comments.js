const addNewCommentsToEntrySpecialist = (event, userId) => {
    let id = null;
    try {
        id = parseInt($(event.target).siblings(".eid").val());
    } catch(error) {
        return alert("An error occurred when processing your request. Please try again.");
    }

    if(id === null) { return alert("An error occurred when processing your request. Please try again."); }

    $.get( "/templates/entries/comments-box.ejs", commentswindow => {
        let cwin = $(commentswindow);

        $("body").append(cwin);
        $("#popup-background").css("display", "unset");   
        
        $("#popup-background").click((event) => {
            closePopUpOnBackgroundClick(event);
        });

        $("#close-popup").click(() => {
            closePopUpOnButtonClick();
        });

        $("#save-comment-button").click(() => {
            if(!($("#save-comment-button").hasClass("activeBtn"))){
                $("#save-comment-button").append('<div class="spinner-border spinner-border-sm btn-spinner" role="status"><span class="sr-only">Loading...</span></div>');
                $("#save-comment-button").addClass("activeBtn");
            }

            let commentVal = $("#comment-content").val();

            if(commentVal.replace(/\s+/g, "") != "") {
                $.ajax({
                    url: "/dashboard/specialist/entries/comments/add",
                    method: "POST",
                    data: {id: id, userId: userId, comment: commentVal},
                    statusCode: {
                        200: data => {
                            let comment = data.comment;
                            $("#comment-content").val(comment);

                            $(".btn-spinner").remove();
                            $("#save-comment-button").removeClass("activeBtn"); 

                            alert("Comment added successfully.");                      
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
            } else {
                alert("Please fill in the comments fields before submitting.");
                $(".btn-spinner").remove();
                $("#save-comment-button").removeClass("activeBtn"); 
            }            
        })
    });
}

const updateCommentOfEntrySpecialist = (event, userId) => {
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
        url: "/dashboard/specialist/entries/comments",
        method: "GET",
        data: {id: id, userId: userId},
        statusCode: {
            200: data => {
                let comment = data.comments;
                let comId;
                
                if(comment.length > 0) {
                    for(let com of comment) {
                        comment = com.comment;
                        comId = com.id;
                    }
                }

                $.get( "/templates/entries/comments-box.ejs", commentswindow => {
                    let cwin = $(commentswindow);
            
                    $("body").append(cwin);
                    $(".btn-spinner").remove();
                    $(event.target).removeClass("activeBtn");
                    $("#popup-background").css("display", "unset");   

                    $("#comment-content").val(comment);
                    $("#popup-box-title").text("Update Your Comment");
                    
                    $("#popup-background").click((event) => {
                        closePopUpOnBackgroundClick(event);
                    });
            
                    $("#close-popup").click(() => {
                        closePopUpOnButtonClick();
                    });

                    $("#save-comment-button").click(() => {
                        if(!($("#save-comment-button").hasClass("activeBtn"))){
                            $("#save-comment-button").append('<div class="spinner-border spinner-border-sm btn-spinner" role="status"><span class="sr-only">Loading...</span></div>');
                            $("#save-comment-button").addClass("activeBtn");
                        }
            
                        let commentVal = $("#comment-content").val();
            
                        if(commentVal.replace(/\s+/g, "") != "") {
                            $.ajax({
                                url: "/dashboard/specialist/entries/comments/update",
                                method: "PUT",
                                data: {EntryId: id, comment: commentVal, comId: comId},
                                statusCode: {
                                    200: data => {
                                        let comment = data.comment;
                                        $("#comment-content").val(comment);
            
                                        $(".btn-spinner").remove();
                                        $("#save-comment-button").removeClass("activeBtn"); 
            
                                        alert("Comment updated successfully.");                      
                                    },
                                    404: () => {
                                        alert("Comment could not be updated. Please try again.");
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
                            alert("Please fill in the comments fields before submitting.");
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