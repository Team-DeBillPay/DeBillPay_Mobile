import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { userApi } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CreateGroup'>;

const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user: currentUser } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<any[]>([]);
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<any[]>([]);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = friends.filter(friend => 
        friend.firstName.toLowerCase().includes(query) || 
        friend.lastName.toLowerCase().includes(query) ||
        friend.email?.toLowerCase().includes(query)
      );
      setFilteredFriends(filtered);
    }
  }, [friends, searchQuery]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const contacts = await userApi.getContacts();
      const mapped = contacts.map((c: any) => ({
        id: c.friend.userId,
        firstName: c.friend.firstName,
        lastName: c.friend.lastName,
        email: c.friend.email || '',
        phoneNumber: c.friend.phoneNumber || ''
      }));
      setFriends(mapped);
      setFilteredFriends(mapped);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити контакти');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friend: any) => {
    const exists = selectedFriends.find(f => f.id === friend.id);
    if (exists) {
      setSelectedFriends(prev => prev.filter(f => f.id !== friend.id));
    } else {
      setSelectedFriends(prev => [...prev, friend]);
    }
  };

  const removeFriend = (id: number) => {
    setSelectedFriends(prev => prev.filter(f => f.id !== id));
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Увага', 'Введіть назву групи');
      return;
    }

    if (groupName.length < 2 || groupName.length > 50) {
      Alert.alert('Увага', 'Назва групи має бути від 2 до 50 символів');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('Увага', 'Оберіть хоча б одного друга для групи');
      return;
    }

    setCreating(true);
    try {
      const friendIds = selectedFriends.map(f => f.id);
      await userApi.createGroup({
        name: groupName.trim(),
        friendIds,
      });

      Alert.alert(
        'Успіх!',
        `Група "${groupName}" успішно створена!`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating group:', error);
      Alert.alert(
        'Помилка', 
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        "Не вдалося створити групу"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleApplySelection = () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Увага', 'Виберіть хоча б одного учасника');
      return;
    }
    setShowFriendPicker(false);
    setSearchQuery('');
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
      
      <View style={styles.outerCard}>
        <View style={styles.innerCard}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="#0E2740" />
          </TouchableOpacity>

          <Text style={styles.title}>Створення групи</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Назва групи</Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Введіть назву групи"
              placeholderTextColor="#6B7A8A"
              style={styles.nameInput}
              maxLength={50}
            />
          </View>

          <View style={styles.participantsHeader}>
            <View>
              <Text style={styles.label}>Учасники групи</Text>
              <Text style={styles.subLabel}>
                {selectedFriends.length} обрано
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowFriendPicker(true)}
            >
              <Ionicons name="person-add-outline" size={18} color="#0E2740" />
              <Text style={styles.addButtonText}>Додати</Text>
            </TouchableOpacity>
          </View>

          {selectedFriends.length === 0 ? (
            <View style={styles.emptyPlaceholder}>
              <Ionicons name="people-outline" size={48} color="#C9D6E6" />
              <Text style={styles.emptyText}>Поки що немає учасників</Text>
              <Text style={styles.emptyHint}>
                Натисніть "Додати" щоб вибрати друзів
              </Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.cardList}>
                {selectedFriends.map((friend) => (
                  <View key={friend.id} style={styles.participantCard}>
                    <View style={styles.avatarContainer}>
                      <Ionicons name="person-circle-outline" size={28} color="#0E2740" />
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {friend.firstName} {friend.lastName}
                      </Text>
                      {friend.email ? (
                        <Text style={styles.participantEmail} numberOfLines={1}>
                          {friend.email}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity 
                      style={styles.removeBtn}
                      onPress={() => removeFriend(friend.id)}
                    >
                      <Ionicons name="trash-outline" size={22} color="#0E2740" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.createBtn, (creating || !groupName.trim() || selectedFriends.length === 0) && styles.createBtnDisabled]}
              onPress={createGroup}
              disabled={creating || !groupName.trim() || selectedFriends.length === 0}
            >
              {creating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.createBtnText}>Створити групу</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={showFriendPicker} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Вибір учасників</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedFriends.length} з {friends.length} вибрано
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeModalBtn}
                onPress={() => {
                  setShowFriendPicker(false);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close" size={24} color="#0E2740" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6B7A8A" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Пошук друзів..."
                placeholderTextColor="#6B7A8A"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#6B7A8A" />
                </TouchableOpacity>
              ) : null}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3E74D6" />
                <Text style={styles.loadingText}>Завантаження друзів...</Text>
              </View>
            ) : filteredFriends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#C9D6E6" />
                <Text style={styles.emptyModalText}>
                  {searchQuery ? 'Друзів не знайдено' : 'У вас поки що немає друзів'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={styles.addFriendBtn}
                    onPress={() => {
                      setShowFriendPicker(false);
                      navigation.navigate('AddFriend');
                    }}
                  >
                    <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.addFriendText}>Додати друга</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                <FlatList
                  data={filteredFriends}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => {
                    const selected = selectedFriends.find(f => f.id === item.id);
                    return (
                      <TouchableOpacity
                        style={[styles.friendRow, selected && styles.friendRowSelected]}
                        onPress={() => toggleFriendSelection(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.friendAvatarContainer}>
                          <Ionicons 
                            name="person-circle-outline" 
                            size={28} 
                            color={selected ? "#3E74D6" : "#0E2740"} 
                          />
                        </View>
                        <View style={styles.friendInfo}>
                          <Text style={[styles.friendRowName, selected && styles.friendRowNameSelected]}>
                            {item.firstName} {item.lastName}
                          </Text>
                          {item.email ? (
                            <Text style={styles.friendRowEmail} numberOfLines={1}>
                              {item.email}
                            </Text>
                          ) : null}
                        </View>
                        <View style={[styles.friendRowRightIcon, selected && styles.friendRowRightIconSelected]}>
                          <Ionicons
                            name={selected ? "checkmark" : "add"}
                            size={18}
                            color={selected ? "#FFFFFF" : "#0E2740"}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={styles.friendsList}
                />
                
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={[styles.modalSecondary, { marginRight: 8 }]} 
                    onPress={() => {
                      setShowFriendPicker(false);
                      setSearchQuery('');
                    }}
                  >
                    <Text style={styles.modalSecondaryText}>Скасувати</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalPrimary, selectedFriends.length === 0 && styles.modalPrimaryDisabled]} 
                    onPress={handleApplySelection}
                    disabled={selectedFriends.length === 0}
                  >
                    <Text style={styles.modalPrimaryText}>Додати ({selectedFriends.length})</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  outerCard: {
    width: '90%',
    height: '82%',
    maxWidth: 360,
    alignSelf: 'center',
    borderRadius: 22,
    backgroundColor: '#B6CDFF',
    padding: 12,
  },
  innerCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 18,
    paddingHorizontal: 14,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginBottom: 6,
    padding: 4,
  },
  title: {
    textAlign: 'center',
    color: '#0E2740',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#0E2740',
    marginBottom: 6,
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 12,
    color: '#6B7A8A',
    marginTop: 2,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 12,
    padding: 12,
    color: '#0E2740',
    fontSize: 16,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FF',
    borderWidth: 1,
    borderColor: '#D7E4F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    color: '#0E2740',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyPlaceholder: {
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 12,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F6F9FF',
    marginBottom: 16,
  },
  emptyText: {
    color: '#6B7A8A',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#6B7A8A',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
    marginBottom: 16,
    maxHeight: 240,
  },
  cardList: {
    borderRadius: 12,
  },
  participantCard: {
    backgroundColor: '#D8E7FF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  participantEmail: {
    color: '#6B7A8A',
    fontSize: 12,
  },
  removeBtn: {
    padding: 4,
  },
  bottomButtons: {
    marginBottom: 20,
  },
  createBtn: {
    backgroundColor: '#3E74D6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createBtnDisabled: {
    backgroundColor: '#C9D6E6',
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '92%',
    maxWidth: 380,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2740',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7A8A',
    marginTop: 4,
  },
  closeModalBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F9FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F0FE',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#0E2740',
    fontSize: 15,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6B7A8A',
    fontSize: 14,
  },
  emptyContainer: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyModalText: {
    color: '#6B7A8A',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  addFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E74D6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginTop: 12,
  },
  addFriendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  friendsList: {
    paddingBottom: 8,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8E7FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  friendRowSelected: {
    backgroundColor: '#E6F1FF',
    borderWidth: 1,
    borderColor: '#3E74D6',
  },
  friendAvatarContainer: {
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendRowName: {
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  friendRowNameSelected: {
    color: '#3E74D6',
  },
  friendRowEmail: {
    color: '#6B7A8A',
    fontSize: 12,
  },
  friendRowRightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  friendRowRightIconSelected: {
    backgroundColor: '#3E74D6',
    borderColor: '#3E74D6',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8F0FE',
  },
  modalPrimary: {
    backgroundColor: '#3E74D6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalPrimaryDisabled: {
    backgroundColor: '#C9D6E6',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalSecondary: {
    backgroundColor: '#EEF5FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    borderWidth: 1,
    borderColor: '#D7E4F5',
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default CreateGroupScreen;