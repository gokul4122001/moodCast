# Weather and News Aggregator App

A React Native application that intelligently combines weather information with news headlines, featuring unique weather-based news filtering logic.

## 🌟 Features

### Weather Information
- **Real-time Weather Data**: Fetches current weather based on user's location
- **5-Day Forecast**: Displays extended weather forecast
- **Temperature Units**: Support for both Celsius and Fahrenheit
- **Detailed Weather Stats**: Humidity, wind speed, and visibility information
- **Location-based**: Automatic location detection with fallback options

### News Headlines
- **Latest News**: Fetches current news headlines from multiple categories
- **Weather-Based Filtering**: Unique algorithm that filters news based on current weather conditions
- **Multiple Categories**: Support for various news categories (General, Business, Entertainment, Health, Science, Sports, Technology)
- **Interactive Articles**: Direct links to full articles

### Weather-Based News Filtering Logic
- **Cold Weather (< 10°C/50°F)**: Shows challenging or concerning news themes
- **Hot Weather (> 25°C/77°F)**: Displays news related to risks and warnings  
- **Cool Weather (10-25°C/50-77°F)**: Highlights positive and uplifting news stories

### User Settings
- **Temperature Unit Selection**: Choose between Celsius and Fahrenheit
- **News Category Preferences**: Customize which news categories to display
- **Persistent Settings**: User preferences are saved locally

## 🚀 Getting Started

### Prerequisites

- Node.js (version 12 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- API Keys for:
  - [OpenWeatherMap API](https://openweathermap.org/api)
  - [NewsAPI](https://newsapi.org/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-news-aggregator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure API Keys**
   
   Open `src/context/AppContext.js` and replace the placeholder API keys:
   ```javascript
   const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
   const NEWS_API_KEY = 'YOUR_NEWSAPI_KEY';
   ```

### Running the App

#### Android
```bash
npx react-native run-android
```

#### iOS
```bash
npx react-native run-ios
```

## 🏗️ Project Structure

```
src/
├── context/
│   └── AppContext.js          # Global state management
├── screens/
│   ├── HomeScreen.js          # Main weather and news display
│   └── SettingsScreen.js      # User preferences
```

## 📱 Screens

### Home Screen
- Current weather information with temperature, conditions, and location
- 5-day weather forecast
- Weather-filtered news headlines with images and descriptions
- Pull-to-refresh functionality
- Visual indication of current weather-based filtering

### Settings Screen
- Temperature unit selection (Celsius/Fahrenheit)
- News category preferences with icons
- Weather filtering explanation
- App information and credits
- Reset to default settings option

## 🔧 Technical Specifications

### Dependencies
```json
{
  "react-native": "^0.x.x",
  "react-native-paper": "Material Design components",
  "react-native-vector-icons": "Icon library",
  "@react-native-async-storage/async-storage": "Local storage",
  "@react-native-community/geolocation": "Location services",
  "toastify-react-native": "Toast notifications"
}
```

### APIs Used
- **OpenWeatherMap API**: Weather data and forecasts
- **NewsAPI**: News headlines and articles

### State Management
- Context API with useReducer for global state management
- AsyncStorage for persistent user settings
- Error handling and loading states

## 🎯 Key Features Implementation

### Weather-Based News Filtering
The app implements intelligent news filtering based on weather conditions:

```javascript
// Cold weather - challenging news
if (temperature < 10) {
  const depressingKeywords = ['death', 'crisis', 'problem', 'issue', 'fail', 'loss'];
  // Filter news containing these keywords
}

// Hot weather - concerning news
else if (temperature > 25) {
  const fearKeywords = ['danger', 'threat', 'risk', 'warning', 'alarm'];
  // Filter news containing these keywords
}

// Cool weather - positive news
else {
  const positiveKeywords = ['win', 'success', 'victory', 'achieve', 'celebrate'];
  // Filter news containing these keywords
}
```

### Location Services
- Automatic location detection with proper permission handling
- Fallback to default location (New York) if location access is denied
- Support for both Android and iOS location permissions

### Error Handling
- Comprehensive error handling for API failures
- User-friendly error messages
- Retry functionality for failed requests
- Graceful degradation when services are unavailable

## 🔒 Permissions

### Android
- `ACCESS_FINE_LOCATION`: For precise weather location data

### iOS
- Location permissions handled automatically by React Native Geolocation

## 🎨 UI/UX Features

- **Material Design**: Using React Native Paper components
- **Responsive Design**: Adapts to different screen sizes
- **Pull-to-Refresh**: Easy data refresh functionality
- **Loading States**: Visual feedback during data fetching
- **Error States**: Clear error messages with retry options
- **Toast Notifications**: User feedback for settings changes

## 🌡️ Weather Conditions Support

The app recognizes and displays appropriate icons for:
- Clear sky
- Few clouds
- Scattered/broken clouds
- Rain and shower rain
- Thunderstorm
- Snow
- Mist and fog

## 📰 News Categories

- General
- Business
- Entertainment
- Health
- Science
- Sports
- Technology

## 🔄 Data Flow

1. App initializes and requests location permission
2. Location is obtained (with fallback if denied)
3. Weather data is fetched using coordinates
4. News data is fetched based on user preferences
5. News is filtered based on current weather temperature
6. UI is updated with weather and filtered news data

## 🐛 Troubleshooting

### Common Issues

1. **Location Permission Denied**
   - Check device location settings
   - Grant location permission to the app
   - App will fallback to New York weather data

2. **API Key Issues**
   - Ensure API keys are correctly set in AppContext.js
   - Verify API keys are active and have remaining quota
   - Check API key format and permissions

3. **No News Displayed**
   - Check internet connection
   - Verify NewsAPI key is valid
   - Ensure at least one news category is selected in settings

4. **Weather Data Not Loading**
   - Check internet connection
   - Verify OpenWeatherMap API key
   - Try refreshing the data

