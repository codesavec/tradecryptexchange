$( document ).ready(function() 
{
    $("body").on('change keyup input click', 'input[name="track"]', function(event)
    {  
        let link = $("span.tracker").data("link");
        $("span.tracker").text(link + $(this).val() + "/");
    });
});