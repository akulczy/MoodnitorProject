let emailRegex = /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/;
let phoneRegex = /(((\+44)? ?(\(0\))? ?)|(0))( ?[0-9]{3,4}){3}/;

$("#userPasswordRepeat").keyup(() => {
    if($("#userPasswordRepeat").val() == $("#userPassword").val()) {
        $("#pass-info").text("Passwords matching");
        $("#pass-info").css("color", "#277a4b");
    } else {
        $("#pass-info").text("Passwords not matching");
        $("#pass-info").css("color", "#8c2a2a");
    }
});

$("#submitBtn").click((event) => {
    event.preventDefault();

    if($("#userName").val().replace(/ /g, '') == "" || $("#userSurname").val().replace(/ /g, '') == "" || $("#userEmail").val().replace(/ /g, '') == "" || $("#userPhone").val().replace(/ /g, '') == "" || $("#userPassword").val().replace(/ /g, '') == "" || $("#userPasswordRepeat").val().replace(/ /g, '') == "") {
        return alert("Please fill in all the fields.");
    }

    if(!($("#userEmail").val().match(emailRegex))) {
        return alert("Please ensure email is in correct format.");
    }

    if(!($("#userPhone").val().match(phoneRegex))) {
        return alert("Please ensure telephone is in correct format (British telephone number).");
    }

    if($("#userPassword").val() != $("#userPasswordRepeat").val()) {
        return alert("Please ensure that the Password and Repeat Password fields have the same value.");
    }

    if($("#userPassword").val().length < 8) {
        return alert("Please ensure that the password is at least 8 characters long.");
    }

    $("#registrationUserForm").submit();
});
