// Options for the text area
let options = {
    modules: {
        toolbar: [
            [{ header: [] }],
            ['bold', 'italic', 'underline', 'link'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean']
        ]
    },
    readOnly: false,
    theme: 'snow',
    placeholder: 'Type in your message here...'
};

let container = document.getElementById("mail-field");
let editor = new Quill(container, options);

$("#submitMailBtn").click(() => {
    let emailHtmlContent = $(".ql-editor").first().html();
    let mailContent = editor.getText();

    // Mail cannot be submitted if the main field is left empty
    if(mailContent.replace(/\s+/g, "") == "") {
        return alert("Please fill in your message before submitting.");
    }

    // Displaying spinner element once the submit button is clicked
    if(!($("#submitMailBtn").hasClass(".activeBtn"))) {
        $("#submitMailBtn").append('<span class="spinner-grow text-light spinner-grow-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span>');
        $("#submitMailBtn").addClass(".activeBtn");   

        $.ajax({
            url: "/dashboard/user/contact/mail/send/support",
            method: "POST",
            data: {email: emailHtmlContent},
            // Actions depending on the status code in te response
            statusCode: {
                200: () => {
                    // Mail sent successfully
                    $(".spinner-grow").remove();
                    $("#submitMailBtn").removeClass(".activeBtn");

                    $("#mail-field").empty();

                    return alert("Your email has been sent successfully.");                       
                },
                400: () => {
                    // Displaying an error message
                    $(".spinner-grow").remove();
                    $("#submitMailBtn").removeClass(".activeBtn");
                    return alert("An error occurred while sending your email. Please try again.");
                }
            }
        });     
    }
});