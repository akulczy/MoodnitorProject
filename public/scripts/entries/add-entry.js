let options = {
    debug: 'info',
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
    placeholder: 'Type in your entry here...'
  };
let container = document.getElementById("entry-field");
let editor = new Quill(container, options);

const addEntry = () => {
    let entryContent = editor.getText();
    let entryHtmlContent = $(".ql-editor").first().html();
    let entryTitle = $("#entry-title").val();

    // Entry cannot be submitted if the main field is left empty
    if(entryContent.replace(/\s+/g, "") == "") {
        return alert("Please fill in you entry before submitting.");
    }

    // Apending elements from the form to the FormData object
    let entryData = new FormData();
    entryData.append("entryContent", entryContent);
    entryData.append("entryHtmlContent", entryHtmlContent);
    entryData.append("entryTitle", entryTitle);

    // Appending potential additional files
    entryData.append( 'action','uploadImages');
    jQuery.each($("#customFile")[0].files, function(i, file) {
        entryData.append('addfiles', file);
    });
    
    // Displaying spinner element once the submit button is clicked
    if(!($("#submitEntryBtn").hasClass(".activeBtn"))) {
        $("#submitEntryBtn").append('<span class="spinner-grow text-light spinner-grow-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span>');
        $("#submitEntryBtn").addClass(".activeBtn");
    }

    $.ajax({
        url: "/dashboard/user/entries/add/ind",
        method: "POST",
        data: entryData,
        processData: false,
        contentType: false,
        // Actions depending on the status code in the response
        statusCode: {
            200: () => {
                // Displaying information that the entry had been added successfully
                $(".spinner-grow").remove();
                $("#submitEntryBtn").removeClass(".activeBtn");
                $(".main-body").empty();

                $.get("/templates/entries/entry-box-success.ejs", template => {
                    let boxTemplate = $(template);

                    $(".main-body").append(boxTemplate);
                });

            },
            400: () => {
                // Displaying an error message
                $(".spinner-grow").remove();
                $("#submitEntryBtn").removeClass(".activeBtn");
                $(".main-body").empty();
                $(".main-body").append(
                    '<div class="entry-cont success-cont">' +
                        '<div class="success-sub">' +
                            '<div class="success-lg">Something went wrong</div>' +
                            '<div class="success-min">An error occurred while processing your entry. Please try again.</div>' +
                            '<div class="success-click"><a class="linkNoStyle" href="/dashboard/user/entries/add"><div class="success-click-style">Add entry</a></div></div>' +
                        '</div>'+
                        '<div class="success-space"></div>' +
                        '<div class="success-sub">' +
                            '<img alt="success-icon" src="/files/entry-error.png" />' +
                        '</div>'+
                    '</div>'
                );
            }
        }
    });
}

$("#submitEntryBtn").click(() => {
    addEntry();
});