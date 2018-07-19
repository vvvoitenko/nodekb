$(document).ready(function(){
	$('.delete-article').on('click', function(e){
		$.ajax({
			type: 'DELETE',
			url: '/articles/'+$(this).data('id'),
			success(response) {
				alert('Deleting Article');
				window.location.href='/';
			},
			error(err) {
				console.log('err', err);	
			}
		})
	});
});