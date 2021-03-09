
// Methods for the tooltip with a phone number
const closePopover = (event) => {
    if ($(event.target).data('toggle') !== 'popover'
        && $(event.target).parents('.popover.in').length === 0) { 
        $('[data-toggle="popover"]').popover('hide');
    }
};

$(function () {
    $('[data-toggle="popover"]').popover({
        container: "body",
        placement: "top",
        boundary: "viewport",
        html: true,
        sanitize: false
    })
});

$("body").click((event) => {
    closePopover(event);
});

// Methods to disable or enable the user from the Users Management List
const disableUser = (event) => {
    // Retrieving id of the user to be disabled from the button value
    let id = null;
    let pressedTr = $(event.target).closest("tr");

    try {
        id = parseInt($(event.target).val());
    } catch(error) {
        return alert("An error occurred when processing your request. Please try again.");
    }

    if(id === null) { return  alert("An error occurred when processing your request. Please try again."); }

    $.ajax({
        url: "/dashboard/specialist/users/spec/disable",
        method: "PATCH",
        data: {userId: id},
        // Actions depending on the status code in the response
        statusCode: {
            200: (data) => {
                if(data.disabled) {
                    alert("User disabled successfully.");
                    pressedTr.addClass("disabledTr");
                    $(event.target).text("Enable");
                } else {
                    alert("User enabled successfully.");
                    pressedTr.removeClass("disabledTr");
                    $(event.target).text("Disable");
                }
            },
            400: () => {
                alert("An error occurred while processing your request. Please try again.");
            }
        }
    });
}

$(".disableBtn").click((event) => {
    disableUser(event);
});

