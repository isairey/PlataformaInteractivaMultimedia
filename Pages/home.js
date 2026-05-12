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

//Carousel
let currentIndex = 0;

// Function to move the slide and update the active dot
function moveSlide(direction) {
    const items = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');
    const totalItems = items.length;

    // Remove active class from the current item and dot
    items[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');

    // Calculate new index
    currentIndex += direction;

    // Wrap around if index goes out of bounds
    if (currentIndex < 0) {
        currentIndex = totalItems - 1;
    } else if (currentIndex >= totalItems) {
        currentIndex = 0;
    }

    // Add active class to the new item and dot
    items[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
}

// Initially display the first item and dot
document.querySelectorAll('.carousel-item')[currentIndex].classList.add('active');
document.querySelectorAll('.dot')[currentIndex].classList.add('active');

// Function to update slide when dot is clicked
function currentSlide(n) {
    showSlide(n - 1); // Adjust to 0-based index
}

// Function to show a specific slide
function showSlide(n) {
    const items = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');

    // Remove active class from all items and dots
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('active');
        dots[i].classList.remove('active');
    }

    // Add active class to the selected item and dot
    items[n].classList.add('active');
    dots[n].classList.add('active');

    // Update the current index
    currentIndex = n;
}

// Function to automatically move the slide every 5 seconds
function autoMoveSlide() {
    moveSlide(1); // Move to the next slide
}

// Set interval for automatic slide change (e.g., every 5 seconds)
setInterval(autoMoveSlide, 5000); // Change slides every 5000 milliseconds (5 seconds)

// Dropdown.......................................................................................................................................................................................................
// Get all the buttons inside the dropdown
const buttons = document.querySelectorAll('.dropdown-content button');

// Object to store the original and clicked text for each button
const buttonText = {
    'like': { 
        original: 'Like', 
        clicked: 'Liked', 
        clickedImg: '../assets/icons/thumbs_up_filled.png', 
        originalImg: '../assets/icons/thumbs_up_outline.png' },

    'dislike': { 
        original: 'Dislike', 
        clicked: 'Disliked', 
        clickedImg: '../assets/icons/thumbs_down_filled.png', 
        originalImg: '../assets/icons/thumbs_down_outline.png' },

    'love_this': { 
        original: 'Love this', 
        clicked: 'Loved this', 
        clickedImg: '../assets/icons/heart_filled.png', 
        originalImg: '../assets/icons/heart_outline.png' },

    'download': { 
        original: 'Download', 
        clicked: 'Downloaded', 
        clickedImg: '../assets/icons/download_filled.png', 
        originalImg: '../assets/icons/download_outline.png' }
};

// Add click event listener to each button
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const buttonClass = button.classList[0]; // Get the button's class

        // Check if the button is already active
        if (button.classList.contains('active')) {
            // Remove 'active' class and reset text and image to original
            button.classList.remove('active');
            button.querySelector('div').textContent = buttonText[buttonClass].original;
            button.querySelector('img').src = buttonText[buttonClass].originalImg;
        } else {
            // Remove 'active' class from all buttons and reset text and images to original
            buttons.forEach(btn => {
                btn.classList.remove('active');
                const btnClass = btn.classList[0]; // Get the button's class
                btn.querySelector('div').textContent = buttonText[btnClass].original;
                btn.querySelector('img').src = buttonText[btnClass].originalImg;
            });

            // Add 'active' class to the clicked button and change the text and image
            button.classList.add('active');
            button.querySelector('div').textContent = buttonText[buttonClass].clicked;
            button.querySelector('img').src = buttonText[buttonClass].clickedImg;
        }
    });
});

document.querySelector('.view_more').addEventListener('click', function() {
    var moreContent = document.querySelector('.more_content');
    var viewMoreButton = this;

    // Toggle content visibility
    if (moreContent.style.display === "none") {
        moreContent.style.display = "block";
        viewMoreButton.textContent = "View Less";  // Change button text
        viewMoreButton.classList.add('active');    // Add active class for styling
    } else {
        moreContent.style.display = "none";
        viewMoreButton.textContent = "View More";  // Revert button text
        viewMoreButton.classList.remove('active'); // Remove active class
    }
});

document.querySelector('.view_more').addEventListener('click', function() {
    var moreContent = document.querySelector('.more_content');
    var viewMoreButton = this;

    // Toggle content visibility with animation
    if (moreContent.classList.contains('open')) {
        moreContent.classList.remove('open');
        viewMoreButton.textContent = "View More";
        viewMoreButton.classList.remove('active');
    } else {
        moreContent.classList.add('open');
        viewMoreButton.textContent = "View Less";
        viewMoreButton.classList.add('active');
    }
});

$(document).ready(function() {
    const apiKey = '165da49bc464981d104d3ca429f44d75';
    const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc`;
    const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;

    let bookmarks = []; // Store bookmarked movie IDs

    // Fetch genres
    $.getJSON(genreUrl, function(genreJson) {
        // Fetch movies
        $.getJSON(apiUrl, function(json) {
            if (json.results.length > 0) {
                $('#poster-20').empty();
                let randomMovies20 = json.results.sort(() => 0.5 - Math.random()).slice(0, 20);

                // Function to fetch and display movie details for #poster-20
                function fetchMovieDetails(movie, targetContainer) {
                    const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=en-US`;

                    $.getJSON(movieDetailsUrl, function(details) {
                        const ageRatingText = details.adult ? "18+" : "Adult";
                        const runtime = details.runtime ? `${details.runtime} min` : 'N/A';

                        // Create movie card HTML
                        let movieCardHTML = `
                            <div class="movie-card" data-movie-id="${movie.id}">
                                <img src="http://image.tmdb.org/t/p/w500/${movie.poster_path}" class="img-responsive" alt="${movie.title}" />
                                <p class="d-flex align-items-center">
                                    <strong>${movie.title}</strong>
                                    <svg class="add-to-bookmark" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

                        $(targetContainer).append(movieCardHTML);

                        // Add bookmark functionality
                        $(targetContainer).find('.add-to-bookmark').last().on('click', function() {
                            if (!bookmarks.includes(movie.id)) {
                                bookmarks.push(movie.id);
                                alert(`Added "${movie.title}" to bookmarks!`);
                            } else {
                                alert(`"${movie.title}" is already bookmarked.`);
                            }
                        });
                    });
                }

                // Fetch details for movies in #poster-20
                randomMovies20.forEach(movie => {
                    if (movie.poster_path) {
                        fetchMovieDetails(movie, '#poster-20');
                    }
                });
            } else {
                $('#poster-20').html('<div class="alert"><p>No movies found.</p></div>');
            }
        });
    });
});

document.querySelector('.view_more').addEventListener('click', function() {
    var moreContent = document.querySelector('.more_content');
    var viewMoreButton = this;

    // Toggle content visibility
    if (moreContent.style.display === "none") {
        moreContent.style.display = "block";
        viewMoreButton.textContent = "View Less";  // Change button text
        viewMoreButton.classList.add('active');    // Add active class for styling
    } else {
        moreContent.style.display = "none";
        viewMoreButton.textContent = "View More";  // Revert button text
        viewMoreButton.classList.remove('active'); // Remove active class
    }
});

document.querySelector('.view_more').addEventListener('click', function() {
    var moreContent = document.querySelector('.more_content');
    var viewMoreButton = this;

    // Toggle content visibility with animation
    if (moreContent.classList.contains('open')) {
        moreContent.classList.remove('open');
        viewMoreButton.textContent = "View More";
        viewMoreButton.classList.remove('active');
    } else {
        moreContent.classList.add('open');
        viewMoreButton.textContent = "View Less";
        viewMoreButton.classList.add('active');
    }
});


