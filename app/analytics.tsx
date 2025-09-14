import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  usageCount: number;
  maxUsage: number;
}

interface CategoryData {
  category: string;
  items: ClothingItem[];
}

interface FrequentData {
  thisWeek: CategoryData[];
  thisMonth: CategoryData[];
  thisYear: CategoryData[];
}

type TimeRange = 'This Week' | 'This Month' | 'This Year';

export default function Analytics() {
  const router = useRouter();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('This Week');
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
  const [frequentData, setFrequentData] = useState<FrequentData>({
    thisWeek: [],
    thisMonth: [],
    thisYear: [],
  });

  const timeRanges: TimeRange[] = ['This Week', 'This Month', 'This Year'];

  useEffect(() => {
    loadFrequentData();
  }, []);

  const loadFrequentData = async () => {
    try {
      // Mock data - in real app, this would come from API
      const mockData: FrequentData = {
        thisWeek: [
          {
            category: 'T-shirt',
            items: [
              { id: '1', name: 'Cloth name 1', category: 'T-shirt', usageCount: 4, maxUsage: 6 },
              { id: '2', name: 'Cloth name 2', category: 'T-shirt', usageCount: 3, maxUsage: 6 },
              { id: '3', name: 'Cloth name 3', category: 'T-shirt', usageCount: 1, maxUsage: 6 },
            ],
          },
          {
            category: 'Shorts',
            items: [
              { id: '4', name: 'Cloth name 1', category: 'Shorts', usageCount: 1, maxUsage: 6 },
              { id: '5', name: 'Cloth name 2', category: 'Shorts', usageCount: 2, maxUsage: 6 },
              { id: '6', name: 'Cloth name 3', category: 'Shorts', usageCount: 3, maxUsage: 6 },
              { id: '7', name: 'Cloth name 4', category: 'Shorts', usageCount: 2, maxUsage: 6 },
            ],
          },
        ],
        thisMonth: [
          {
            category: 'T-shirt',
            items: [
              { id: '1', name: 'Cloth name 1', category: 'T-shirt', usageCount: 12, maxUsage: 20 },
              { id: '2', name: 'Cloth name 2', category: 'T-shirt', usageCount: 8, maxUsage: 20 },
              { id: '3', name: 'Cloth name 3', category: 'T-shirt', usageCount: 4, maxUsage: 20 },
            ],
          },
          {
            category: 'Shorts',
            items: [
              { id: '4', name: 'Cloth name 1', category: 'Shorts', usageCount: 3, maxUsage: 20 },
              { id: '5', name: 'Cloth name 2', category: 'Shorts', usageCount: 6, maxUsage: 20 },
              { id: '6', name: 'Cloth name 3', category: 'Shorts', usageCount: 8, maxUsage: 20 },
              { id: '7', name: 'Cloth name 4', category: 'Shorts', usageCount: 5, maxUsage: 20 },
            ],
          },
          {
            category: 'Pants',
            items: [
              { id: '8', name: 'Cloth name 1', category: 'Pants', usageCount: 7, maxUsage: 20 },
              { id: '9', name: 'Cloth name 2', category: 'Pants', usageCount: 5, maxUsage: 20 },
            ],
          },
        ],
        thisYear: [
          {
            category: 'T-shirt',
            items: [
              { id: '1', name: 'Cloth name 1', category: 'T-shirt', usageCount: 45, maxUsage: 100 },
              { id: '2', name: 'Cloth name 2', category: 'T-shirt', usageCount: 32, maxUsage: 100 },
              { id: '3', name: 'Cloth name 3', category: 'T-shirt', usageCount: 18, maxUsage: 100 },
            ],
          },
          {
            category: 'Shorts',
            items: [
              { id: '4', name: 'Cloth name 1', category: 'Shorts', usageCount: 15, maxUsage: 100 },
              { id: '5', name: 'Cloth name 2', category: 'Shorts', usageCount: 28, maxUsage: 100 },
              { id: '6', name: 'Cloth name 3', category: 'Shorts', usageCount: 35, maxUsage: 100 },
              { id: '7', name: 'Cloth name 4', category: 'Shorts', usageCount: 22, maxUsage: 100 },
            ],
          },
          {
            category: 'Pants',
            items: [
              { id: '8', name: 'Cloth name 1', category: 'Pants', usageCount: 42, maxUsage: 100 },
              { id: '9', name: 'Cloth name 2', category: 'Pants', usageCount: 38, maxUsage: 100 },
            ],
          },
          {
            category: 'Skirts',
            items: [
              { id: '10', name: 'Cloth name 1', category: 'Skirts', usageCount: 25, maxUsage: 100 },
              { id: '11', name: 'Cloth name 2', category: 'Skirts', usageCount: 18, maxUsage: 100 },
            ],
          },
        ],
      };
      setFrequentData(mockData);
    } catch (error) {
      console.error('Error loading frequent data:', error);
    }
  };

  const getCurrentData = () => {
    switch (selectedTimeRange) {
      case 'This Week':
        return frequentData.thisWeek;
      case 'This Month':
        return frequentData.thisMonth;
      case 'This Year':
        return frequentData.thisYear;
      default:
        return frequentData.thisWeek;
    }
  };

  const renderUsageBar = (item: ClothingItem) => {
    const percentage = (item.usageCount / item.maxUsage) * 100;
    return (
      <View style={styles.usageBarContainer}>
        <View style={styles.usageBar}>
          <View style={[styles.usageBarFill, { width: `${percentage}%` }]} />
        </View>
      </View>
    );
  };

  const renderTimeRangeModal = () => (
    <Modal
      visible={showTimeRangeModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowTimeRangeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Time Range</Text>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.modalOption,
                selectedTimeRange === range && styles.modalOptionSelected,
              ]}
              onPress={() => {
                setSelectedTimeRange(range);
                setShowTimeRangeModal(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  selectedTimeRange === range && styles.modalOptionTextSelected,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frequent Data</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Time Range Selector and Refresh */}
      <View style={styles.timeRangeContainer}>
        <TouchableOpacity
          style={styles.timeRangeButton}
          onPress={() => setShowTimeRangeModal(true)}
        >
          <Text style={styles.timeRangeText}>Date: {selectedTimeRange}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.refreshButton} onPress={loadFrequentData}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {getCurrentData().map((categoryData, categoryIndex) => (
          <View key={categoryIndex} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{categoryData.category}</Text>
            {categoryData.items.map((item) => (
              <View key={item.id} style={styles.itemContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                {renderUsageBar(item)}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {renderTimeRangeModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF7F5',
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
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  refreshButton: {
    backgroundColor: '#4B2E2B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  itemContainer: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  usageBarContainer: {
    width: '100%',
  },
  usageBar: {
    height: 8,
    backgroundColor: '#D3D3D3',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#B0B0B0',
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: '#FDD8B5',
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#F4C2C2',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: '#4B2E2B',
  },
});