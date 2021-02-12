$(function () {
    $(document).scroll(function () {
        let $topbar = $("#app-topbar");
        $topbar.toggleClass('scrolled', $(this).scrollTop() > $topbar.height());
    });
});