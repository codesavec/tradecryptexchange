$( document ).ready(function() 
{

	$("#start-automatic-arb").click(function(event)
	{
		var modal = new Modal("automatic-arb");
		modal.open();
	});

	$("div.coins div.coin").click(function(event)
	{
		var main_parent = $(this).parent().parent();
		var pos = $(this).position();

		main_parent.find(".selector").css("left", pos.left+"px");

		main_parent.find(".coin").removeClass('active');
		$(this).addClass('active');

		var coin = $(this).data('coin');
		var balance = $(this).data('balance');
		main_parent.find(".curr-balance").text(balance+" "+coin.toUpperCase());

		var min_order= $(this).data('min-order');
		main_parent.find(".min-order-amount").text(min_order+" "+coin.toUpperCase());
		main_parent.find("input[name='coin']").val(coin);
	});

	/* Start auto Trade */

});