let clinicName = "";
let clinicEmail = "";
let clinicPhone = "";

// Method to render the form 
$("#nextRegistrationStepBtn").click(() => {
    clinicName = $("#clinicName").val();
    clinicEmail = $("#clinicEmail").val();
    clinicPhone = $("#clinicPhone").val();

    let emailRegex = /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/;
    let phoneRegex = /^\s*\(?((\+0?44)?\)?[ \-]?(\(0\))|0)((20[7,8]{1}\)?[ \-]?[1-9]{1}[0-9]{2}[ \-]?[0-9]{4})|([1-8]{1}[0-9]{3}\)?[ \-]?[1-9]{1}[0-9]{2}[ \-]?[0-9]{3}))\s*$/;

    if(clinicName == "" || clinicEmail == "" || clinicPhone == "") {
        return alert("Please fill in all the fields.");
    } else {

        if(!(clinicEmail.match(emailRegex))) {
            return alert("Please ensure email is in correct format.");
        }

        if(!(clinicPhone.match(phoneRegex))) {
            return alert("Please ensure telephone is in correct format (British telephone number).");
        }

        // Empty the placeholder in order to get and append the new form template
        $("#registrationFormPlaceholder").empty();

        $.get("/templates/registration-form-template.ejs", template => {
            let adminRegistrationTemplate = $(template);
            $("#maintext").text("Please insert Administrator's details");
            // Appending values so that they are submitted with the form
            adminRegistrationTemplate.prepend('<input type="hidden" name="clinicEmail" id="clinicEmail" value="' + clinicEmail + '">');
            adminRegistrationTemplate.prepend('<input type="hidden" name="clinicName" id="clinicName" value="' + clinicName + '">');
            adminRegistrationTemplate.prepend('<input type="hidden" name="clinicPhone" id="clinicPhone" value="' + clinicPhone + '">');
            $("#registrationFormPlaceholder").append(adminRegistrationTemplate);

            $("#adminPasswordRepeat").keyup(() => {
                if($("#adminPasswordRepeat").val() == $("#adminPassword").val()) {
                    $("#pass-info").text("Passwords matching");
                    $("#pass-info").css("color", "#277a4b");
                } else {
                    $("#pass-info").text("Passwords not matching");
                    $("#pass-info").css("color", "#8c2a2a");
                }
            });

            $("#registrationBtn").click((event) => {
                event.preventDefault();

                if($("#adminName").val().replace(/ /g, '') == "" || $("#adminSurname").val().replace(/ /g, '') == "" || $("#adminEmail").val().replace(/ /g, '') == "" || $("#adminPhone").val().replace(/ /g, '') == "" || $("#adminPassword").val().replace(/ /g, '') == "" || $("#adminPasswordRepeat").val().replace(/ /g, '') == "") {
                    return alert("Please fill in all the fields.");
                }

                if(!($("#adminEmail").val().match(emailRegex))) {
                    return alert("Please ensure email is in correct format.");
                }
        
                if(!($("#adminPhone").val().match(phoneRegex))) {
                    return alert("Please ensure telephone is in correct format (British telephone number).");
                }

                if($("#adminPassword").val() != $("#adminPasswordRepeat").val()) {
                    return alert("Please ensure that the Password and Repeat Password fields have the same value.");
                }

                if($("#adminPassword").val().length < 8) {
                    return alert("Please ensure that the password is at least 8 characters long.");
                }

                $("#registerAdminForm").submit();
            });
        });
    }
});