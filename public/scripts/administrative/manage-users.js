// Method to send the request to add the user
const addUser = () => {
    let specTitle = "";
    // Checking if the user left any of the fields empty
    if(($("#userName").val().replace(/ /g, ";") == "") || ($("#userSurname").val().replace(/ /g, ";") == "") || ($("#userEmail").val().replace(/ /g, ";") == "") || ($("#userPhone").val().replace(/ /g, ";") == "") || ($("#userPassword").val().replace(/ /g, ";") == "")) {
        return alert("Please fill in all the fields.");
    }

    if(($("#inlineRadio1").prop("checked") == true) && ($("#select-specialist").val() == 0)) {
        return alert("Please choose a Specialist to which the new user shall be assigned.");
    }

    let userToAdd = {
        name: $("#userName").val(),
        surname: $("#userSurname").val(),
        email: $("#userEmail").val(),
        telephone: $("#userPhone").val(),
        password: $("#userPassword").val(),
        privileges: $("input[name=privileges]:checked").val(),
        SpecialistId: $("#select-specialist").val(),
        specTitle: $("#specTitle").val()        
    };

    $.ajax({
        url: "/dashboard/specialist/users/create",
        method: "POST",
        data: userToAdd,
        // Actions depending on the status code in the response
        statusCode: {
            200: () => {
                $("input").val("");
                $("#inlineRadio1").prop("checked", true);
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
        url: "/dashboard/specialist/users/disable",
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

// Displaying a drop down list depending on the radio button
$(".form-check").change(() => {
    if($("#inlineRadio1").prop("checked") == false) {
        $("#dropDownRow").css("display", "none");
        $("#dropDownRow2").css("display", "unset");
    } else {
        $("#dropDownRow").css("display", "unset");
        $("#dropDownRow2").css("display", "none");
    }
});

