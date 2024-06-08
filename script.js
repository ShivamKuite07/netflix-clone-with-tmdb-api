// script.js

const apiKey = '431fd968a8c2d99c1df7694398d8bb2a';


document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchTerm = document.getElementById('searchInput').value;
            if (searchTerm) {
                searchMedia(searchTerm);
            }
        });
    } else {
        console.log('searchButton element not found');
    }

    async function searchMedia(query) {
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${query}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            displayResults(data.results);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function displayResults(results) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '';

        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.classList.add('result');
            resultElement.dataset.id = result.id;
            resultElement.dataset.mediaType = result.media_type;

            const resultTitle = document.createElement('h2');
            resultTitle.textContent = result.title || result.name;

            const resultPoster = document.createElement('img');
            if (result.poster_path) {
                resultPoster.src = `https://image.tmdb.org/t/p/w200${result.poster_path}`;
                resultPoster.alt = `${result.title || result.name} Poster`;
            } else {
                resultPoster.alt = 'No image available';
                resultPoster.src = './assets/images/poster-404.jpg';
            }

            // resultElement.appendChild(resultTitle);
            resultElement.setAttribute('title', result.title || result.name);
            resultElement.appendChild(resultPoster);
            resultsContainer.appendChild(resultElement);

            resultElement.addEventListener('click', () => {
                window.location.href = `details.html?id=${result.id}&media_type=${result.media_type}`;
            });
        });
    }

    async function fetchDetails(mediaId, mediaType) {
        const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}&append_to_response=credits,reviews`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            displayDetails(data, mediaType);
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    }

    function displayDetails(details, mediaType) {
        const detailsContainer = document.getElementById('details');
        const extraInfoContainer = document.getElementById('extraInfo');

        // Set backdrop image
        const backdropContainer = document.getElementById('backdropContainer');
        if (details.backdrop_path) {
            backdropContainer.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${details.backdrop_path})`;
        } else {
            backdropContainer.style.backgroundColor = '#000';
        }

        detailsContainer.innerHTML = '';
        extraInfoContainer.innerHTML = '';

        const title = document.createElement('h1');
        title.textContent = details.title || details.name;

        const summary = document.createElement('p');
        summary.textContent = details.overview;

        const rating = document.createElement('p');
        rating.textContent = `Rating: ${details.vote_average}`;

        const year = document.createElement('p');
        year.textContent = `Release Year: ${details.release_date || details.first_air_date}`;

        const genres = document.createElement('p');
        genres.textContent = `Genres: ${details.genres.map(genre => genre.name).join(', ')}`;

        const additionalInfo = document.createElement('p');
        additionalInfo.innerHTML = `<span>${details.release_date ? new Date(details.release_date).getFullYear() : ''}</span> | <span>Maturity rating: 13+</span> | <span>${details.runtime || details.episode_run_time ? `${details.runtime || details.episode_run_time[0]}m` : ''}</span> | <span>${details.genres.map(genre => genre.name).join(', ')}</span>`;

        const castList = document.createElement('p');
        if (details.credits && details.credits.cast) {
            const castNames = details.credits.cast.slice(0, 3).map(actor => actor.name).join(', ');
            castList.textContent = `Starring: ${castNames}`;
        }

        const reviewList = document.createElement('ul');
        if (details.reviews && details.reviews.results) {
            details.reviews.results.forEach(review => {
                const reviewItem = document.createElement('li');
                reviewItem.textContent = review.content;
                reviewList.appendChild(reviewItem);
            });
        }

        detailsContainer.appendChild(title);
        detailsContainer.appendChild(additionalInfo);
        detailsContainer.appendChild(summary);
        detailsContainer.appendChild(castList);

        if (mediaType === 'tv') {
            const seasons = document.createElement('p');
            seasons.textContent = `Seasons: ${details.number_of_seasons}`;
            detailsContainer.appendChild(seasons);

            const creators = document.createElement('p');
            creators.textContent = `Creators: ${details.created_by.map(creator => creator.name).join(', ')}`;
            detailsContainer.appendChild(creators);
        }

        extraInfoContainer.appendChild(rating);
        extraInfoContainer.appendChild(year);
        extraInfoContainer.appendChild(genres);

        const castHeader = document.createElement('h2');
        castHeader.textContent = 'Cast';
        extraInfoContainer.appendChild(castHeader);
        extraInfoContainer.appendChild(castList);

        const reviewHeader = document.createElement('h2');
        reviewHeader.textContent = 'Reviews';
        extraInfoContainer.appendChild(reviewHeader);
        extraInfoContainer.appendChild(reviewList);
    }

    function getMediaDetailsFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            id: urlParams.get('id'),
            mediaType: urlParams.get('media_type')
        };
    }

    if (window.location.pathname.includes('details.html')) {
        const { id, mediaType } = getMediaDetailsFromUrl();
        if (id && mediaType) {
            fetchDetails(id, mediaType);
        } else {
            console.error('No media ID or type found in URL.');
        }
    }
});
