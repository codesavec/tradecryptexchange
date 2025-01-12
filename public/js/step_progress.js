var AnimateProgress = function(block)
{
	this.animate_interval = false;
	this.block = block;
	this.arrows = ['green-arrow.png', 'yellow-arrow.png', 'blue-arrow.png'];

};

AnimateProgress.prototype.start = function(start_txt)
{
	var progress_request = this.block.find(".progress-request");
	progress_request.css("display", "flex");
	progress_request.html("");
	progress_request.find("button").hide();

	$('<div class="animate-bar"></div><div class="progress-status">'+start_txt+'</div><button class="button-close">OK</button>').appendTo(progress_request);
	
	this.close = this.close.bind(this);
	closeButton = progress_request.find(".button-close")[0];
	closeButton.addEventListener('click', this.close);

	let animate_bar = progress_request.find(".animate-bar");
	let width_block = animate_bar.innerWidth();
	
	// First
	var img = $('<img src="https://cdn.3arbs.com/img/presentation/'+this.arrows[0]+'">');
	$(img).appendTo(animate_bar);

	img.animate({ opacity: 1, left: width_block+"px",},
	{
		duration: 1600,
		easing: "easeInOutQuint",
		complete: function() 
		{ 
			img.animate({ opacity: 0}, {duration:750, complete: function(){this.remove();}});
		}
	});

	var that = this;
	let i = 1;

	// Interval
	this.animate_interval = setInterval(function()
	{
		var img = $('<img src="https://cdn.3arbs.com/img/presentation/'+that.arrows[i]+'">');
		$(img).appendTo(animate_bar);

		img.animate({ opacity: 1, left: width_block+"px",},
		{
			duration: 1600,
			easing: "easeInOutQuint",
			complete: function() 
			{ 
				img.animate({ opacity: 0}, {duration:750, complete: function(){this.remove();}});
			}
		});

		if(i === 2)
			i = 0
		else
			i++;

	}, 1600);
};

AnimateProgress.prototype.setState = function(title, states, result = 'neutral', redirect = false, successCallback = false)
{
	var progress_request = this.block.find(".progress-request");
	var progress_status = progress_request.find(".progress-status");
	let animate_bar = progress_request.find(".animate-bar");
	
	var that = this;

	if($.isArray(states))
	{
		states.forEach(function(state, i)
		{
			setTimeout(function()
			{
				progress_status.html(state);

				if(i === states.length - 1)	
				{
					that.stop();
					animate_bar.html(title);
					progress_request.addClass('success');

					if(!that.block.find("form").data("no-reset"))
					that.block.find("form")[0].reset();

					if(redirect !== false)
					{
						seconds = $('span.timer').text();
						that.redirect(seconds, redirect);
					}
					else
					{
						
						if(successCallback !== false)
							that.successCallback(successCallback);

						progress_request.find("button").show();
					}
				}	

			}, i*2000);
		});
	} 
	else
	{
		progress_status.html(states); 

		if(result === 'error' || result === 'success' || result === 'almost')
		{ 
			this.stop();

			if(result === 'success' && !that.block.find("form").data("no-reset"))
				that.block.find("form")[0].reset();
			
			animate_bar.html(title);
			progress_request.addClass(result);

			if(redirect !== false)
			{
				seconds = $('span.timer').text();
				this.redirect(seconds, redirect);
			}
			else
			{
				if(successCallback !== false)
					this.successCallback(successCallback);

				progress_request.find("button").show();
			}
		}

	}
}


AnimateProgress.prototype.successCallback = function(all_callbacks)
{
	all_callbacks = all_callbacks.split(':');
	callback = [];

	for (let i = 0; i <Math.ceil(all_callbacks.length/2); i++)
    	callback[i] = all_callbacks.slice((i*2), (i*2) + 2);
	
	var self = this;
    callback.forEach(function(callback, i)
	{
		var type_callback = callback[0];
		var elem_callback = callback[1];

		switch(type_callback)
		{
			case "hide":
				$(elem_callback).hide();
			break;
			case "show":
				$(elem_callback).show();
			break;
			case "load":
				let block_for_load = self.block.find("div.completed");
				block_for_load.load(elem_callback);
			break;
			case "remove":
				$(elem_callback).remove();
			break;
		}
	});
};

AnimateProgress.prototype.redirect = function(seconds, redirect)
{
  	tick = setInterval(function()
  	{
  		if (seconds > 0)
  		{
  			seconds--;
  			$('span.timer').text(seconds);
  		}
  		else
  		{
  			clearInterval(tick);

  			if(redirect !== false)
  				window.location.replace(redirect);
  		}
  	}, 1000);
}


AnimateProgress.prototype.stop = function()
{
	clearInterval(this.animate_interval);
	this.animate_interval = false;

	var progress_request = this.block.find(".progress-request");

}

AnimateProgress.prototype.close = function(result)
{
	var progress_request = this.block.find(".progress-request");

	progress_request.removeClass("error").removeClass("success").removeClass("almost");
	progress_request.css("display", "none");
	progress_request.html("");
	progress_request.find("button").hide();
}