// Your API key
const apiKey = '165da49bc464981d104d3ca429f44d75';

// Fetch popular movie IDs from TMDb
fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        const movieIds = data.results.map(movie => movie.id);
        console.log(movieIds); // Array of popular movie IDs
        // Fetch individual movie data using the array
        fetchMovieData(movieIds);
    })
    .catch(error => console.error('Error fetching data:', error));

// Fetch and display movie data
function fetchMovieData(movieIds) {
    const randomIndex = Math.floor(Math.random() * movieIds.length);
    const movieId = movieIds[randomIndex];
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('movie-title').textContent = data.title;
            document.getElementById('genre').textContent = data.genres.map(genre => genre.name).join(', ');
            document.getElementById('rating').textContent = data.vote_average; 
            document.getElementById('duration').textContent = `${data.runtime} minutes`;
            document.getElementById('release-date').textContent = data.release_date;
            document.getElementById('description').textContent = data.overview;
            // Generate YouTube trailer URL (assuming data includes trailer information)
            document.getElementById('trailer').src = `https://www.youtube.com/embed/${data.trailer_id}`; // Replace with actual trailer ID key if available
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Track the current page for pagination
let currentPage = 1;

// Function to create a movie card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const img = document.createElement('img');
    img.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
    img.alt = movie.title;
    card.appendChild(img);
    return card;
}

// Fetch movies and populate cards
function fetchMovies(page) {
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`)
        .then(response => response.json())
        .then(data => {
            const movies = data.results;
            const movieCardsContainer = document.getElementById('movie-cards');
            movies.forEach(movie => {
                const movieCard = createMovieCard(movie);
                movieCardsContainer.appendChild(movieCard);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Initial load of movies
fetchMovies(currentPage);

// Load more movies when the "View More" button is clicked
function loadMoreMovies() {
    currentPage++;
    fetchMovies(currentPage);
}

// Call the function to fetch and display random movie data on page load
window.onload = () => {
    fetchMovies(currentPage);
    fetchMovieData();
};