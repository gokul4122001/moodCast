import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import {Card, Title, Paragraph, ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useApp} from '../context/AppContext';

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const {state, refreshData} = useApp();
  const {weather, forecast, filteredNews, loading, error} = state;

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'clear sky': 'wb-sunny',
      'few clouds': 'cloud',
      'scattered clouds': 'cloud',
      'broken clouds': 'cloud',
      'shower rain': 'grain',
      'rain': 'grain',
      'thunderstorm': 'flash-on',
      'snow': 'ac-unit',
      'mist': 'blur-on',
    };
    return iconMap[condition?.toLowerCase()] || 'wb-sunny';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const openArticle = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const getWeatherConditionText = (temp) => {
    if (temp < 10) return 'Cold Weather - Focusing on challenging news';
    if (temp > 25) return 'Hot Weather - Showing concerning updates';
    return 'Cool Weather - Highlighting positive news';
  };

  if (loading && !weather) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading weather and news...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshData} />
      }>
      {/* Weather Section */}
      {weather && (
        <Card style={styles.weatherCard}>
          <Card.Content>
            <View style={styles.weatherHeader}>
              <View style={styles.weatherMain}>
                <Icon
                  name={getWeatherIcon(weather.weather[0]?.description)}
                  size={64}
                  color="#2196F3"
                />
                <View style={styles.temperatureContainer}>
                  <Text style={styles.temperature}>
                    {Math.round(weather.main.temp)}°
                  </Text>
                  <Text style={styles.unit}>
                    {state.settings.temperatureUnit === 'celsius' ? 'C' : 'F'}
                  </Text>
                </View>
              </View>
              <View style={styles.weatherDetails}>
                <Text style={styles.cityName}>{weather.name}</Text>
                <Text style={styles.weatherDescription}>
                  {weather.weather[0]?.description}
                </Text>
                <Text style={styles.feelsLike}>
                  Feels like {Math.round(weather.main.feels_like)}°
                </Text>
              </View>
            </View>
            
            <View style={styles.weatherStats}>
              <View style={styles.statItem}>
                <Icon name="opacity" size={20} color="#666" />
                <Text style={styles.statText}>{weather.main.humidity}%</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="air" size={20} color="#666" />
                <Text style={styles.statText}>{weather.wind.speed} m/s</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="visibility" size={20} color="#666" />
                <Text style={styles.statText}>{weather.visibility / 1000} km</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <Card style={styles.forecastCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>5-Day Forecast</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {forecast.map((day, index) => (
                <View key={index} style={styles.forecastItem}>
                  <Text style={styles.forecastDay}>
                    {formatDate(day.dt)}
                  </Text>
                  <Icon
                    name={getWeatherIcon(day.weather[0]?.description)}
                    size={32}
                    color="#2196F3"
                  />
                  <Text style={styles.forecastTemp}>
                    {Math.round(day.main.temp)}°
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      )}

      {/* Weather-Based News Filter Info */}
      {weather && (
        <Card style={styles.filterInfoCard}>
          <Card.Content>
            <View style={styles.filterInfo}>
              <Icon name="filter-list" size={24} color="#2196F3" />
              <Text style={styles.filterText}>
                {getWeatherConditionText(weather.main.temp)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* News Section */}
      <Card style={styles.newsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Weather-Filtered News</Title>
          {filteredNews.length > 0 ? (
            filteredNews.map((article, index) => (
              <TouchableOpacity
                key={index}
                style={styles.newsItem}
                onPress={() => openArticle(article.url)}>
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <Text style={styles.newsDescription} numberOfLines={3}>
                    {article.description}
                  </Text>
                  <View style={styles.newsFooter}>
                    <Text style={styles.newsSource}>{article.source.name}</Text>
                    <Text style={styles.newsDate}>
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                {article.urlToImage && (
                  <Image
                    source={{uri: article.urlToImage}}
                    style={styles.newsImage}
                  />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noNewsContainer}>
              <Icon name="article" size={48} color="#ccc" />
              <Text style={styles.noNewsText}>No news articles available</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weatherCard: {
    margin: 16,
    elevation: 4,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  unit: {
    fontSize: 24,
    color: '#2196F3',
    marginTop: 8,
  },
  weatherDetails: {
    alignItems: 'flex-end',
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherDescription: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  feelsLike: {
    fontSize: 14,
    color: '#888',
  },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  forecastCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  forecastItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
  },
  forecastDay: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 4,
  },
  filterInfoCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    backgroundColor: '#e3f2fd',
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1976d2',
    fontStyle: 'italic',
  },
  newsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  newsItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  newsContent: {
    flex: 1,
    paddingRight: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  newsSource: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  newsDate: {
    fontSize: 12,
    color: '#888',
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  noNewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noNewsText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
  },
});

export default HomeScreen;