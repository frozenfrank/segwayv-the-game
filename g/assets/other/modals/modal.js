// http://codepen.io/reinislejnieks/pen/Avlqc
// Custom namespace
var modal = {
	hide: function() {
		$('#overlay').fadeOut();
		$('.dialog').fadeOut();
	},
	launch: function(text,red_blue_green_red,modal){
		var html = "<div class='dialog " + red_blue_green_red + (modal ? ' modal' : '') + "'><div class='label-dialog'><i class='icon-"+icon+"'></i></div>";
			html +="<div class='body-dialog'><p>" + text + "</div><div class='ok-dialog'><i class='icon-ok-sign'></i></div></div>";

		$(html).appendTo('#overlay');
	}
};
$(document).ready(function() {
	// Open appropriate dialog when clicking on anything with class "dialog-open"
	$('.dialog-open').click(function() {
		modal.id = '#dialog-' + this.id;
		$('#overlay').fadeIn();
		$(modal.id).fadeIn();
	});
	// Close dialog when clicking on the "ok-dialog"
	$('.ok-dialog').click(modal.hide);
	// Require the user to click OK if the dialog is classed as "modal"
	$('#overlay').click(function() {
		if (!$(modal.id).hasClass('modal'))
			modal.hide();
	});
	// Prevent dialog closure when clicking the body of the dialog (overrides closing on clicking overlay)
	$('.dialog').click(function() {
		event.stopPropagation();
	});
});