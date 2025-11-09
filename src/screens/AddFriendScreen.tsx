import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';

type NavigationProp = StackNavigationProp<RootStackParamList, 'AddFriend'>;

const AddFriendScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState('');

  return (
    <ScreenWrapper>
      <View style={styles.logoWrap}>
        <Image 
          source={require('../../assets/images/logo_white.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.outerCard}>
        <View style={styles.innerCard}>

          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()} 
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#0E2740" />
          </TouchableOpacity>

          <Text style={styles.title}>Додати нового друга</Text>
          <Text style={styles.subtitle}>
            Шукайте нових друзів{'\n'}
            за номером телефону або електронною поштою
          </Text>

          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Знайти нового друга"
              placeholderTextColor="#6B7A8A"
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8}>
              <Ionicons name="search-outline" size={20} color="#0E2740" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}/>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  logoWrap: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 15,
  },
  logo: {
    width: 140,
    height: 42,
  },

  outerCard: {
    width: '90%',
    height: '85%',
    maxWidth: 360,
    borderRadius: 22,
    backgroundColor: '#B6CDFF',
    padding: 12,
  },
  innerCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 14,
  },

  backBtn: {
    marginBottom: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E2740',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7A8A',
    marginBottom: 22,
  },

  searchRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#0E2740',
  },
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EEF5FF',
    borderWidth: 1,
    borderColor: '#D7E4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    flex: 1,
    width: '100%',
    marginTop: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

export default AddFriendScreen;
