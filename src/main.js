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
        'language': 'es',
    },
});

const APIUrlImgW300 = 'https://image.tmdb.org/t/p/w300';

async function getMoviesTrendingDayPreview() {
    trendingMoviesPreviewList.innerHTML = '';
    const {data} = await APIMovies('/trending/movie/day');
    const movies = data.results;
    // console.log(movies);
    movies.forEach(movie => {        
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');

        const movieImg = document.createElement('img')
        movieImg.classList.add('movie-img')
        movieImg.setAttribute('alt', movie.title)
        movieImg.setAttribute('src', `${APIUrlImgW300}${movie.poster_path}`) 

        trendingMoviesPreviewList.append(movieContainer);
        movieContainer.append(movieImg)
    });
}

async function getCategoriesPreview() {
    categoriesPreviewList.innerHTML = '';
    const {data} = await APIMovies('/genre/movie/list');
    const categories = data.genres;
    // console.log(categories);
    categories.forEach(category => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        const categoryTitle = document.createElement('h3')
        categoryTitle.classList.add('category-title')
        categoryTitle.setAttribute('id', `id${category.id}`)

        const categoryTitleText = document.createTextNode(category.name)

        categoriesPreviewList.append(categoryContainer);
        categoryContainer.append(categoryTitle);
        categoryTitle.append(categoryTitleText)

        categoryTitle.addEventListener('click', () => location.hash = `#category=${category.id}-${category.name}`);
    });
}

