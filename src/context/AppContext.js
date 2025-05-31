import React, {createContext, useContext, useReducer, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform, Alert} from 'react-native';

const AppContext = createContext();

const initialState = {
  weather: null,
  forecast: [],
  news: [],
  filteredNews: [],
  loading: false,
  error: null,
  settings: {
    temperatureUnit: 'celsius',
    newsCategories: ['general', 'technology', 'sports', 'entertainment'],
  },
  location: null,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {...state, loading: action.payload, error: null};
    case 'SET_ERROR':
      return {...state, error: action.payload, loading: false};
    case 'SET_WEATHER':
      return {...state, weather: action.payload, loading: false, error: null};
    case 'SET_FORECAST':
      return {...state, forecast: action.payload};
    case 'SET_NEWS':
      return {...state, news: action.payload};
    case 'SET_FILTERED_NEWS':
      return {...state, filteredNews: action.payload};
    case 'SET_SETTINGS':
      return {...state, settings: {...state.settings, ...action.payload}};
    case 'SET_LOCATION':
      return {...state, location: action.payload};
    case 'CLEAR_ERROR':
      return {...state, error: null};
    default:
      return state;
  }
};

export const AppProvider = ({children}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // IMPORTANT: Replace these with your actual API keys

  const WEATHER_API_KEY = '1568951c4f4616d39bd378f1eb8e7879';
  const NEWS_API_KEY = '4169aab2575544fe9c46571228468f93';

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await loadSettings();
      await requestLocationPermission();
    } catch (error) {
      console.error('App initialization error:', error);
      dispatch({type: 'SET_ERROR', payload: 'Failed to initialize app'});
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        dispatch({type: 'SET_SETTINGS', payload: parsedSettings});
        console.log('Settings loaded:', parsedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const requestLocationPermission1 = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const saveSettings = async newSettings => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
      dispatch({type: 'SET_SETTINGS', payload: newSettings});
      console.log('Settings saved:', newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      console.log('Requesting location permission...');

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show weather information.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        console.log('Android permission result:', granted);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          dispatch({
            type: 'SET_ERROR',
            payload:
              'Location permission denied. Please enable location access in settings.',
          });
        }
      } else {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Location permission error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Location permission error: ' + error.message,
      });
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission1();
    if (!hasPermission) {
      console.log('geting location error ');
    }
    Geolocation.getCurrentPosition(
      position => {
        console.log('Location received:', position.coords);
        const {latitude, longitude} = position.coords;
        dispatch({type: 'SET_LOCATION', payload: {latitude, longitude}});
        fetchWeather(latitude, longitude);
      },
      error => {
        console.error('Location error:', error);
        let errorMessage = 'Unable to get location: ';

        switch (error.code) {
          case 1:
            errorMessage += 'Location permission denied';
            break;
          case 2:
            errorMessage += 'Location unavailable';
            break;
          case 3:
            errorMessage += 'Location request timeout';
            break;
          default:
            errorMessage += error.message;
        }

        dispatch({type: 'SET_ERROR', payload: errorMessage});

        // Fallback to default location (New York)
        console.log('Using fallback location...');
        dispatch({
          type: 'SET_LOCATION',
          payload: {latitude: 40.7128, longitude: -74.006},
        });
        fetchWeather(40.7128, -74.006);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  const fetchWeather = async (lat, lon) => {
    console.log('Fetching weather for coordinates:', lat, lon);
    dispatch({type: 'SET_LOADING', payload: true});

    try {
      const units =
        state.settings.temperatureUnit === 'celsius' ? 'metric' : 'imperial';

      // Current weather
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}`;
      console.log('Weather API URL:', weatherUrl);

      const weatherResponse = await fetch(weatherUrl);
      console.log('Weather response status:', weatherResponse.status);

      if (!weatherResponse.ok) {
        const errorText = await weatherResponse.text();
        console.error('Weather API error response:', errorText);
        throw new Error(
          `Weather API error (${weatherResponse.status}): ${errorText}`,
        );
      }

      const weatherData = await weatherResponse.json();
      console.log('Weather data received:', weatherData);

      // 5-day forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}`;
      console.log('Forecast API URL:', forecastUrl);

      const forecastResponse = await fetch(forecastUrl);
      console.log('Forecast response status:', forecastResponse.status);

      if (!forecastResponse.ok) {
        console.warn(
          'Forecast API failed, continuing with current weather only',
        );
        dispatch({type: 'SET_FORECAST', payload: []});
      } else {
        const forecastData = await forecastResponse.json();
        console.log(
          'Forecast data received:',
          forecastData.list?.length,
          'items',
        );
        dispatch({
          type: 'SET_FORECAST',
          payload:
            forecastData.list
              ?.filter((_, index) => index % 8 === 0)
              .slice(0, 5) || [],
        });
      }

      dispatch({type: 'SET_WEATHER', payload: weatherData});

      // Fetch news after getting weather
      await fetchNews(weatherData.main.temp);
    } catch (error) {
      console.error('Weather fetch error:', error);
      dispatch({type: 'SET_ERROR', payload: error.message});
    }
  };

  const fetchNews = async temperature => {
    console.log('Fetching news for temperature:', temperature);

    try {
      // Check if API key is set

      const category = state.settings.newsCategories[0] || 'general';
      const newsUrl = `https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=${NEWS_API_KEY}&pageSize=50`;
      console.log(
        'News API URL:',
        newsUrl.replace(NEWS_API_KEY, 'API_KEY_HIDDEN'),
      );

      const response = await fetch(newsUrl);
      console.log('News response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('News API error response:', errorText);
        throw new Error(`News API error (${response.status}): ${errorText}`);
      }

      const newsData = await response.json();
      console.log('News data received:', newsData.articles?.length, 'articles');

      const articles = newsData.articles || [];
      dispatch({type: 'SET_NEWS', payload: articles});
      filterNewsByWeather(articles, temperature);
    } catch (error) {
      console.error('News fetch error:', error);
      // Don't fail the entire app if news fails
      dispatch({type: 'SET_NEWS', payload: []});
      dispatch({type: 'SET_FILTERED_NEWS', payload: []});
    }
  };

  const filterNewsByWeather = (articles, temperature) => {
    console.log(
      'Filtering news by weather. Temperature:',
      temperature,
      'Articles:',
      articles.length,
    );

    let filteredArticles = [];

    try {
      // Weather-based filtering logic
      if (temperature < 10) {
        // Cold weather - depressing news
        console.log('Cold weather - filtering for challenging news');
        const depressingKeywords = [
          'death',
          'crisis',
          'problem',
          'issue',
          'fail',
          'loss',
          'decline',
          'drop',
          'struggle',
          'difficulty',
        ];
        filteredArticles = articles.filter(
          article =>
            article &&
            article.title &&
            depressingKeywords.some(
              keyword =>
                article.title.toLowerCase().includes(keyword) ||
                (article.description &&
                  article.description.toLowerCase().includes(keyword)),
            ),
        );
      } else if (temperature > 25) {
        // Hot weather - fear-related news
        console.log('Hot weather - filtering for fear-related news');
        const fearKeywords = [
          'danger',
          'threat',
          'risk',
          'warning',
          'alarm',
          'concern',
          'worry',
          'fear',
          'panic',
          'crisis',
        ];
        filteredArticles = articles.filter(
          article =>
            article &&
            article.title &&
            fearKeywords.some(
              keyword =>
                article.title.toLowerCase().includes(keyword) ||
                (article.description &&
                  article.description.toLowerCase().includes(keyword)),
            ),
        );
      } else {
        // Cool weather - positive news
        console.log('Cool weather - filtering for positive news');
        const positiveKeywords = [
          'win',
          'success',
          'victory',
          'achieve',
          'celebrate',
          'happy',
          'joy',
          'breakthrough',
          'triumph',
          'excellent',
        ];
        filteredArticles = articles.filter(
          article =>
            article &&
            article.title &&
            positiveKeywords.some(
              keyword =>
                article.title.toLowerCase().includes(keyword) ||
                (article.description &&
                  article.description.toLowerCase().includes(keyword)),
            ),
        );
      }

      // If no filtered articles found, show random selection
      if (filteredArticles.length === 0) {
        console.log('No filtered articles found, using random selection');
        filteredArticles = articles.slice(0, 10);
      }

      console.log('Filtered articles count:', filteredArticles.length);
      dispatch({
        type: 'SET_FILTERED_NEWS',
        payload: filteredArticles.slice(0, 10),
      });
    } catch (error) {
      console.error('Error filtering news:', error);
      dispatch({type: 'SET_FILTERED_NEWS', payload: articles.slice(0, 10)});
    }
  };

  const refreshData = () => {
    console.log('Refreshing data...');
    dispatch({type: 'CLEAR_ERROR'});

    if (state.location) {
      fetchWeather(state.location.latitude, state.location.longitude);
    } else {
      getCurrentLocation();
    }
  };

  const value = {
    state,
    dispatch,
    saveSettings,
    refreshData,
    fetchWeather,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
