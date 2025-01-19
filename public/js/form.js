$( document ).ready(function() 
{
	var fValidator = new Validator();

	// Press button send request
	$("body").on('click change', '[data-request]', function(event)
	{
		if($(this).is('select') && event.type === "click")
			return;
		
		var self = this;

		// Stop prev.event
		event.preventDefault();

		$("div.err-txt").remove();
		$("input[type='text'], input[type='password']").attr('class', '');

		// Request url
		var request_url = $(this).data('request');

		// Get this form
		var form = $(this).closest("form");
		
		// Default callback and redirect
		var callback = false;
		var redirect = false;

		fValidator = new Validator();

		form.find("input").each(function(index)
		{
			if($(this).data("validate"))
			{
				fValidator.isValid(this);
			}
		});

		// If validate false, stop function
		if(fValidator.stop === true)
			return false;

		// If isset callback
		if($(this).data("callback"))
			callback = $(this).data('callback');

		// If isset redirect
		if($(this).data("redirect"))
			redirect = $(this).data('redirect');

		// Animation progress reuqest
		var animateProgress  = new AnimateProgress(form.parent());
		animateProgress.start(scriptMsg["send_data_msg"]);
		
		// Google Recaptcha 
		grecaptcha.ready(function() 
		{
			grecaptcha.execute('6LfgprsUAAAAAHjzgpW_BQzfVUNwu2-1MQnoiQgs', {action: request_url}).then(function(token) 
			{
				// Set google recaptcha token
				$('input[name="g-recaptcha-response"]').val(token);
				
				// Get serialized form datadata
				var form_data = form.serialize();

				// Send request
				$.ajax(
				{
					url: request_url,
					type: 'POST',
					dataType: "json",
					data: form_data,

					success: function(data) 
					{	
						animateProgress.setState(scriptMsg["rcv_data_msg"]);
						console.log(data);

						self.blur()
						// If error
						if(data.success === false)
						{
							animateProgress.setState(data.title, data.error, 'error');
						}
						else // If success
						{
							console.log(data.success);
						
							if(data.replace_in)
							{
								Object.keys(data.replace_in).forEach(function(key)
								{
									let rplc = data.replace_in[key];
									$(key).text(rplc);
								});
							}

							if(data.load)
							{
								form.parent().load(data.load);
							}
							else
							{
								animateProgress.setState(data.title, data.success, 'success', redirect, callback);
							}
						}	
					},
					error: function(xhr, status, error) 
					{
						console.log(xhr); 

						// If error
						animateProgress.setState(scriptMsg["error"], scriptMsg["server_error"], 'error');
						animateProgress.stop();
					}
				});
			});
		});
	});

	$(".show-password").click(function()
	{
		$(this).toggleClass('visible');

		if($(".show-password").parent().find("input").attr('type') === 'password')
			$(".show-password").parent().find("input").prop('type', 'text');
		else
			$(".show-password").parent().find("input").prop('type', 'password');
	});

	$("input[data-focusout-call='true']").focusout(function() 
	{
		if($(this).data("validate"))
			fValidator.isValid(this);
	});

	$("input[data-keyup-call='true']").on('keyup', function()
	{
		if($(this).data("validate"))
			fValidator.isValid(this);
	});

});