import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { userApi } from '../api/userApi';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Tabs'>;

const ContactsScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [])
  );

const loadContacts = async () => {
  try {
    const contacts = await userApi.getContacts();

    const mapped = contacts.map((c: any) => ({
      id: c.friend.userId,
      firstName: c.friend.firstName,
      lastName: c.friend.lastName,
    }));

    setFriends(mapped);
  } catch {}
};

const deleteFriend = async (id: number) => {
  try {
    await userApi.deleteFriend(id);
    loadContacts();
  } catch {
    alert("Не вдалося видалити друга");
  }
};

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
          <View style={styles.topIconsRow}>
            <TouchableOpacity 
              style={styles.headerIconBtn} 
              onPress={() => navigation.navigate('AddFriend')}
            >
              <Ionicons name="person-add-outline" size={20} color="#0E2740" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8} onPress={() => navigation.navigate('Invitations')}>
              <Ionicons name="mail-outline" size={20} color="#0E2740" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Мої друзі</Text>
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
            {friends.length === 0 ? (
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
              friends
                .filter(f => (f.firstName + ' ' + f.lastName).toLowerCase().includes(search.toLowerCase()))
                .map((f, i) => (
                  <View key={i} style={styles.friendCard}>
                    <Ionicons name="person-circle-outline" size={28} color="#0E2740" />
                    <Text style={styles.friendName}>{f.firstName} {f.lastName}</Text>

                    <TouchableOpacity activeOpacity={0.8} onPress={() => deleteFriend(f.id)}>
                      <Ionicons name="trash-outline" size={22} color="#0E2740" />
                    </TouchableOpacity>
                  </View>
                ))
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
  topIconsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 4,
  },
  headerRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2740',
    textAlign: 'center',
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
    marginLeft: 8,
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
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8E7FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  friendName: {
    flex: 1,
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ContactsScreen;
