import { Image, StyleSheet, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Add a utility function for better logging
const logInfo = (message: string, data?: any) => {
  if (__DEV__) {
    if (data) {
      console.log(`[Weather App] ${message}:`, data);
    } else {
      console.log(`[Weather App] ${message}`);
    }
  }
};

interface WeatherData {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
  };
  forecast_days: {
    date: Date;
    min: number;
    max: number;
  }[];
}

export default function HomeScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [forecastDays, setForecastDays] = useState<Date[]>([]);

  useEffect(() => {
    logInfo('Component mounted');
    // Initialize forecast days
    const now = new Date();
    const days: Date[] = [];
    
    for (let i = 1; i <= 5; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    
    setForecastDays(days);
    logInfo('Forecast days initialized', days);
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location) {
      logInfo('Location updated, fetching weather data', location);
      fetchWeatherData();
    }
  }, [location]);

  const getUserLocation = async () => {
    try {
      logInfo('Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      logInfo('Permission status:', status);

      if (status !== 'granted') {
        logInfo('Location permission denied');
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      logInfo('Getting current position...');
      const position = await Location.getCurrentPositionAsync({});
      logInfo('Position received:', position);

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      setLocation(coords);

      logInfo('Getting location name...');
      await getLocationName(coords.latitude, coords.longitude);
    } catch (err) {
      logInfo('Location error:', err);
      setError('Failed to get location');
      setLoading(false);
    }
  };

  const fetchWeatherData = async () => {
    if (!location) return;
    
    try {
      // Keep using the same URL, but add daily parameters
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      logInfo('Fetching weather data from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      logInfo('Weather API response:', data);
      
      // Process the actual daily forecast data from the API
      const forecastData = [];
      
      // Use the daily data from the API response
      if (data.daily && data.daily.time) {
        // Skip today (index 0) and use the next 5 days
        for (let i = 1; i <= 5 && i < data.daily.time.length; i++) {
          forecastData.push({
            date: new Date(data.daily.time[i]),
            min: data.daily.temperature_2m_min[i],
            max: data.daily.temperature_2m_max[i]
          });
        }
      }
      
      const weatherData = {
        current: data.current,
        forecast_days: forecastData
      };
      
      logInfo('Processed weather data:', weatherData);
      setWeather(weatherData);
      setLoading(false);
    } catch (err) {
      logInfo('Weather fetch error:', err);
      setError('Failed to fetch weather data');
      setLoading(false);
    }
  };

  const getLocationName = async (latitude: number, longitude: number) => {
    try {
      logInfo('Reverse geocoding coordinates:', { latitude, longitude });
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      logInfo('Geocoding response:', response);
      if (response[0]) {
        const { city, district, subregion, region } = response[0];
        const name = city || district || subregion || region || 'Unknown location';
        logInfo('Setting location name:', name);
        setLocationName(name);
      }
    } catch (err) {
      logInfo('Geocoding error:', err);
      console.warn('Failed to get location name');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFE4B5', dark: '#8B4513' }} // Light: Moccasin, Dark: Saddle Brown
      headerImage={
        <Image
          source={{ 
            uri: 'https://images.unsplash.com/photo-1742391661940-eb4463e7c032?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          }}
          style={[styles.reactLogo, { 
            height: 250,  // Adjust height to fill header
            width: '100%', // Make image full width
            left: undefined, // Remove absolute positioning
            bottom: undefined,
            position: 'absolute',
            resizeMode: 'cover'
          }]}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Weather Info</ThemedText>
        <HelloWave />
      </ThemedView>

      {loading && (
        <ThemedView style={styles.container}>
          <ThemedText>Loading weather data...</ThemedText>
        </ThemedView>
      )}

      {error && (
        <ThemedView style={styles.container}>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
      )}

      {weather && (
        <ThemedView style={styles.weatherContainer}>
          <ThemedView style={styles.currentWeather}>
            <ThemedText type="subtitle">Current Weather</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.locationName}>
              {locationName}
            </ThemedText>
            <ThemedText>
              Temperature: {weather.current.temperature_2m}°C
            </ThemedText>
            <ThemedText>
              Wind Speed: {weather.current.wind_speed_10m} km/h
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.forecastContainer}>
            <ThemedText type="subtitle">5-Day Forecast</ThemedText>
            {weather.forecast_days.map((day) => (
              <ThemedView key={day.date.toISOString()} style={styles.forecastCard}>
                <ThemedText style={styles.dayName}>
                  {day.date.toLocaleDateString('en-US', { weekday: 'long' })}
                </ThemedText>
                <ThemedText style={styles.temperature}>
                  {Math.round(day.min)}°C - {Math.round(day.max)}°C
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  weatherContainer: {
    gap: 20,
  },
  currentWeather: {
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  locationName: {
    fontSize: 16,
    marginBottom: 8,
  },
  forecastContainer: {
    gap: 10,
    marginTop: 20,
  },
  forecastCard: {
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
  },
  temperature: {
    fontSize: 16,
  },
});































