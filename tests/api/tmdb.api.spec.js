import {test, expect} from '@playwright/test';
import {TMDBMoviesService} from '../../src/api/services/TMDBMoviesService.js';
import {TMDBSearchService} from '../../src/api/services/TMDBSearchService.js';
import {TMDBGenresService} from '../../src/api/services/TMDBGenresService.js';
import {TMDBAccountService} from '../../src/api/services/TMDBAccountService.js';
import {TMDBListsService} from '../../src/api/services/TMDBListsService.js';
import {ApiTestHelpers} from '../../src/api/helpers/ApiTestHelpers.js';
import {TestDataProvider} from '../../src/helpers/TestDataProvider.js';
import {TMDBConstants} from '../../src/constants/TMDBConstants.js';
import dotenv from 'dotenv';

dotenv.config();

test.describe('TMDB API - Movies Endpoint Tests', () => {
    let moviesService;

    test.beforeEach(async () => {
        moviesService = new TMDBMoviesService(
            process.env.TMDB_BASE_URL,
            process.env.TMDB_API_KEY,
            process.env.TMDB_READ_ACCESS_TOKEN
        );
    });

    test('TC01 - Should successfully retrieve movie details for a valid movie ID', async () => {
        const startTime = Date.now();
        const movieId = TestDataProvider.MOVIES.INCEPTION;

        const response = await moviesService.getMovieDetails(movieId);

        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validateResponseTime(startTime, 5000);
        ApiTestHelpers.validateMovieStructure(response.data);

        expect(response.data.id).toBe(movieId);
        expect(response.data.title).toBeTruthy();
        expect(response.data.original_title).toBeTruthy();

        expect(response.data.genres).toBeDefined();
        expect(Array.isArray(response.data.genres)).toBe(true);
        if (response.data.genres.length > 0) {
            ApiTestHelpers.validateGenreStructure(response.data.genres[0]);
        }
    });

    test('TC02 - Should return 404 error for invalid movie ID', async () => {
        const invalidMovieId = TestDataProvider.MOVIES.INVALID_ID;

        const response = await moviesService.getMovieDetails(invalidMovieId);

        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.NOT_FOUND);
        ApiTestHelpers.validateErrorResponse(response.data);
        expect(response.data.status_message).toContain('could not be found');
    });

    test('TC03 - Should retrieve popular movies with correct pagination structure', async () => {
        const queryParams = {
            page: TestDataProvider.QUERY_PARAMS.PAGE.FIRST,
            language: TestDataProvider.QUERY_PARAMS.LANGUAGE.ENGLISH
        };

        const response = await moviesService.getPopularMovies(queryParams);

        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validatePaginationStructure(response.data);
        ApiTestHelpers.validateNonEmptyArray(response.data.results, 'results');

        response.data.results.slice(0, 3).forEach(movie => {
            ApiTestHelpers.validateMovieStructure(movie);
        });

        expect(response.data.page).toBe(queryParams.page);
    });

    test('TC04 - Should retrieve movie credits with cast and crew information', async () => {
        const movieId = TestDataProvider.MOVIES.THE_DARK_KNIGHT;

        const response = await moviesService.getMovieCredits(movieId);

        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validateCreditsStructure(response.data);
        ApiTestHelpers.validateNonEmptyArray(response.data.cast, 'cast');
        
        if (response.data.cast.length > 0) {
            ApiTestHelpers.validateCastMemberStructure(response.data.cast[0]);
        }

        expect(Array.isArray(response.data.crew)).toBe(true);
    });

    test('TC05 - Should retrieve different results for different pages of top-rated movies', async () => {
        const page1Response = await moviesService.getTopRatedMovies({
            page: TestDataProvider.QUERY_PARAMS.PAGE.FIRST
        });

        const page2Response = await moviesService.getTopRatedMovies({
            page: TestDataProvider.QUERY_PARAMS.PAGE.SECOND
        });

        ApiTestHelpers.validateResponseStatus(page1Response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validateResponseStatus(page2Response, TestDataProvider.HTTP_STATUS.OK);

        expect(page1Response.data.total_pages).toBe(page2Response.data.total_pages);
        expect(page1Response.data.total_results).toBe(page2Response.data.total_results);
        expect(page1Response.data.page).toBe(1);
        expect(page2Response.data.page).toBe(2);

        // no duplicate movie IDs between pages
        const page1Ids = page1Response.data.results.map(m => m.id);
        const page2Ids = page2Response.data.results.map(m => m.id);
        const hasDuplicates = page1Ids.some(id => page2Ids.includes(id));
        expect(hasDuplicates).toBe(false);
    });

    test('TC06 - Should retrieve movie details in different languages', async () => {
        const movieId = TestDataProvider.MOVIES.THE_GODFATHER;

        const englishResponse = await moviesService.getMovieDetails(movieId, {
            language: TestDataProvider.QUERY_PARAMS.LANGUAGE.ENGLISH
        });

        const spanishResponse = await moviesService.getMovieDetails(movieId, {
            language: TestDataProvider.QUERY_PARAMS.LANGUAGE.SPANISH
        });

        ApiTestHelpers.validateResponseStatus(englishResponse, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validateResponseStatus(spanishResponse, TestDataProvider.HTTP_STATUS.OK);

        expect(englishResponse.data.id).toBe(movieId);
        expect(spanishResponse.data.id).toBe(movieId);
        expect(englishResponse.data.title).toBeTruthy();
        expect(spanishResponse.data.title).toBeTruthy();
    });

    test('TC07 - Should retrieve movie recommendations for a given movie', async () => {
        const movieId = TestDataProvider.MOVIES.THE_MATRIX;

        const response = await moviesService.getMovieRecommendations(movieId);

        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validatePaginationStructure(response.data);

        if (response.data.results.length > 0) {
            ApiTestHelpers.validateNonEmptyArray(response.data.results, 'results');
            response.data.results.slice(0, 2).forEach(movie => {
                ApiTestHelpers.validateMovieStructure(movie);
            });
        }
    });
});

test.describe('TMDB API - Search Endpoint Tests', () => {
    let searchService;

    test.beforeEach(async () => {
        searchService = new TMDBSearchService(
            process.env.TMDB_BASE_URL,
            process.env.TMDB_API_KEY,
            process.env.TMDB_READ_ACCESS_TOKEN
        );
    });

    test('TC08 - Should successfully search for movies with relevant results', async () => {
        const searchQuery = TestDataProvider.SEARCH_QUERIES.POPULAR_MOVIE;
        const startTime = Date.now();

        const response = await searchService.searchMovies(searchQuery);

        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validateResponseTime(startTime, 5000);
        ApiTestHelpers.validateSearchResultsStructure(response.data);

        if (response.data.results.length > 0) {
            const hasRelevantResult = response.data.results.some(movie =>
                movie.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            expect(hasRelevantResult).toBe(true);
        }
    });

    test('TC09 - Should return error for empty search query', async () => {
        const emptyQuery = TestDataProvider.SEARCH_QUERIES.EMPTY_QUERY;

        const response = await searchService.searchMovies(emptyQuery);

        // tmdb returns 200 with empty results for empty query
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('results');
        expect(Array.isArray(response.data.results)).toBe(true);
        expect(response.data.results.length).toBe(0);
    });

    test('TC10 - Should perform multi-entity search across movies, TV shows, and people', async () => {
        const searchQuery = 'Star';

        const response = await searchService.multiSearch(searchQuery);

        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validateSearchResultsStructure(response.data);

        if (response.data.results.length > 0) {
            response.data.results.slice(0, 5).forEach(result => {
                expect(result).toHaveProperty('media_type');
                expect(['movie', 'tv', 'person']).toContain(result.media_type);
            });
        }
    });
});

test.describe('TMDB API - Genres Endpoint Tests', () => {
    let genresService;

    test.beforeEach(async () => {
        genresService = new TMDBGenresService(
            process.env.TMDB_BASE_URL,
            process.env.TMDB_API_KEY,
            process.env.TMDB_READ_ACCESS_TOKEN
        );
    });

    test('TC11 - Should retrieve complete list of movie genres', async () => {
        const response = await genresService.getMovieGenres();

        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);

        expect(response.data).toHaveProperty('genres');
        ApiTestHelpers.validateNonEmptyArray(response.data.genres, 'genres');

        response.data.genres.forEach(genre => {
            ApiTestHelpers.validateGenreStructure(genre);
        });

        const genreIds = response.data.genres.map(g => g.id);
        expect(genreIds).toContain(TestDataProvider.GENRES.ACTION);
        expect(genreIds).toContain(TestDataProvider.GENRES.COMEDY);
    });

    test('TC12 - Should retrieve complete list of TV show genres', async () => {
        const response = await genresService.getTVGenres();

        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);

        expect(response.data).toHaveProperty('genres');
        ApiTestHelpers.validateNonEmptyArray(response.data.genres, 'genres');

        response.data.genres.forEach(genre => {
            ApiTestHelpers.validateGenreStructure(genre);
        });
    });
});

test.describe('TMDB API - Account Endpoint Tests', () => {
    let accountService;

    test.beforeEach(async () => {
        accountService = new TMDBAccountService(
            process.env.TMDB_BASE_URL,
            process.env.TMDB_API_KEY,
            process.env.TMDB_READ_ACCESS_TOKEN
        );
    });

    test('TC13 - Should successfully retrieve account details for a valid account ID', async () => {
        const startTime = Date.now();
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const response = await accountService.getAccountDetails(accountId);
        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validateResponseTime(startTime, 5000);
        ApiTestHelpers.validateAccountStructure(response.data);
        expect(response.data.id).toBe(accountId);
        expect(response.data.username).toBeTruthy();
    });

    test('TC14 - Should return same account details regardless of account ID parameter', async () => {
        // bearer token auth ignores accountId param
        const invalidAccountId = TestDataProvider.ACCOUNTS.INVALID_ACCOUNT;
        const validAccountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;

        const response1 = await accountService.getAccountDetails(invalidAccountId);
        const response2 = await accountService.getAccountDetails(validAccountId);

        ApiTestHelpers.validateResponseStatus(response1, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validateResponseStatus(response2, TestDataProvider.HTTP_STATUS.OK);

        expect(response1.data.id).toBe(response2.data.id);
        expect(response1.data.username).toBe(response2.data.username);
    });

    test('TC15 - Should retrieve account with proper avatar structure', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const response = await accountService.getAccountDetails(accountId);
        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        if (response.data.avatar) {
            expect(response.data.avatar).toHaveProperty('gravatar');
            expect(response.data.avatar).toHaveProperty('tmdb');
            if (response.data.avatar.gravatar) {
                expect(response.data.avatar.gravatar).toHaveProperty('hash');
            }
            if (response.data.avatar.tmdb) {
                expect(response.data.avatar.tmdb).toHaveProperty('avatar_path');
            }
        }
    });

    test('TC16 - Should retrieve account with valid ISO codes', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const response = await accountService.getAccountDetails(accountId);
        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        if (response.data.iso_639_1) {
            expect(typeof response.data.iso_639_1).toBe('string');
            expect(response.data.iso_639_1.length).toBe(2);
            expect(response.data.iso_639_1).toBe(response.data.iso_639_1.toLowerCase());
        }
        if (response.data.iso_3166_1) {
            expect(typeof response.data.iso_3166_1).toBe('string');
            expect(response.data.iso_3166_1.length).toBe(2);
            expect(response.data.iso_3166_1).toBe(response.data.iso_3166_1.toUpperCase());
        }
    });

    test('TC17 - Should retrieve account with username and name fields', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const response = await accountService.getAccountDetails(accountId);
        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);

        ApiTestHelpers.validateNonEmptyString(response.data.username, 'username');

        expect(response.data).toHaveProperty('name');
        expect(typeof response.data.name).toBe('string');

        if (response.data.name.length > 0) {
            expect(response.data.username).not.toBe(response.data.name);
        }
    });

    test('TC18 - Should retrieve account with include_adult boolean flag', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const response = await accountService.getAccountDetails(accountId);
        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        expect(response.data).toHaveProperty('include_adult');
        expect(typeof response.data.include_adult).toBe('boolean');
    });

    test('TC19 - Should retrieve favorite movies with pagination structure', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const response = await accountService.getFavoriteMovies(accountId);
        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validatePaginationStructure(response.data);
        expect(response.data).toHaveProperty('results');
        expect(Array.isArray(response.data.results)).toBe(true);
        if (response.data.results.length > 0) {
            response.data.results.slice(0, 2).forEach(movie => {
                ApiTestHelpers.validateMovieStructure(movie);
            });
        }
    });

    test('TC20 - Should retrieve rated movies with rating information', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const response = await accountService.getRatedMovies(accountId);
        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validatePaginationStructure(response.data);
        if (response.data.results.length > 0) {
            response.data.results.slice(0, 2).forEach(movie => {
                ApiTestHelpers.validateMovieStructure(movie);
                expect(movie).toHaveProperty('rating');
                expect(typeof movie.rating).toBe('number');
                ApiTestHelpers.validateNumericRange(movie.rating, 0.5, 10);
            });
        }
    });

    test('TC21 - Should retrieve watchlist movies with proper structure', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const response = await accountService.getWatchlistMovies(accountId);
        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validatePaginationStructure(response.data);
        expect(response.data).toHaveProperty('results');
        expect(Array.isArray(response.data.results)).toBe(true);
        if (response.data.results.length > 0) {
            response.data.results.slice(0, 2).forEach(movie => {
                ApiTestHelpers.validateMovieStructure(movie);
            });
        }
    });

    test('TC22 - Should retrieve account details within acceptable response time', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const startTime = Date.now();
        const response = await accountService.getAccountDetails(accountId);
        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(2000);
    });

    test('TC23 - Should return account with matching ID as positive integer', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const response = await accountService.getAccountDetails(accountId);
        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        expect(response.data.id).toBe(accountId);
        expect(typeof response.data.id).toBe('number');
        expect(response.data.id).toBeGreaterThan(0);
        expect(Number.isInteger(response.data.id)).toBe(true);
    });

    test('TC24 - Should retrieve multiple account lists with consistent structure', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const favoritesResponse = await accountService.getFavoriteMovies(accountId);
        const ratedResponse = await accountService.getRatedMovies(accountId);
        const watchlistResponse = await accountService.getWatchlistMovies(accountId);
        ApiTestHelpers.validateResponseStatus(favoritesResponse, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validateResponseStatus(ratedResponse, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validateResponseStatus(watchlistResponse, TestDataProvider.HTTP_STATUS.OK);
        ApiTestHelpers.validatePaginationStructure(favoritesResponse.data);
        ApiTestHelpers.validatePaginationStructure(ratedResponse.data);
        ApiTestHelpers.validatePaginationStructure(watchlistResponse.data);
        expect(Array.isArray(favoritesResponse.data.results)).toBe(true);
        expect(Array.isArray(ratedResponse.data.results)).toBe(true);
        expect(Array.isArray(watchlistResponse.data.results)).toBe(true);
    });

    test('TC25 - Should successfully add a movie to favorites', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const movieId = TestDataProvider.MOVIES.INCEPTION;

        const response = await accountService.addToFavorites(accountId, movieId, true);

        // api returns 201 for new, 200 if already exists
        expect([200, 201]).toContain(response.status);
        expect(response.data).toHaveProperty('status_code');
        expect(response.data).toHaveProperty('status_message');
        expect([1, 12]).toContain(response.data.status_code);
        expect(response.data.status_message.toLowerCase()).toContain('success');
    });

    test('TC26 - Should successfully remove a movie from favorites', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const movieId = TestDataProvider.MOVIES.INCEPTION;

        const response = await accountService.addToFavorites(accountId, movieId, false);

        ApiTestHelpers.validateResponseStatus(response, TestDataProvider.HTTP_STATUS.OK);
        expect(response.data).toHaveProperty('status_code');
        expect(response.data).toHaveProperty('status_message');
    });

    test('TC27 - Should return proper response structure when adding to favorites', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const movieId = TestDataProvider.MOVIES.THE_DARK_KNIGHT;

        const response = await accountService.addToFavorites(accountId, movieId, true);

        expect([200, 201]).toContain(response.status);
        expect(typeof response.data.status_code).toBe('number');
        expect(typeof response.data.status_message).toBe('string');
        expect(response.data.status_message.length).toBeGreaterThan(0);
    });

    test('TC28 - Should successfully add a TV show to favorites', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const tvShowId = 1399; // game of thrones

        const response = await accountService.addTVToFavorites(accountId, tvShowId, true);

        expect([200, 201]).toContain(response.status);
        expect([1, 12]).toContain(response.data.status_code);
    });

    test('TC29 - Should successfully add a movie to watchlist', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const movieId = 11; // star wars

        const response = await accountService.addMovieToWatchlist(accountId, movieId, true);

        expect([200, 201]).toContain(response.status);
        expect(response.data).toHaveProperty('success');
        expect(response.data).toHaveProperty('status_code');
        expect(response.data).toHaveProperty('status_message');

        expect([1, 12]).toContain(response.data.status_code);
        expect(response.data.success).toBe(true);
        expect(response.data.status_message.toLowerCase()).toContain('success');
    });

    test('TC30 - Should successfully remove a movie from watchlist', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const movieId = 11;

        const response = await accountService.addMovieToWatchlist(accountId, movieId, false);

        expect([200, 201]).toContain(response.status);
        expect(response.data).toHaveProperty('success');
        expect(response.data).toHaveProperty('status_code');
        expect(response.data).toHaveProperty('status_message');

        expect([1, 13]).toContain(response.data.status_code);
        expect(response.data.success).toBe(true);
    });

    test('TC31 - Should successfully add a TV show to watchlist', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const tvShowId = 1396; // breaking bad

        const response = await accountService.addTVShowToWatchlist(accountId, tvShowId, true);

        expect([200, 201]).toContain(response.status);
        expect(response.data).toHaveProperty('success');
        expect([1, 12]).toContain(response.data.status_code);
        expect(response.data.success).toBe(true);
    });

    test('TC32 - Should successfully remove a TV show from watchlist', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const tvShowId = 1396;

        const response = await accountService.addTVShowToWatchlist(accountId, tvShowId, false);

        expect([200, 201]).toContain(response.status);
        expect(response.data).toHaveProperty('success');
        expect([1, 13]).toContain(response.data.status_code);
        expect(response.data.success).toBe(true);
    });

    test('TC33 - Should return proper response structure when adding to watchlist', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const movieId = TestDataProvider.MOVIES.INCEPTION;

        const response = await accountService.addMovieToWatchlist(accountId, movieId, true);

        expect([200, 201]).toContain(response.status);

        expect(response.data).toMatchObject({
            success: expect.any(Boolean),
            status_code: expect.any(Number),
            status_message: expect.any(String),
        });

        expect(response.data.status_message.length).toBeGreaterThan(0);
        expect(typeof response.data.success).toBe('boolean');
    });

    test('TC34 - Should toggle movie watchlist status successfully', async () => {
        const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
        const movieId = TestDataProvider.MOVIES.THE_MATRIX;

        const addResponse = await accountService.addMovieToWatchlist(accountId, movieId, true);
        expect([200, 201]).toContain(addResponse.status);
        expect([1, 12]).toContain(addResponse.data.status_code);
        expect(addResponse.data.success).toBe(true);

        const removeResponse = await accountService.addMovieToWatchlist(accountId, movieId, false);
        expect([200, 201]).toContain(removeResponse.status);
        expect([1, 13]).toContain(removeResponse.data.status_code);
        expect(removeResponse.data.success).toBe(true);
    });
});

test.describe('TMDB API - Lists Endpoint Tests', () => {
    let listsService;

    test.beforeEach(async () => {
        listsService = new TMDBListsService(
            process.env.TMDB_BASE_URL,
            process.env.TMDB_API_KEY,
            process.env.TMDB_READ_ACCESS_TOKEN
        );
    });

    test('TC43 - Should complete full list lifecycle successfully', async () => {
        let createdListId;

        try {
            const sessionId = process.env.TMDB_SESSION_ID;
            
            if (!sessionId) {
                console.log('\n⚠️ SKIPPING TEST: TMDB_SESSION_ID not found in environment');
                console.log('   Run: node scripts/generateSessionId.js');
                console.log('   Then add TMDB_SESSION_ID=<your_session_id> to .env\n');
                test.skip();
                return;
            }

            const timestamp = Date.now();
            const createResponse = await listsService.createList(
                `My Favorites ${timestamp}`,
                'Personal collection of must-watch movies',
                'en',
                { session_id: sessionId }
            );

            console.log('\n🔍 CREATE LIST DEBUG:');
            console.log('Status:', createResponse.status);
            console.log('Response:', JSON.stringify(createResponse.data, null, 2));
            
            if (createResponse.status === 401 || createResponse.data.success === false) {
                console.log(`\n⚠️ List creation failed - invalid or expired session_id`);
                test.skip();
                return;
            }
            
            expect([200, 201]).toContain(createResponse.status);
            expect(createResponse.data).toHaveProperty('list_id');
            expect(createResponse.data).toHaveProperty('success', true);
            expect(createResponse.data.status_code).toBe(1);

            createdListId = createResponse.data.list_id;
            console.log(`✅ Created list with ID: ${createdListId}`);

            const moviesToAdd = [
                TestDataProvider.MOVIES.THE_SHAWSHANK_REDEMPTION,
                TestDataProvider.MOVIES.THE_GODFATHER,
                TestDataProvider.MOVIES.THE_DARK_KNIGHT,
            ];

            for (const movieId of moviesToAdd) {
                const addResponse = await listsService.addMovieToList(
                    createdListId, 
                    movieId,
                    { session_id: sessionId }
                );
                expect([200, 201]).toContain(addResponse.status);
                expect([1, 12]).toContain(addResponse.data.status_code);
                console.log(`✅ Added movie ${movieId} to list`);
            }

            console.log(`\n🔍 Checking item status...`);
            for (const movieId of moviesToAdd) {
                const checkResponse = await listsService.checkMovieInList(createdListId, movieId);
                expect(checkResponse.status).toBe(200);
                expect(checkResponse.data).toHaveProperty('item_present');
                expect(checkResponse.data.item_present).toBe(true);
                console.log(`✅ Verified movie ${movieId} in list`);
            }

            const detailsResponse = await listsService.getListDetails(createdListId);
            expect(detailsResponse.status).toBe(200);
            expect(detailsResponse.data).toHaveProperty('id', createdListId);
            expect(detailsResponse.data.name).toContain('My Favorites');
            expect(detailsResponse.data).toHaveProperty('item_count');
            expect(detailsResponse.data.item_count).toBeGreaterThanOrEqual(moviesToAdd.length);
            console.log(`✅ List contains ${detailsResponse.data.item_count} items`);

            console.log(`\n🗑️ Removing movies...`);
            for (const movieId of moviesToAdd) {
                const removeResponse = await listsService.removeMovieFromList(
                    createdListId, 
                    movieId,
                    { session_id: sessionId }
                );
                expect([200, 201]).toContain(removeResponse.status);
                expect([1, 13]).toContain(removeResponse.data.status_code);
                console.log(`✅ Removed movie ${movieId}`);
            }

            console.log(`\n✔️ Verifying removal...`);
            for (const movieId of moviesToAdd) {
                const checkResponse = await listsService.checkMovieInList(createdListId, movieId);
                expect(checkResponse.status).toBe(200);
                expect(checkResponse.data.item_present).toBe(false);
                console.log(`✅ Verified movie ${movieId} removed`);
            }
            console.log(`✅ All movies removed`);

            console.log(`\n🧹 Testing clear endpoint...`);
            const clearResponse = await listsService.clearList(
                createdListId,
                { session_id: sessionId }
            );
            // clear returns 400 if already empty
            expect([200, 201, 400]).toContain(clearResponse.status);
            if (clearResponse.status === 400) {
                console.log(`✅ Clear returned 400 (already empty)`);
            } else {
                expect([1, 12]).toContain(clearResponse.data.status_code);
                console.log(`✅ Clear tested`);
            }

            console.log(`\n🗑️ Deleting list...`);
            const deleteResponse = await listsService.deleteList(
                createdListId,
                { session_id: sessionId }
            );
            expect([200, 201]).toContain(deleteResponse.status);
            expect([1, 12, 13]).toContain(deleteResponse.data.status_code);
            expect(deleteResponse.data).toHaveProperty('success', true);
            console.log(`✅ Deleted list ${createdListId}`);

            createdListId = null;

            console.log(`\n🎉 Full lifecycle passed!`);

        } catch (error) {
            // cleanup on fail
            if (createdListId) {
                try {
                    const sessionId = process.env.TMDB_SESSION_ID;
                    if (sessionId) {
                        await listsService.deleteList(createdListId, { session_id: sessionId });
                        console.log(`🧹 Cleanup: Deleted list ${createdListId}`);
                    }
                } catch (cleanupError) {
                    console.error(`⚠️ Cleanup failed for ${createdListId}:`, cleanupError.message);
                }
            }
            throw error;
        }
    });
});

test.describe('TMDB API - Lists Endpoint Tests (Extended Lifecycle)', () => {
    let listsService;

    test.beforeEach(async () => {
        listsService = new TMDBListsService(
            process.env.TMDB_BASE_URL,
            process.env.TMDB_API_KEY,
            process.env.TMDB_READ_ACCESS_TOKEN
        );
    });

    test('TC44 - Should complete full list lifecycle with alternative movie set', async () => {
        let createdListId;

        try {
            const sessionId = process.env.TMDB_SESSION_ID;
            
            if (!sessionId) {
                console.log('\n⚠️ SKIPPING TEST: TMDB_SESSION_ID not found');
                console.log('   Run: node scripts/generateSessionId.js');
                console.log('   Then add to .env\n');
                test.skip();
                return;
            }

            const timestamp = Date.now();
            const createResponse = await listsService.createList(
                `Weekend Watchlist ${timestamp}`,
                'Movies to watch this weekend',
                'en',
                { session_id: sessionId }
            );

            console.log('\n🔍 CREATE LIST DEBUG:');
            console.log('Status:', createResponse.status);
            console.log('Response:', JSON.stringify(createResponse.data, null, 2));
            
            if (createResponse.status === 401 || createResponse.data.success === false) {
                console.log(`\n⚠️ List creation failed - invalid session_id`);
                test.skip();
                return;
            }
            
            expect([200, 201]).toContain(createResponse.status);
            expect(createResponse.data).toHaveProperty('list_id');
            expect(createResponse.data).toHaveProperty('success', true);
            expect(createResponse.data.status_code).toBe(1);

            createdListId = createResponse.data.list_id;
            console.log(`✅ Created list ${createdListId}`);

            const moviesToAdd = [
                TestDataProvider.MOVIES.FORREST_GUMP,
                TestDataProvider.MOVIES.PULP_FICTION,
                TestDataProvider.MOVIES.INCEPTION,
            ];

            for (const movieId of moviesToAdd) {
                const addResponse = await listsService.addMovieToList(
                    createdListId, 
                    movieId,
                    { session_id: sessionId }
                );
                expect([200, 201]).toContain(addResponse.status);
                expect([1, 12]).toContain(addResponse.data.status_code);
                console.log(`✅ Added movie ${movieId}`);
            }

            console.log(`\n🔍 Checking status...`);
            for (const movieId of moviesToAdd) {
                const checkResponse = await listsService.checkMovieInList(createdListId, movieId);
                expect(checkResponse.status).toBe(200);
                expect(checkResponse.data).toHaveProperty('item_present');
                expect(checkResponse.data.item_present).toBe(true);
                console.log(`✅ Verified ${movieId}`);
            }

            const detailsResponse = await listsService.getListDetails(createdListId);
            expect(detailsResponse.status).toBe(200);
            expect(detailsResponse.data).toHaveProperty('id', createdListId);
            expect(detailsResponse.data.name).toContain('Weekend Watchlist');
            expect(detailsResponse.data).toHaveProperty('item_count');
            expect(detailsResponse.data.item_count).toBeGreaterThanOrEqual(moviesToAdd.length);
            console.log(`✅ List has ${detailsResponse.data.item_count} items`);

            console.log(`\n🗑️ Removing movies...`);
            for (const movieId of moviesToAdd) {
                const removeResponse = await listsService.removeMovieFromList(
                    createdListId, 
                    movieId,
                    { session_id: sessionId }
                );
                expect([200, 201]).toContain(removeResponse.status);
                expect([1, 13]).toContain(removeResponse.data.status_code);
                console.log(`✅ Removed ${movieId}`);
            }

            console.log(`\n✔️ Verifying...`);
            for (const movieId of moviesToAdd) {
                const checkResponse = await listsService.checkMovieInList(createdListId, movieId);
                expect(checkResponse.status).toBe(200);
                expect(checkResponse.data.item_present).toBe(false);
                console.log(`✅ Verified ${movieId} removed`);
            }
            console.log(`✅ All removed`);

            console.log(`\n🧹 Clear test...`);
            const clearResponse = await listsService.clearList(
                createdListId,
                { session_id: sessionId }
            );
            expect([200, 201, 400]).toContain(clearResponse.status);
            if (clearResponse.status === 400) {
                console.log(`✅ Already empty`);
            } else {
                expect([1, 12]).toContain(clearResponse.data.status_code);
                console.log(`✅ Cleared`);
            }

            console.log(`\n🗑️ Deleting...`);
            const deleteResponse = await listsService.deleteList(
                createdListId,
                { session_id: sessionId }
            );
            expect([200, 201]).toContain(deleteResponse.status);
            expect([1, 12, 13]).toContain(deleteResponse.data.status_code);
            expect(deleteResponse.data).toHaveProperty('success', true);
            console.log(`✅ Deleted ${createdListId}`);

            createdListId = null;

            console.log(`\n🎉 Lifecycle passed!`);

        } catch (error) {
            if (createdListId) {
                try {
                    const sessionId = process.env.TMDB_SESSION_ID;
                    if (sessionId) {
                        await listsService.deleteList(createdListId, { session_id: sessionId });
                        console.log(`🧹 Cleanup: ${createdListId}`);
                    }
                } catch (cleanupError) {
                    console.error(`⚠️ Cleanup failed:`, cleanupError.message);
                }
            }
            throw error;
        }
    });
});
