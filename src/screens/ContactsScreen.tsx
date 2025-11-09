import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Tabs'>;

const ContactsScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const hasFriends = false;
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScreenWrapper>
      <View style={styles.logoWrap}>
        <Image 
          source={require('../../assets/images/logo_white.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.panelOuter}>
        <View style={styles.panelInner}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Мої друзі</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.headerIconBtn} 
                onPress={() => navigation.navigate('AddFriend')}
              >
                <Ionicons name="person-add-outline" size={20} color="#0E2740" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8}>
                <Ionicons name="mail-outline" size={20} color="#0E2740" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Знайти друга"
              placeholderTextColor="#6B7A8A"
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8}>
              <Ionicons name="search-outline" size={20} color="#0E2740" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {!hasFriends ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Поки що у Вас немає жодного друга…</Text>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('AddFriend')}
                >
                  <Text style={styles.addLink}>Додати друга</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View />
            )}
          </ScrollView>
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
    zIndex: 10,
  },
  logo: {
    width: 140,
    height: 42,
  },
  panelOuter: {
    width: '90%',
    height: '85%',
    maxWidth: 360,
    borderRadius: 22,
    backgroundColor: '#B6CDFF',
    padding: 12,
  },
  panelInner: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2740',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C9D6E6',
    paddingHorizontal: 12,
    color: '#0E2740',
    backgroundColor: '#FFFFFF',
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    color: '#6B7A8A',
    fontSize: 13,
  },
  addLink: {
    color: '#3E74D6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default ContactsScreen;
