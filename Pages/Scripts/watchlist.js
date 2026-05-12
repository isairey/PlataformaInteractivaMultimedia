$(document).ready(function() {
    const apiKey = '165da49bc464981d104d3ca429f44d75';
    const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc`;
    const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;

    let genres = {};
    let bookmarks = []; // Store bookmarked movie IDs

    // Fetch genres
    $.getJSON(genreUrl, function(genreJson) {
        genreJson.genres.forEach(function(genre) {
            genres[genre.id] = genre.name;
        });

        // Fetch movies
        $.getJSON(apiUrl, function(json) {
            if (json.results.length > 0) {
                $('#poster-4').empty();
                $('#poster-20').empty();

                let randomMovies4 = json.results.sort(() => 0.5 - Math.random()).slice(0, 4);
                let randomMovies20 = json.results.sort(() => 0.5 - Math.random()).slice(0, 20);

                // Function to fetch and display movie details
                function fetchMovieDetails(movie, targetContainer, showRemoveSVG = true) {
                    const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=en-US`;

                    $.getJSON(movieDetailsUrl, function(details) {
                        const ageRatingText = details.adult ? "18+" : "Non-Adult";
                        const runtime = details.runtime ? `${details.runtime} min` : 'N/A';

                        // Create movie card HTML
                        let movieCardHTML = `
                            <div class="movie-card" data-movie-id="${movie.id}">
                                <img src="http://image.tmdb.org/t/p/w500/${movie.poster_path}" class="img-responsive" alt="${movie.title}" />
                                <p class="d-flex align-items-center">
                                    <strong>${movie.title}</strong>`;

                        // Add "Add to Bookmark" icon if `showRemoveSVG` is false
                        if (!showRemoveSVG) {
                            movieCardHTML += `
                                <svg class="add-to-bookmark" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                                    <line x1="12" x2="12" y1="7" y2="13"/>
                                    <line x1="15" x2="9" y1="10" y2="10"/>
                                </svg>`;
                        } else {
                            // Add "Remove" icon
                            movieCardHTML += `
                                <svg class="remove-movie" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                                    <line x1="15" x2="9" y1="10" y2="10"/>
                                </svg>`;
                        }

                        movieCardHTML += `
                                </p>
                                <div class="info-buttons">
                                    <span class="year-button">${new Date(details.release_date).getFullYear() || 'N/A'}</span>
                                    <span class="age-rating-button">${ageRatingText}</span>
                                    <span class="runtime-button">${runtime}</span>
                                </div>
                            </div>`;

                        $(targetContainer).append(movieCardHTML);

                        // Add bookmark functionality
                        if (!showRemoveSVG) {
                            $(targetContainer).find('.add-to-bookmark').last().on('click', function() {
                                if (!bookmarks.includes(movie.id)) {
                                    bookmarks.push(movie.id);
                                    alert(`Added "${movie.title}" to bookmarks!`);
                                } else {
                                    alert(`"${movie.title}" is already bookmarked.`);
                                }
                            });
                        } else {
                            // Add remove functionality
                            $(targetContainer).find('.remove-movie').last().on('click', function() {
                                $(this).closest('.movie-card').remove();

                                // If no movies left in #poster-4
                                if ($('#poster-4 .movie-card').length === 0) {
                                    $('#poster-4').html('<p class="no-movies">Nothing to show here :(</p>');
                                }
                            });
                        }
                    });
                }

                // Fetch details for movies in #poster-4 (with remove icon)
                randomMovies4.forEach(movie => fetchMovieDetails(movie, '#poster-4', true));

                // Fetch details for movies in #poster-20 (with add-to-bookmark icon)
                randomMovies20.forEach(movie => {
                    if (movie.poster_path) {
                        fetchMovieDetails(movie, '#poster-20', false);
                    }
                });
            } else {
                $('#poster-4').html('<div class="alert"><p>No movies found.</p></div>');
                $('#poster-20').html('<div class="alert"><p>No movies found.</p></div>');
            }
        }); 
    });
});