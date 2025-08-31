import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AnalyticsData {
  totalItems: number;
  mostWornItems: Array<{ name: string; count: number }>;
  leastUsedItems: Array<{ name: string; count: number }>;
  sustainabilityImpact: {
    co2Saved: number;
    waterSaved: number;
    itemsReused: number;
  };
}

export default function Analytics() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalItems: 0,
    mostWornItems: [],
    leastUsedItems: [],
    sustainabilityImpact: {
      co2Saved: 0,
      waterSaved: 0,
      itemsReused: 0,
    },
  });

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Mock data - in real app, this would come from API
      const mockData: AnalyticsData = {
        totalItems: 24,
        mostWornItems: [
          { name: 'Blue T-shirt', count: 15 },
          { name: 'Black Jeans', count: 12 },
          { name: 'White Sneakers', count: 10 },
        ],
        leastUsedItems: [
          { name: 'Formal Shirt', count: 2 },
          { name: 'Winter Jacket', count: 1 },
          { name: 'Dress Shoes', count: 1 },
        ],
        sustainabilityImpact: {
          co2Saved: 12.5,
          waterSaved: 8500,
          itemsReused: 45,
        },
      };
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const renderProgressBar = (percentage: number, color: string) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );

  const renderSustainabilityCard = (title: string, value: string, subtitle: string, icon: string, color: string) => (
    <View style={[styles.sustainabilityCard, { borderLeftColor: color }]}>
      <View style={styles.sustainabilityHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.sustainabilityTitle}>{title}</Text>
      </View>
      <Text style={[styles.sustainabilityValue, { color }]}>{value}</Text>
      <Text style={styles.sustainabilitySubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics & Insights</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wardrobe Overview</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewItem}>
              <Ionicons name="shirt" size={32} color="#4B2E2B" />
              <Text style={styles.overviewValue}>{analyticsData.totalItems}</Text>
              <Text style={styles.overviewLabel}>Total Items</Text>
            </View>
            <View style={styles.overviewItem}>
              <Ionicons name="trending-up" size={32} color="#4B2E2B" />
              <Text style={styles.overviewValue}>{analyticsData.sustainabilityImpact.itemsReused}</Text>
              <Text style={styles.overviewLabel}>Items Reused</Text>
            </View>
          </View>
        </View>

        {/* Sustainability Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sustainability Impact</Text>
          <View style={styles.sustainabilityGrid}>
            {renderSustainabilityCard(
              'CO₂ Saved',
              `${analyticsData.sustainabilityImpact.co2Saved} kg`,
              'Carbon footprint reduced',
              'leaf',
              '#4CAF50'
            )}
            {renderSustainabilityCard(
              'Water Saved',
              `${analyticsData.sustainabilityImpact.waterSaved}L`,
              'Water consumption reduced',
              'water',
              '#2196F3'
            )}
            {renderSustainabilityCard(
              'Items Reused',
              `${analyticsData.sustainabilityImpact.itemsReused}`,
              'Times items were reused',
              'refresh',
              '#FF9800'
            )}
          </View>
        </View>

        {/* Most Worn Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Worn Items</Text>
          <View style={styles.itemsCard}>
            {analyticsData.mostWornItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemStats}>
                  <Text style={styles.itemCount}>{item.count} times</Text>
                  {renderProgressBar((item.count / 15) * 100, '#4CAF50')}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Least Used Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Least Used Items</Text>
          <View style={styles.itemsCard}>
            {analyticsData.leastUsedItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemStats}>
                  <Text style={styles.itemCount}>{item.count} times</Text>
                  {renderProgressBar((item.count / 15) * 100, '#FF9800')}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationsCard}>
            <View style={styles.recommendationItem}>
              <Ionicons name="bulb" size={20} color="#4CAF50" />
              <Text style={styles.recommendationText}>
                Consider donating items worn less than 3 times
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Ionicons name="trending-up" size={20} color="#2196F3" />
              <Text style={styles.recommendationText}>
                Your most worn items show great style consistency
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Ionicons name="leaf" size={20} color="#4CAF50" />
              <Text style={styles.recommendationText}>
                You've saved {analyticsData.sustainabilityImpact.co2Saved}kg of CO₂ this month!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4C2C2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B2E2B',
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sustainabilityGrid: {
    gap: 15,
  },
  sustainabilityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sustainabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sustainabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  sustainabilityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sustainabilitySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  itemStats: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressBarContainer: {
    width: 80,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  recommendationsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
