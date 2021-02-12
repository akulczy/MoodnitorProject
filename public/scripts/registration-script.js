let clinicName = "";
let clinicEmail = "";
let clinicPhone = "";

// Method to render the form 
$("#nextRegistrationStepBtn").click(() => {
    clinicName = $("#clinicName").val();
    clinicEmail = $("#clinicEmail").val();
    clinicPhone = $("#clinicPhone").val();

    if(clinicName == "" || clinicEmail == "" || clinicPhone == "") {
        alert("Please fill in all the fields.");
    } else {
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
        });
    }
});