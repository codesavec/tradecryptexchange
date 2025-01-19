$( document ).ready(function() 
{
	$("body").on('click', 'span.copy', function(event)
	{
		var parent = $(this).parent();
		parent.addClass("copied");

		var cpd = $("<input type='text' style='position:absolute; top:-9999px; left:-9999px;'>");
		$("body").append(cpd);
		var copyText = parent.find("span:first-child").text();
		cpd.val(copyText).select();
		document.execCommand("copy");
		cpd.remove();

		setTimeout(function()
		{
			parent.removeClass("copied");
		}, 2010);
	});
});