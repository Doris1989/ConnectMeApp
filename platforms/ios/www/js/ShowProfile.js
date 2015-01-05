$(document).ready(function() { 
	// jQuery is properly loaded at this point
	// so proceed to bind the Cordova's deviceready event
	//app.readPosts();
	$(document).bind('deviceready', app.onDeviceReady); 
});

var app = {
	posts_url: "http://connectme-env-3bpnycxdry.elasticbeanstalk.com/api/event/?event_id=5497f8c7f1cd3133e8b4efc7",
	onDeviceReady: function() {
		console.log('Device is ready');
		app.readPosts();
	},

	readPosts: function() {
		console.log('Reading posts');
		alert('reading user info')
		$.ajax({
			type: "GET",
			dataType: "json",
			url: app.posts_url,
			success: app.onSuccess,
			error: app.onError
		});

		console.log('Reading posts asynchrounously');
	},

	onSuccess: function(data) {
		//alert('success');
		
		alert(JSON.stringify(data.user_id));

		var items = [];
		$.each(data, function(key, val){
			items.push('<a href="' + app.posts_url + val.id + '">' + val.id + ' - ' +val.title + '</a>');
		});
		$('#posts').html(data.facebookId + data.name);
		console.log('Exiting onSuccess');
	},

	onError: function(data, textStatus, errorThrown) {
		alert("error!");
		console.log('Data: ' + data);
		console.log('Status: ' + textStatus);
		console.log('Error: ' + errorThrown);
		$("#posts").html('Error while loading posts');
		console.log('Exiting onError');
	}
};
