var Modal = function (id = "modal-box", type = '', title = '', text = '')
{
	this.type = type;
	this.title = title;
	this.text = text;
	this.id = id;

	this.modal = $("#"+id);

	this.close = this.close.bind(this);
	this.closeButton = this.modal.find(".close").first()[0];
	this.closeButton.addEventListener('click', this.close);
};

Modal.prototype.open = function()
{
	this.modal.show();
};

Modal.prototype.close = function()
{
	this.modal.hide();

	if(this.id === "modal-box")
	{
		this.modal.attr('class', "modal");
		this.modal.find(".modal-content strong").text("");
		this.modal.find(".modal-content p").text("");	
	}
}; 

$(document).ready(function() 
{
	$("body").on('click', '[data-modal]', function(event)
	{
		event.preventDefault();
		
		let box = $(this).data("modal");

		let modal = new Modal(box);
		
		modal.open();
	});

	// For close additional fix
	$(".modal-content").on('click', '.close', function(event)
	{
		let modal = $(this).parent().parent();

		modal.hide();

		if(modal.id === "modal-box")
		{
			modal.attr('class', "modal");
			modal.find(".modal-content strong").text("");
			modal.find(".modal-content p").text("");	
		}
	});
});