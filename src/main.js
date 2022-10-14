//! Using fetch
// const APIMovies = 'https://api.themoviedb.org/3';
// const APIMoviesTrendingDay = `${APIMovies}/trending/movie/day` + api_key;
// const APIMoviesCategories = `${APIMovies}/genre/movie/list` + api_key + '&language=es';

//! Using Axios
const APIMovies = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    params: {
        'api_key': api_key,
        // 'language': 'es',
    },
});

const APIUrlImgW300 = 'https://image.tmdb.org/t/p/w300';
const APIUrlImgW500 = 'https://image.tmdb.org/t/p/w500';

function likedMoviesList() {
    const item = JSON.parse(localStorage.getItem('liked_movies'));
    let movies;

    if (item) {
        movies = item;
    } else {
        movies = {};
    }
    return movies;
}

function likeMovie(movie) {
    const likedMovies = likedMoviesList();
    if (likedMovies[movie.id]) {
        likedMovies[movie.id] = undefined;
    } else {
        likedMovies[movie.id] = movie;        
    }

    localStorage.setItem('liked_movies', JSON.stringify(likedMovies));
    // getCategoriesPreview();
    // getLikedMovies();
}

//! Funciones utiles

// const lazyLoader = new IntersectionObserver(callback/*,  options */) //! No se envia el parametro options para observar todo el HTML
const lazyLoader = new IntersectionObserver((movies) => {
    // console.log(movies);
    movies.forEach((movie) => {
        // console.log(movie);
        if (movie.isIntersecting) {
            const urlImageMovie = movie.target.getAttribute('data-img');
            movie.target.setAttribute('src', urlImageMovie);            
        }
    })
});

function createMovies(movies, container, {lazyLoad = false, clean = true}) {
    if (clean) {
        container.innerHTML = '';
    }

    movies.forEach(movie => {        
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');
        movieContainer.setAttribute('data-id', movie.id)

        const movieImg = document.createElement('img')
        movieImg.classList.add('movie-img')
        movieImg.setAttribute('alt', movie.title)
        movieImg.setAttribute((lazyLoad) ? 'data-img' : 'src' , `${APIUrlImgW300}${movie.poster_path}`) 
        movieImg.addEventListener('error', () => movieImg.setAttribute('src', `https://via.placeholder.com/150x225/5c218a/ffffff?text=${movie.title}`))

        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn');

        likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked')

        movieBtn.addEventListener('click', () => {
            movieBtn.classList.toggle('movie-btn--liked');
            likeMovie(movie);
            homePage();
        });

        container.append(movieContainer);
        movieContainer.append(movieImg);
        movieContainer.append(movieBtn);

        movieImg.addEventListener('click', () => {
            location.hash = '#movie=' + movie.id
        });

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        }
    });
}

function createCategories(categories, container) {
    container.innerHTML = '';

    categories.forEach(category => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');
    
        const categoryTitle = document.createElement('h3')
        categoryTitle.classList.add('category-title')
        categoryTitle.setAttribute('id', `id${category.id}`)
    
        const categoryTitleText = document.createTextNode(category.name)
    
        container.append(categoryContainer);
        categoryContainer.append(categoryTitle);
        categoryTitle.append(categoryTitleText)
    
        categoryTitle.addEventListener('click', () => location.hash = `#category=${category.id}-${category.name}`);
                
    });
}

//! LLamados a la API

async function getMoviesTrendingDayPreview() {
    const {data} = await APIMovies('/trending/movie/day');
    const movies = data.results;
    // console.log(movies);
    createMovies(movies, trendingMoviesPreviewList, true);    
}

async function getMoviesTrendingDay() {
    const {data} = await APIMovies('/trending/movie/day');
    const movies = data.results;
    maxPage = data.total_pages;
    // console.log(movies);
    createMovies(movies, genericSection, {lazyLoad: true, clean: true});
}

async function getPagesMoviesTrendingDay() {

    const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    // console.log(scrollIsBottom);
    const pagaIsNotMax = page < maxPage;

    if (scrollIsBottom && pagaIsNotMax) {
        
        const {data} = await APIMovies('/trending/movie/day', {
            params: {
                page: ++page,
            }
        });
        const movies = data.results;
        // console.log(movies);
        createMovies(movies, genericSection, {lazyLoad: true, clean: false});    
    }
}

async function getCategoriesPreview() {
    const {data} = await APIMovies('/genre/movie/list');
    const categories = data.genres;
    // console.log(categories);
    createCategories(categories, categoriesPreviewList)
}

async function getMoviesByCategory(id) {
    const {data} = await APIMovies('/discover/movie', {
        params: {
            with_genres: id,
        }
    });
    const movies = data.results;
    maxPage = data.total_pages;
    // console.log(movies);
    createMovies(movies, genericSection, {lazyLoad: true});    
}

function getPagesByCategory(id) {
    return async function () {
        const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
        // console.log(scrollIsBottom);
        const pagaIsNotMax = page < maxPage;

        if (scrollIsBottom && pagaIsNotMax) {
            
            const {data} = await APIMovies('/discover/movie', {
                params: {
                    with_genres: id,
                    page: ++page,
                }
            });
            const movies = data.results;
            // console.log(movies);
            createMovies(movies, genericSection, {lazyLoad: true, clean: false});    
        }
    }    
}

async function getMoviesByQuery(query) {
    const {data} = await APIMovies('/search/movie', {
        params: {
            query: query,
        }
    });
    const movies = data.results;
    // console.log(movies);
    maxPage = data.total_pages;
    // console.log(movies);
    createMovies(movies, genericSection, true);
}

function getPagesMoviesByQuery(query) {
    return async function () {
        const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
        // console.log(scrollIsBottom);
        const pagaIsNotMax = page < maxPage;

        if (scrollIsBottom && pagaIsNotMax) {
            
            const {data} = await APIMovies('/search/movie', {
                params: {
                    query: query,
                    page: ++page,
                }
            });
            const movies = data.results;
            // console.log(movies);
            createMovies(movies, genericSection, {lazyLoad: true, clean: false});    
        }
    }    
}

async function getMovieById(id) {
    const {data: movie} = await APIMovies(`/movie/${id}`);
    // console.log(movie);
    const movieImgURL = APIUrlImgW500 + movie.poster_path;

    headerSection.style.background = `
        linear-gradient(180deg, 
            rgba(0, 0, 0, 0.35) 19.27%, 
            rgba(0, 0, 0, 0) 29.17%),
        url(${movieImgURL})
        `;
    movieDetailTitle.textContent = movie.original_title;
    movieDetailScore.textContent = movie.vote_average;
    movieDetailDescription.textContent = movie.overview;
    
    createCategories(movie.genres, movieDetailCategoriesList)

    getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id) {
    const {data} = await APIMovies(`/movie/${id}/similar`);
    const relatedMovies = data.results;
    // console.log(relatedMovies);
    createMovies(relatedMovies, relatedMoviesContainer, true); 
}

function getLikedMovies(movie) {
    const likedMovies = likedMoviesList();
    const moviesArray = Object.values(likedMovies);

    createMovies(moviesArray, likedMoviesListArticle, {lazyLoad: true, clean: true})
}   