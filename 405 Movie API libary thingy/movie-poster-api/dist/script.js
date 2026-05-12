$(document).ready(function() {
  const apiKey = '165da49bc464981d104d3ca429f44d75';
  const horrorGenreId = 27; // ID for horror genre
  const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${horrorGenreId}&sort_by=popularity.desc`;
  const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;

 
  $.getJSON(genreUrl, function(genreJson) {
    
    $.getJSON(apiUrl, function(json) {
      if (json.results.length > 0) {
        $('#poster').empty();

        
        const shuffledMovies = json.results.sort(() => 0.5 - Math.random()).slice(0, 20);

       
        shuffledMovies.forEach(function(movie) {
          if (movie.poster_path) {
            
            const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`;

           
            $.getJSON(movieDetailsUrl, function(movieDetails) {
           
              $('#poster').append(
                `<div>
                  <img src="http://image.tmdb.org/t/p/w500/${movie.poster_path}" class="img-responsive" alt="${movie.title}" />
                  <p><strong>${movie.title}</strong></p>
                  <p>Horror</p> <!-- Display only the horror genre tag -->
                  <p>Duration: ${movieDetails.runtime} minutes</p> <!-- Display movie duration -->
                </div>`
              );
            });
          }
        });
      } else {
        $('#poster').html('<div class="alert"><p>No horror movies found.</p></div>');
      }
    });
  });
});
