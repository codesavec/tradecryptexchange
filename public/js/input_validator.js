var Validator = function()
{
	this.stop = false;
};

Validator.prototype.isValid = function(input)
{
	this.clear(input);

	var type = $(input).data("validate");
	this[type](input);
};

Validator.prototype.inputError = function(input, err)
{
	$(input).addClass('error');
	$("<div class='err-txt'>"+scriptMsg[err]+"</div>").insertAfter(input); 
}

/* Function Email Validation */
Validator.prototype.email = function(input)
{
	var email = $(input).val();
	var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

	if(email.length < 1 || !emailReg.test(email))
	{
		this.stop = true;
		this.inputError(input, 'validate_email');

		return false;
	}

	this.setValid("email");
}

/* Function Password Validation */
Validator.prototype.password = function(input)
{
	var password = $(input).val();

	if(password.length < $(input).data("min-length"))
	{
		this.stop = true;
		this.inputError(input, 'short_password');
		
		return false;
	}
	
	if($(input).data("calc-strenght") === true)
	{
		if(this.calcStrenght(password) === false)
		{
			this.inputError(input, 'weak_password');
			return false;
		}
	}

	this.setValid("password");
}

Validator.prototype.calcStrenght = function(password)
{
	var strength = 1;

	if(password.length >= 8)
		strength++;

	if(password.match(/[a-zа-яё]+/))
		strength++;

	if(password.match(/[0-9]+/))
		strength++;

	if(password.match(/[A-ZА-ЯЁ]+/))
		strength++;

	if(/^[a-zA-Z0-9-]*$/.test(password) == false)
		strength++;

	switch(strength)
	{
		case 1:
			this.changeStrength("info");
		break;
		case 2:
		case 3:
			this.changeStrength("weak");
		break

		case 4:
		case 5:
			this.changeStrength("medium");
		break;

		case 6:
			this.changeStrength("strong");
		break;
	}

	if(strength < 6)
	{
		$(".important-text").show();
		return false;
	}
	else
	{
		$(".important-text").hide();
		return true;
	}
}

Validator.prototype.changeStrength = function(strength)
{
	$(".strength-password").attr('class', 'strength-password');

	if(strength === "info")
	{
		$(".strength-password .info").text($(".strength-password .info").data('info'));
	}
	else
	{
		$(".strength-password").addClass(strength);
		$(".strength-password .info").text($(".strength-password .info").data(strength));
	}
}

/* Function Password Validation */
Validator.prototype.checkbox = function(input)
{
	var checkbox = $(input);

	if(!checkbox.is(":checked"))
	{
		this.stop = true;
		this.inputError(checkbox.parent(), 'not_accepted_agreement');
		return false;
	}
}

Validator.prototype.setValid = function(name)
{
	$("input[name='"+name+"']").addClass('success');
}

Validator.prototype.clear = function(input)
{
	$(input).attr('class', '');
	$(input).next("div.err-txt").remove();
}