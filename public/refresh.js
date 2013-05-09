jQuery(document).ready(function() {
  setTimeout(function() {
    var source = new EventSource('/updates');
    source.addEventListener('refresh', function(e) {
      console.log('refresh');
      window.location.reload();
    });
  }, 1);
});
