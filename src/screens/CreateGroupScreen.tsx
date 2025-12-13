import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const contacts = await userApi.getContacts();
      const mapped = contacts.map((c: any) => ({
        id: c.friend.userId,
        firstName: c.friend.firstName,
        lastName: c.friend.lastName,
      }));
      setFriends(mapped);
    } catch (error) {
      console.error('Error loading contacts:', error);
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
      alert("Введіть назву групи");
      return;
    }

    if (selectedFriends.length === 0) {
      alert("Оберіть хоча б одного друга для групи");
      return;
    }

    setCreating(true);
    try {
      const friendIds = selectedFriends.map(f => f.id);
      await userApi.createGroup({
        name: groupName.trim(),
        friendIds,
      });

      alert(`Група "${groupName}" успішно створена!`);
      navigation.goBack();
    } catch (error: any) {
      console.error('Error creating group:', error);
      alert(error.response?.data?.error || "Не вдалося створити групу");
    } finally {
      setCreating(false);
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
            <Text style={styles.label}>Учасники групи</Text>
            <TouchableOpacity onPress={() => setShowFriendPicker(true)}>
              <Ionicons name="add" size={24} color="#0E2740" />
            </TouchableOpacity>
          </View>

          {selectedFriends.length === 0 ? (
            <View style={styles.emptyPlaceholder}>
              <Ionicons name="people-outline" size={48} color="#C9D6E6" />
              <Text style={styles.emptyText}>Поки що немає учасників</Text>
              <Text style={styles.emptyHint}>
                Натисніть + щоб додати друзів
              </Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {selectedFriends.map((friend) => (
                <View key={friend.id} style={styles.participantCard}>
                  <Ionicons name="person-circle-outline" size={28} color="#0E2740" />
                  <Text style={styles.participantName}>
                    {friend.firstName} {friend.lastName}
                  </Text>
                  <TouchableOpacity onPress={() => removeFriend(friend.id)}>
                    <Ionicons name="trash-outline" size={22} color="#0E2740" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.createBtn, creating && styles.createBtnDisabled]}
              onPress={createGroup}
              disabled={creating || !groupName.trim() || selectedFriends.length === 0}
            >
              <Text style={styles.createBtnText}>
                {creating ? 'Створення...' : 'Створити групу'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={showFriendPicker} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Список моїх друзів</Text>
              <TouchableOpacity onPress={() => setShowFriendPicker(false)}>
                <Ionicons name="close" size={24} color="#0E2740" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Завантаження друзів...</Text>
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="#C9D6E6" />
                <Text style={styles.emptyModalText}>У вас поки що немає друзів</Text>
                <TouchableOpacity
                  style={styles.addFriendBtn}
                  onPress={() => {
                    setShowFriendPicker(false);
                    navigation.navigate('AddFriend');
                  }}
                >
                  <Text style={styles.addFriendText}>Додати друга</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <FlatList
                  data={friends}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => {
                    const selected = selectedFriends.find(f => f.id === item.id);
                    return (
                      <TouchableOpacity
                        style={styles.friendRow}
                        onPress={() => toggleFriendSelection(item)}
                      >
                        <Ionicons name="person-circle-outline" size={28} color="#0E2740" />
                        <Text style={styles.friendRowName}>
                          {item.firstName} {item.lastName}
                        </Text>
                        <View style={styles.friendRowRightIcon}>
                          <Ionicons
                            name={selected ? "checkmark" : "add"}
                            size={18}
                            color={selected ? "#3E74D6" : "#0E2740"}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={styles.friendsList}
                />
                <TouchableOpacity
                  style={styles.modalPrimary}
                  onPress={() => setShowFriendPicker(false)}
                >
                  <Text style={styles.modalPrimaryText}>Готово</Text>
                </TouchableOpacity>
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
  },
  title: {
    textAlign: 'center',
    color: '#0E2740',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#0E2740',
    marginBottom: 6,
    fontWeight: '600',
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
  emptyPlaceholder: {
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 12,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    color: '#6B7A8A',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#6B7A8A',
    fontSize: 12,
  },
  cardList: {
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 12,
    padding: 10,
    maxHeight: 200,
  },
  participantCard: {
    backgroundColor: '#D8E7FF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  participantName: {
    flex: 1,
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 15,
  },
  bottomButtons: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  createBtn: {
    backgroundColor: '#3E74D6',
    borderRadius: 16,
    paddingVertical: 14,
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
    backgroundColor: '#000000ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '92%',
    maxWidth: 360,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E2740',
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6B7A8A',
    fontSize: 14,
  },
  emptyContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyModalText: {
    color: '#6B7A8A',
    fontSize: 14,
    textAlign: 'center',
  },
  addFriendBtn: {
    backgroundColor: '#3E74D6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  addFriendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  friendsList: {
    paddingBottom: 10,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8E7FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  friendRowName: {
    flex: 1,
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 15,
  },
  friendRowRightIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  modalPrimary: {
    marginTop: 10,
    backgroundColor: '#3E74D6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CreateGroupScreen;