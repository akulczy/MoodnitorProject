const addUser = () => {
    // Checking if the user left any of the fields empty
    if(($("#userName").val().replace(/ /g, ";") == "") || ($("#userSurname").val().replace(/ /g, ";") == "") || ($("#userEmail").val().replace(/ /g, ";") == "") || ($("#userPhone").val().replace(/ /g, ";") == "") || ($("#userPassword").val().replace(/ /g, ";") == "")) {
        return alert("Please fill in all the fields.");
    }

    let userToAdd = {
        name: $("#userName").val(),
        surname: $("#userSurname").val(),
        email: $("#userEmail").val(),
        telephone: $("#userPhone").val(),
        password: $("#userPassword").val()
    };

    $.ajax({
        url: "/dashboard/specialist/users/create",
        method: "POST",
        data: userToAdd,
        statusCode: {
            200: () => {
                $("input").val("");
                alert("User added successfully.");
            },
            400: () => {
                alert("An error occurred while processing your request. Please try again.");
            },
            403: () => {
                alert("User with the given email address exists already.");
            }
        }
    });
}

$("#submitBtn").click((event) => {
    event.preventDefault();
    addUser();
});

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

