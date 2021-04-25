$(document).ready(function() {
    const browseReset = $(".grid-item");

    $("#name-search-btn").click(async () => {
        let browseVal = $("#name-search").val();
        if(browseVal == "") {
            return alert("Please enter the patient's name.");
        }

        const cont = document.getElementById("all-users");
        $(cont).empty();

        let elements = [];

        for(let i = 0; i < browseReset.length; i++){
            const row = browseReset[i];
            let user = row.getElementsByClassName("user-name")[0].innerText;

            if(user.includes(browseVal)) {
                elements.push(row);
            } 
        };

        let curr;
        for(let i = 0; i < elements.length; i++) {
            if(i%2==0) { 
                curr = $(cont).append('<div class="grid-container">');
            } 

            curr = $(".grid-container").last();

            await $(cont).find($(curr)).append(elements[i]);

            if((i+1)%2==0 || i == ((elements.length) - 1)) {
                await $(cont).append('</div>');
            }                  
        }

        openPopover();

        $("body").click((event) => {
            closePopover(event);
        });
    });

    $("#reset-btn").click(async () => {
        const cont = document.getElementById("all-users");
        $("#name-search").val("");
        $('[data-toggle="popover"]').popover('hide');
        $(cont).empty();

        let curr;
        for(let i = 0; i < browseReset.length; i++) {
            if(i%2==0) { 
                $(cont).append('<div class="grid-container">');
            } 

            curr = $(".grid-container").last()

            await $(cont).find($(curr)).append(browseReset[i]);

            if((i+1)%2==0 || i == ((browseReset.length) - 1)) {
                await $(cont).append('</div>');
            }                  
        }

        openPopover();

        $("body").click((event) => {
            closePopover(event);
        });
    });

});

// Methods for the tooltip with a phone number
const closePopover = (event) => {
    if ($(event.target).data('toggle') !== 'popover'
        && $(event.target).parents('.popover.in').length === 0) { 
        $('[data-toggle="popover"]').popover('hide');
    }
};

const openPopover = () => {
    $('[data-toggle="popover"]').popover({
        container: "body",
        placement: "top",
        boundary: "viewport",
        html: true,
        sanitize: false
    });
}

openPopover();

$("body").click((event) => {
    closePopover(event);
});