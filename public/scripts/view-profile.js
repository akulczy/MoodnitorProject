$(document).ready(() => {
    const urlParams = new URLSearchParams(window.location.search);

    try {
        const emailunique = urlParams.get("unique");
        if(emailunique == false || emailunique == "false") {
            return alert("We couldn't update your profile, since the email you submitted is not unique.");            
        }
    } catch(error) { console.log(error) };
});

