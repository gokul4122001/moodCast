import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  RadioButton,
  Checkbox,
  Button,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useApp} from '../context/AppContext';
import ToastManager, {Toast} from 'toastify-react-native';

const SettingsScreen = () => {
  const {state, saveSettings} = useApp();
  const [tempSettings, setTempSettings] = useState(state.settings);

  const newsCategories = [
    {id: 'general', label: 'General', icon: 'public'},
    {id: 'business', label: 'Business', icon: 'business'},
    {id: 'entertainment', label: 'Entertainment', icon: 'movie'},
    {id: 'health', label: 'Health', icon: 'local-hospital'},
    {id: 'science', label: 'Science', icon: 'science'},
    {id: 'sports', label: 'Sports', icon: 'sports'},
    {id: 'technology', label: 'Technology', icon: 'computer'},
  ];

  const handleTemperatureUnitChange = unit => {
    setTempSettings({
      ...tempSettings,
      temperatureUnit: unit,
    });
  };

  const handleCategoryToggle = categoryId => {
    const updatedCategories = tempSettings.newsCategories.includes(categoryId)
      ? tempSettings.newsCategories.filter(id => id !== categoryId)
      : [...tempSettings.newsCategories, categoryId];

    setTempSettings({
      ...tempSettings,
      newsCategories: updatedCategories,
    });
  };

  const handleSaveSettings = () => {
    if (tempSettings.newsCategories.length === 0) {
      Toast.error(
        'No Categories Selected!.Please select at least one news category.',
      );
      return;
    }

    saveSettings(tempSettings);
    Toast.success('Your preferences have been saved successfully.');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
              temperatureUnit: 'celsius',
              newsCategories: [
                'general',
                'technology',
                'sports',
                'entertainment',
              ],
            };
            setTempSettings(defaultSettings);
            saveSettings(defaultSettings);
          },
        },
      ],
    );
  };

  const getWeatherFilteringInfo = () => {
    return [
      {
        condition: 'Cold Weather (< 10°)',
        description: 'Shows news with challenging or concerning themes',
        icon: 'ac-unit',
        color: '#2196F3',
      },
      {
        condition: 'Hot Weather (> 25°)',
        description: 'Displays news related to risks and warnings',
        icon: 'wb-sunny',
        color: '#FF9800',
      },
      {
        condition: 'Cool Weather (10-25°)',
        description: 'Highlights positive and uplifting news stories',
        icon: 'cloud',
        color: '#4CAF50',
      },
    ];
  };

  return (
    <ScrollView style={styles.container}>
      {/* Temperature Unit Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Temperature Unit</Title>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => handleTemperatureUnitChange('celsius')}>
              <RadioButton
                value="celsius"
                status={
                  tempSettings.temperatureUnit === 'celsius'
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => handleTemperatureUnitChange('celsius')}
              />
              <Text style={styles.radioLabel}>Celsius (°C)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => handleTemperatureUnitChange('fahrenheit')}>
              <RadioButton
                value="fahrenheit"
                status={
                  tempSettings.temperatureUnit === 'fahrenheit'
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => handleTemperatureUnitChange('fahrenheit')}
              />
              <Text style={styles.radioLabel}>Fahrenheit (°F)</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* News Categories Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>News Categories</Title>
          <Text style={styles.subtitle}>
            Select categories you're interested in:
          </Text>
          {newsCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={styles.checkboxItem}
              onPress={() => handleCategoryToggle(category.id)}>
              <View style={styles.categoryItem}>
                <Icon name={category.icon} size={24} color="#666" />
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </View>
              <Checkbox
                status={
                  tempSettings.newsCategories.includes(category.id)
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => handleCategoryToggle(category.id)}
              />
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      {/* Weather-Based Filtering Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            Weather-Based News Filtering
          </Title>
          <Text style={styles.subtitle}>
            How news is filtered based on weather conditions:
          </Text>
          {getWeatherFilteringInfo().map((info, index) => (
            <View key={index} style={styles.filterInfoItem}>
              <View style={styles.filterCondition}>
                <Icon name={info.icon} size={24} color={info.color} />
                <Text style={styles.conditionText}>{info.condition}</Text>
              </View>
              <Text style={styles.conditionDescription}>
                {info.description}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* App Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>About</Title>
          <View style={styles.infoItem}>
            <Icon name="info" size={20} color="#666" />
            <Text style={styles.infoText}>
              Weather & News Aggregator v1.0.0
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="location-on" size={20} color="#666" />
            <Text style={styles.infoText}>
              Uses OpenWeatherMap API for weather data
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="article" size={20} color="#666" />
            <Text style={styles.infoText}>Uses NewsAPI for news headlines</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSaveSettings}
          style={styles.saveButton}
          contentStyle={styles.buttonContent}>
          Save Settings
        </Button>
        <Button
          mode="outlined"
          onPress={handleResetSettings}
          style={styles.resetButton}
          contentStyle={styles.buttonContent}>
          Reset to Default
        </Button>
      </View>
      <ToastManager />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  radioGroup: {
    paddingVertical: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  filterInfoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  conditionDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 32,
    lineHeight: 18,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    marginBottom: 12,
    backgroundColor: '#2196F3',
  },
  resetButton: {
    borderColor: '#f44336',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default SettingsScreen;
