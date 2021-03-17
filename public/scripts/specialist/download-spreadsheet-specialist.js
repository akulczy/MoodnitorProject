function s2ab(s) { 
    let buf = new ArrayBuffer(s.length); 
    let view = new Uint8Array(buf);  
    for (let i = 0; i < s.length; i++){
        view[i] = s.charCodeAt(i) & 0xFF; 
    }
    return buf;    
}

const downloadAllEntries = () => {
    let entryDate = $("#entry-date").val();
    let dateFrom = $("#entry-date-from").val();
    let dateTo = $("#entry-date-to").val();
    let entryTitle = $("#entry-title").val();

    $.ajax({
        url: "/dashboard/specialist/entries/fetch",
        method: "GET",
        data: {entryDate: entryDate, dateFrom: dateFrom, dateTo: dateTo, entryTitle: entryTitle},
        success: (data) => {
            let workbook = XLSX.utils.book_new();

            workbook.Props = {
                Title: "User-Entries",
                Subject: "User-Entries",
            }; 

            workbook.SheetNames.push("User-Entries");

            let wscols = [
                {wpx: 120}, 
                {wpx: 90},
                {wpx: 90},
                {wpx: 90},
                {wpx: 80},
                {wpx: 80},
                {wpx: 80},
                {wpx: 80},
                {wpx: 80},
                {wpx: 80}
            ];

            let ws = XLSX.utils.json_to_sheet(data.entries, {defval: ""});

            ws['!cols'] = wscols;
            workbook.Sheets["User-Entries"] = ws;

            let wbout = XLSX.write(workbook, {bookType:'xlsx', type: 'binary'});

            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'User-Entries.xlsx');
        }
    });
}

const downloadIndEntries = () => {
    let entryDate = $("#entry-date").val();
    let dateFrom = $("#entry-date-from").val();
    let dateTo = $("#entry-date-to").val();
    let entryTitle = $("#entry-title").val();
    let uid = $("#uid").val();

    $.ajax({
        url: "/dashboard/specialist/entries/fetch/ind",
        method: "GET",
        data: {id: uid, entryDate: entryDate, dateFrom: dateFrom, dateTo: dateTo, entryTitle: entryTitle},
        success: (data) => {
            let workbook = XLSX.utils.book_new();

            workbook.Props = {
                Title: "User-Entries",
                Subject: "User-Entries",
            }; 

            workbook.SheetNames.push("User-Entries");

            let wscols = [
                {wpx: 120}, 
                {wpx: 90},
                {wpx: 90},
                {wpx: 90},
                {wpx: 80},
                {wpx: 80},
                {wpx: 80},
                {wpx: 80},
                {wpx: 80},
                {wpx: 80}
            ];

            let ws = XLSX.utils.json_to_sheet(data.entries, {defval: ""});

            ws['!cols'] = wscols;
            workbook.Sheets["User-Entries"] = ws;

            let wbout = XLSX.write(workbook, {bookType:'xlsx', type: 'binary'});

            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'User-Entries.xlsx');
        }
    });
}

$("#spreadsheet-down-ind").click(() => {
    downloadIndEntries();
});

$("#spreadsheet-down").click(() => {
    downloadAllEntries();
});
