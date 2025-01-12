$( document ).ready(function() 
{
    $("body").on('click', 'div.language-box', function(event)
    {
        $(this).toggleClass('show');
    });

    $(".bg-blue-menu").on('click', 'button.navbar-toggler, span.close', function(event)
    {
        $("div.menu").toggleClass('show');
    });

   
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {    
        var target = $(this).attr('href');

        $(target).css('left','-'+$(window).width()+'px');   
        var left = $(target).offset().left;
        $(target).css({left:left}).animate({"left":"0px"}, "10");
    });
    
});