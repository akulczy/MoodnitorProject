$("#entry-title").change(() => {
    $("#entry-date").val("");
    $("#entry-date-from").val("");
    $("#entry-date-to").val("");
});

$("#entry-date").change(() => {
    $("#entry-title").val("");
    $("#entry-date-from").val("");
    $("#entry-date-to").val("");
});

$("#entry-date-to").change(() => {
    $("#entry-title").val("");
    $("#entry-date").val("");
});

$("#entry-date-from").change(() => {
    $("#entry-title").val("");
    $("#entry-date").val("");
});
