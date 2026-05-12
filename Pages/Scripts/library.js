// Initialize when the document is fully loaded
$(document).ready(function() {
    const apiKey = '165da49bc464981d104d3ca429f44d75';
    const apiUrlBase = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&with_genres=`;
    const genreApiUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;

    let genreList = [];
    let currentGenreIndex = 0;
    let genreMoviesMap = {};
    let genreMovieIndexMap = {};
    let selectedGenreId = '';
    let moviesPerLoad = 12;

    let genrePageMap = {};
    let genreTotalPagesMap = {};

    let bookmarks = [];

    let slideshowIndex = 0;
    let slideshowInterval;

  

    // Fetch movies to display in the slideshow
    function fetchSlideshowMovies() {
        const slideshowApiUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`;
        $.getJSON(slideshowApiUrl, function(response) {
            const movies = response.results.slice(5, 10); // Get the first 3 movies
            displaySlideshowMovies(movies);
        }).fail(function() {
            console.error("Slideshow movies couldn't be loaded.");
        });
    }

    // Display fetched movies in the slideshow
    function displaySlideshowMovies(movies) {
        const slideshowInner = $('#slideshow-inner');
        const slideshowDots = $('#slideshow-dots');
        slideshowInner.empty();
        slideshowDots.empty();

        movies.forEach((movie, index) => {
            const imageUrl = movie.backdrop_path
                ? `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`
                : `https://image.tmdb.org/t/p/original/${movie.poster_path}`;
            const slide = `<div class="slide"><img src="${imageUrl}" alt="${movie.title}"></div>`;
            slideshowInner.append(slide);
            const dot = `<span class="slideshow-dot${index === 0 ? ' active' : ''}" data-index="${index}"></span>`;
            slideshowDots.append(dot);
        });

        startSlideshow();
    }

    // Begin the slideshow rotation
    function startSlideshow() {
        const slides = $('.slide');
        const dots = $('.slideshow-dot');
        slideshowInterval = setInterval(function() {
            slideshowIndex = (slideshowIndex + 1) % slides.length;
            updateSlideshow(slideshowIndex);
        }, 5000); // Switch slides every 5 seconds

        // Allow users to navigate to a specific slide by clicking a dot
        dots.click(function() {
            clearInterval(slideshowInterval);
            slideshowIndex = $(this).data('index');
            updateSlideshow(slideshowIndex);
            startSlideshow(); // Restart the slideshow interval
        });
    }

    // Update the slideshow to show the selected slide
    function updateSlideshow(index) {
        const slideshowInner = $('#slideshow-inner');
        const dots = $('.slideshow-dot');

        slideshowInner.css('transform', `translateX(-${index * 100}%)`);
        dots.removeClass('active');
        dots.eq(index).addClass('active');
    }

    // Initiate the slideshow fetch
    fetchSlideshowMovies();

    // Retrieve and display detailed information for a specific movie
    function fetchMovieDetails(movie, callback) {
        const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=en-US`;

        $.getJSON(movieDetailsUrl, function(details) {
            const ageRatingText = details.adult ? "18+" : "All Ages";
            const runtime = details.runtime ? `${details.runtime} min` : 'N/A';

            let movieCardHTML = `
                <div class="movie-card" data-movie-id="${movie.id}">
                    <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}" />
                    <p>
                        <strong>${movie.title}</strong>
                        <svg class="add-to-bookmark" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                            <line x1="12" x2="12" y1="7" y2="13"/>
                            <line x1="15" x2="9" y1="10" y2="10"/>
                        </svg>
                    </p>
                    <div class="info-buttons">
                        <span class="year-button">${new Date(details.release_date).getFullYear() || 'N/A'}</span>
                        <span class="age-rating-button">${ageRatingText}</span>
                        <span class="runtime-button">${runtime}</span>
                    </div>
                </div>`;
            callback(movieCardHTML);
        });
    }

    // Fetch the list of all movie genres
    function fetchAllGenres() {
        return $.getJSON(genreApiUrl)
            .then(function(response) {
                genreList = response.genres;
                populateGenreDropdown();
                loadGenres();
            })
            .fail(function() {
                console.error("Couldn't retrieve genres.");
            });
    }

    // Populate the genre filter dropdown with fetched genres
    function populateGenreDropdown() {
        const genreDropdown = $('#genre-filter');
        genreDropdown.empty();
        genreDropdown.append(new Option('All Genres', ''));
        genreList.forEach(genre => {
            genreDropdown.append(new Option(genre.name, genre.id));
        });
    }

    // Load initial set of genres and their corresponding movies
    function loadGenres() {
        const container = $('#movie-sections');
        for (let i = 0; i < 3; i++) { // Display the first 3 genres by default
            if (currentGenreIndex >= genreList.length) {
                $('#load-more').prop('disabled', true).hide();
                return;
            }
            const genre = genreList[currentGenreIndex];
            const genreContainerId = `genre-${genre.id}`;
            genreMovieIndexMap[genre.id] = 0;
            const genreHTML = `
                <h1 class="genre-title">${genre.name}</h1>
                <div class="slider">
                    <button class="prev" data-genre-id="${genre.id}">&#10094;</button>
                    <div id="${genreContainerId}" class="poster-row"></div>
                    <button class="next" data-genre-id="${genre.id}">&#10095;</button>
                </div>
            `;
            container.append(genreHTML);
            fetchMoviesByGenre(genre.id, function() {
                displaySliderMovies(genre.id, `#${genreContainerId}`, genreMovieIndexMap[genre.id]);
            });
            currentGenreIndex++;
        }
    }

    // Fetch movies belonging to a specific genre
    function fetchMoviesByGenre(genreId, callback) {
        const page = genrePageMap[genreId] || 1;
        $.getJSON(`${apiUrlBase}${genreId}&page=${page}`, function(json) {
            if (!genreMoviesMap[genreId]) {
                genreMoviesMap[genreId] = [];
            }
            genreMoviesMap[genreId] = genreMoviesMap[genreId].concat(json.results || []);
            genreTotalPagesMap[genreId] = json.total_pages;
            callback();
        }).fail(function() {
            alert('Unable to fetch movies at this time.');
        });
    }

    // Display movies within the slider for a specific genre
    function displaySliderMovies(genreId, containerSelector, startIndex) {
        const movies = genreMoviesMap[genreId];
        if (movies && movies.length > 0) {
            const moviesToShow = movies.slice(startIndex, startIndex + 20); // Limit to 20 movies
            let moviesHtml = '';

            let moviesProcessed = 0;
            moviesToShow.forEach(movie => {
                if (movie.poster_path) {
                    fetchMovieDetails(movie, function(movieCardHTML) {
                        moviesHtml += `<div class="poster-item">${movieCardHTML}</div>`;
                        moviesProcessed++;
                        if (moviesProcessed === moviesToShow.length) {
                            $(containerSelector).html(moviesHtml);

                            // Enable bookmarking functionality for each movie
                            $(containerSelector).find('.add-to-bookmark').each(function() {
                                const movieId = $(this).closest('.movie-card').data('movie-id');
                                $(this).on('click', function() {
                                    const movieTitle = $(this).closest('.movie-card').find('strong').text();
                                    if (!bookmarks.includes(movieId)) {
                                        bookmarks.push(movieId);
                                        alert(`Added "${movieTitle}" to your bookmarks!`);
                                    } else {
                                        alert(`"${movieTitle}" is already in your bookmarks.`);
                                    }
                                });
                            });
                        }
                    });
                } else {
                    moviesProcessed++;
                }
            });
        } else {
            $(containerSelector).html('<div class="alert"><p>No movies available for this genre.</p></div>');
        }
    }

    // Scroll the slider to show the next set of movies
    function loadNextMovies(genreId, containerSelector) {
        const posterRow = $(containerSelector);
        const movieCardWidth = posterRow.find('.poster-item').outerWidth(true);
        posterRow.animate({ scrollLeft: '+=' + movieCardWidth }, 0);
    }

    // Scroll the slider to show the previous set of movies
    function loadPreviousMovies(genreId, containerSelector) {
        const posterRow = $(containerSelector);
        const movieCardWidth = posterRow.find('.poster-item').outerWidth(true);
        posterRow.animate({ scrollLeft: '-=' + movieCardWidth }, 0);
    }

    // Display movies in a grid layout when a genre is selected
    function displayGridMovies(genreId, containerSelector) {
        const movies = genreMoviesMap[genreId];
        if (movies && movies.length > 0) {
            const startIndex = genreMovieIndexMap[genreId] || 0;
            const moviesPerRow = 4;
            const rowsToLoad = 3;
            const moviesToLoad = moviesPerRow * rowsToLoad;
            const endIndex = startIndex + moviesToLoad;
            const moviesToShow = movies.slice(startIndex, endIndex);

            let moviesHtml = '';
            let moviesProcessed = 0;

            moviesToShow.forEach(movie => {
                if (movie.poster_path) {
                    fetchMovieDetails(movie, function(movieCardHTML) {
                        moviesHtml += `<div class="grid-item">${movieCardHTML}</div>`;
                        moviesProcessed++;
                        if (moviesProcessed === moviesToShow.length) {
                            $(containerSelector).append(moviesHtml);
                            genreMovieIndexMap[genreId] = endIndex;

                            // Enable bookmarking functionality for each movie in the grid
                            $(containerSelector).find('.add-to-bookmark').each(function() {
                                const movieId = $(this).closest('.movie-card').data('movie-id');
                                $(this).on('click', function() {
                                    const movieTitle = $(this).closest('.movie-card').find('strong').text();
                                    if (!bookmarks.includes(movieId)) {
                                        bookmarks.push(movieId);
                                        alert(`Added "${movieTitle}" to your bookmarks!`);
                                    } else {
                                        alert(`"${movieTitle}" is already in your bookmarks.`);
                                    }
                                });
                            });

                            // Manage the visibility of the "Load More" button
                            if (endIndex >= movies.length && genrePageMap[genreId] >= genreTotalPagesMap[genreId]) {
                                $('#load-more').hide();
                            } else {
                                $('#load-more').show();
                            }
                        }
                    });
                } else {
                    moviesProcessed++;
                }
            });

            // Fetch additional pages if needed
            if (endIndex >= movies.length && genrePageMap[genreId] < genreTotalPagesMap[genreId]) {
                genrePageMap[genreId]++;
                fetchMoviesByGenre(genreId, function() {});
            }
        } else {
            $(containerSelector).html('<div class="alert"><p>No movies available for this genre.</p></div>');
            $('#load-more').hide();
        }
    }

    // Load more movies based on the selected genre or initial genres
    function loadFilteredGenre(genreId, isLoadMore = false) {
        const container = $('#movie-sections');
        const genre = genreList.find(g => g.id == genreId);

        if (!isLoadMore) {
            genreMovieIndexMap[genre.id] = 0;
            genrePageMap[genre.id] = 1;
            container.empty();
        }

        const genreContainerId = `genre-${genre.id}-grid`;

        if (!isLoadMore) {
            container.append(`<div id="${genreContainerId}" class="movie-grid"></div>`);
        }

        fetchMoviesByGenre(genre.id, function() {
            displayGridMovies(genre.id, `#${genreContainerId}`);
        });
    }

    // Handle clicks on the "Next" button in sliders
    $(document).on('click', '.next', function() {
        const genreId = $(this).data('genre-id');
        const containerSelector = `#genre-${genreId}`;
        loadNextMovies(genreId, containerSelector);
    });

    // Handle clicks on the "Previous" button in sliders
    $(document).on('click', '.prev', function() {
        const genreId = $(this).data('genre-id');
        const containerSelector = `#genre-${genreId}`;
        loadPreviousMovies(genreId, containerSelector);
    });

    // Event listener for the "Load More" button
    $('#load-more').click(function() {
        if (selectedGenreId) {
            loadFilteredGenre(selectedGenreId, true);
        } else {
            loadGenres();
        }
        // Smoothly scroll to the bottom after loading more content
        $('html, body').animate({
            scrollTop: $(document).height()
        }, 500);
    });

    // Event listener for changes in the genre filter dropdown
    $('#genre-filter').change(function() {
        selectedGenreId = $(this).val();
        $('#movie-sections').empty();
        currentGenreIndex = 0;
        if (selectedGenreId) {
            genreMovieIndexMap[selectedGenreId] = 0;
            genrePageMap[selectedGenreId] = 1;
            $('#load-more').show();
            loadFilteredGenre(selectedGenreId);
        } else {
            $('#load-more').show();
            loadGenres();
        }
    });

    // Functionality for the "Back to Top" button
    var backToTopBtn = $('#back-to-top');

    // Show or hide the "Back to Top" button based on scroll position
    $(window).scroll(function() {
        if ($(window).scrollTop() > 300) {
            backToTopBtn.fadeIn();
        } else {
            backToTopBtn.fadeOut();
        }
    });

    // Scroll back to the top smoothly when the button is clicked
    backToTopBtn.click(function() {
        $('html, body').animate({ scrollTop: 0 }, 100);
    });

    // Initiate the genre fetching process
    fetchAllGenres();
});
