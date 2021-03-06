const closePopUpOnBackgroundClick = (event) => {
    try{
        if(($(event.target).attr("id")).includes("popup-background")) {
            document.getElementById("popup-box").animate([{ transform: "scale(1)" }, { transform: "scale(0)" }], 300);
            setTimeout(() => { $("#popup-box").remove(); $("#popup-background").css("display", "none"); $("body").css("overflow", "auto"); $('body').css("height", "");}, 300); 
        }
    } catch(error) {}
}

const closePopUpOnButtonClick = () => {
    try{
        document.getElementById("popup-box").animate([{ transform: "scale(1)" }, { transform: "scale(0)" }], 300);
        setTimeout(() => { $("#popup-box").remove(); $("#popup-background").css("display", "none"); $("body").css("overflow", "auto"); $('body').css("height", "");}, 300); 
    } catch(error) {}
}