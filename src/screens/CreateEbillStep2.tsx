import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { userApi } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';

type NavProp = StackNavigationProp<RootStackParamList, 'CreateEbillStep2'>;

type Group = {
  groupId: number;
  name: string;
  members: Array<{
    memberId: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }>;
};

const CreateEbillStep2: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { name, description, scenario, currency } = route.params;

  const [mySpend, setMySpend] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedTemp, setSelectedTemp] = useState<any[]>([]);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<any[]>([]);
  const [pickerMode, setPickerMode] = useState<'friends' | 'groups'>('friends');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    loadContacts();
    loadGroups();
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
    try {
      setLoading(true);
      const contacts = await userApi.getContacts();
      const mapped = contacts.map((c: any) => ({
        id: c.friend.userId,
        firstName: c.friend.firstName,
        lastName: c.friend.lastName,
        email: c.friend.email || '',
        isGroup: false
      }));
      setFriends(mapped);
      setFilteredFriends(mapped);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося завантажити контакти');
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = await userApi.getGroups();
      setGroups(groupsData);
    } catch (error) {

    }
  };

  const toggleSelectFriend = (friend: any) => {
    const exists = selectedTemp.find((p) => p.id === friend.id);
    if (exists) {
      setSelectedTemp((prev) => prev.filter((p) => p.id !== friend.id));
      return;
    }
    setSelectedTemp((prev) => [...prev, {
      ...friend,
      amount: '',
      paidAmount: scenario === 'спільні витрати' ? '' : '0'
    }]);
  };

  const selectGroup = (group: Group) => {
    setSelectedGroup(group);

    const currentUserId = user?.id;
    const filteredGroupMembers = group.members
      .filter((member: any) => member.userId !== currentUserId)
      .map((member: any) => ({
        id: member.userId,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email || '',
        amount: '',
        paidAmount: scenario === 'спільні витрати' ? '' : '0',
        isGroup: false
      }));

    setSelectedGroupMembers(filteredGroupMembers);
    setSelectedTemp(filteredGroupMembers);
  };

  const toggleGroupMemberSelection = (member: any) => {
    const exists = selectedTemp.find((p) => p.id === member.id);
    if (exists) {
      setSelectedTemp((prev) => prev.filter((p) => p.id !== member.id));
    } else {
      setSelectedTemp((prev) => [...prev, member]);
    }
  };

  const selectAllGroupMembers = () => {
    setSelectedTemp(selectedGroupMembers);
  };

  const deselectAllGroupMembers = () => {
    setSelectedTemp([]);
  };

  const backToGroupList = () => {
    setSelectedGroup(null);
    setSelectedGroupMembers([]);
    setSelectedTemp([]);
  };

  const applyParticipants = () => {
    if (selectedTemp.length === 0) {
      Alert.alert('Увага', 'Виберіть хоча б одного учасника');
      return;
    }

    const existingIds = new Set(participants.map(p => p.id));
    const newParticipants = selectedTemp.filter(p => !existingIds.has(p.id));

    setParticipants(prev => [...prev, ...newParticipants]);
    setSelectedTemp([]);
    setSelectedGroup(null);
    setSelectedGroupMembers([]);
    setShowPicker(false);
    setSearchQuery('');
    setPickerMode('friends');
  };

  const removeParticipant = (id: number) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const calculateTotal = () => {
    const mySpendValue = Number(mySpend) || 0;

    if (scenario === 'рівний розподіл') {
      return mySpendValue;
    } else if (scenario === 'індивідуальні суми') {
      const participantsTotal = participants.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      return participantsTotal + mySpendValue;
    } else if (scenario === 'спільні витрати') {
      const participantsTotal = participants.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
      return participantsTotal + mySpendValue;
    }
    return 0;
  };

  const handleNext = () => {
    if (scenario === 'рівний розподіл' || scenario === 'спільні витрати') {
      if (!mySpend || Number(mySpend) <= 0) {
        Alert.alert('Увага', 'Введіть суму ваших витрат більше 0');
        return;
      }
    }

    if (participants.length === 0) {
      Alert.alert('Увага', 'Додайте хоча б одного учасника');
      return;
    }

    if (scenario === 'індивідуальні суми') {
      const invalidParticipants = participants.filter(p => !p.amount || Number(p.amount) <= 0);
      if (invalidParticipants.length > 0) {
        Alert.alert('Увага', 'Всі учасники повинні мати суму більше 0 для індивідуальних сум');
        return;
      }

      if (mySpend && Number(mySpend) < 0) {
        Alert.alert('Увага', 'Ваша доля не може бути від\'ємною');
        return;
      }
    }

    if (scenario === 'спільні витрати') {
      const invalidParticipants = participants.filter(p => p.paidAmount === undefined || p.paidAmount === '' || Number(p.paidAmount) < 0);
      if (invalidParticipants.length > 0) {
        Alert.alert('Увага', 'Всі учасники повинні мати суму витрат (може бути 0)');
        return;
      }

      if (mySpend && Number(mySpend) < 0) {
        Alert.alert('Увага', 'Ваші витрати не можуть бути від\'ємними');
        return;
      }
    }

    const formattedParticipants = participants.map(p => {
      const base = { UserId: p.id };

      if (scenario === 'індивідуальні суми') {
        return {
          ...base,
          Amount: Number(p.amount) || 0,
          PaidAmount: 0
        };
      } else if (scenario === 'спільні витрати') {
        return {
          ...base,
          PaidAmount: Number(p.paidAmount) || 0,
          Amount: 0
        };
      } else {
        return {
          ...base,
          Amount: undefined,
          PaidAmount: 0
        };
      }
    });

    let allParticipants: any[] = [];
    let finalTotal = 0;

    if (scenario === 'рівний розподіл') {
      allParticipants = formattedParticipants;
      finalTotal = Number(mySpend) || 0;

    } else if (scenario === 'індивідуальні суми') {
      const organizerData = {
        UserId: user?.id,
        Amount: Number(mySpend) || 0,
        PaidAmount: Number(mySpend) || 0
      };

      allParticipants = [organizerData, ...formattedParticipants];
      finalTotal = allParticipants.reduce((sum, p) => sum + (p.Amount || 0), 0);

    } else if (scenario === 'спільні витрати') {
      const organizerData = {
        UserId: user?.id,
        Amount: 0,
        PaidAmount: Number(mySpend) || 0
      };

      allParticipants = [organizerData, ...formattedParticipants];
      finalTotal = allParticipants.reduce((sum, p) => sum + (p.PaidAmount || 0), 0);
    }

    if (finalTotal <= 0) {
      Alert.alert('Увага', 'Загальна сума має бути більше 0');
      return;
    }

    if (!user?.id) {
      Alert.alert('Помилка', 'Не вдалося ідентифікувати користувача');
      return;
    }

    navigation.navigate('CreateEbillStep3', {
      name,
      description,
      scenario,
      currency,
      participants: allParticipants,
      total: finalTotal,
    });
  };

  const getPlaceholderText = () => {
    if (scenario === 'індивідуальні суми') return 'Сума боргу';
    if (scenario === 'спільні витрати') return 'Сума боргу';
    return 'Сума';
  };

  const getMySpendLabel = () => {
    if (scenario === 'індивідуальні суми') return 'Ваші витрати';
    if (scenario === 'спільні витрати') return 'Ваші витрати';
    return 'Загальна сума витрат';
  };

  const getParticipantsLabel = () => {
    if (scenario === 'індивідуальні суми') return 'Учасники чеку та їх борги';
    if (scenario === 'спільні витрати') return 'Учасники чеку та їх витрати';
    return 'Учасники чеку';
  };

  const openPicker = () => {
    setPickerMode('friends');
    setSelectedTemp([]);
    setSelectedGroup(null);
    setSelectedGroupMembers([]);
    setSearchQuery('');
    setShowPicker(true);
  };

  const renderPickerContent = () => {
    if (selectedGroup) {
      return (
        <>
          <View style={styles.groupHeaderRow}>
            <TouchableOpacity
              style={styles.backToGroupsBtn}
              onPress={backToGroupList}
            >
              <Ionicons name="arrow-back" size={20} color="#0E2740" />
            </TouchableOpacity>
            <View style={styles.groupTitleContainer}>
              <Text style={styles.groupTitle}>{selectedGroup.name}</Text>
              <Text style={styles.groupSubtitle}>
                {selectedGroupMembers.length} учасників
              </Text>
            </View>
          </View>

          <View style={styles.groupSelectionControls}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={selectAllGroupMembers}
            >
              <Text style={styles.selectAllButtonText}>Вибрати всіх</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deselectAllButton}
              onPress={deselectAllGroupMembers}
            >
              <Text style={styles.deselectAllButtonText}>Скасувати всіх</Text>
            </TouchableOpacity>
          </View>

          {selectedGroupMembers.length === 0 ? (
            <View style={styles.emptyGroupContainer}>
              <Ionicons name="people-outline" size={48} color="#C9D6E6" />
              <Text style={styles.emptyGroupText}>
                У групі немає інших учасників
              </Text>
            </View>
          ) : (
            <FlatList
              data={selectedGroupMembers}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const selected = selectedTemp.find(f => f.id === item.id);
                return (
                  <TouchableOpacity
                    style={[styles.groupMemberRow, selected && styles.groupMemberRowSelected]}
                    onPress={() => toggleGroupMemberSelection(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.groupMemberAvatarContainer}>
                      <Ionicons
                        name="person-circle-outline"
                        size={28}
                        color={selected ? "#3E74D6" : "#0E2740"}
                      />
                    </View>
                    <View style={styles.groupMemberInfo}>
                      <Text style={[styles.groupMemberRowName, selected && styles.groupMemberRowNameSelected]}>
                        {item.firstName} {item.lastName}
                      </Text>
                      {item.email ? (
                        <Text style={styles.groupMemberRowEmail} numberOfLines={1}>
                          {item.email}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[styles.groupMemberRightIcon, selected && styles.groupMemberRightIconSelected]}>
                      <Ionicons
                        name={selected ? "checkmark" : "add"}
                        size={18}
                        color={selected ? "#FFFFFF" : "#0E2740"}
                      />
                    </View>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.groupMembersList}
            />
          )}
        </>
      );
    }

    if (pickerMode === 'friends') {
      return (
        <>
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
                    setShowPicker(false);
                    navigation.navigate('AddFriend');
                  }}
                >
                  <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.addFriendText}>Додати друга</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredFriends}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const selected = selectedTemp.find(f => f.id === item.id);
                return (
                  <TouchableOpacity
                    style={[styles.friendRow, selected && styles.friendRowSelected]}
                    onPress={() => toggleSelectFriend(item)}
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
          )}
        </>
      );
    }

    return (
      <>
        {groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#C9D6E6" />
            <Text style={styles.emptyModalText}>У вас поки що немає груп</Text>
            <TouchableOpacity
              style={styles.addFriendBtn}
              onPress={() => {
                setShowPicker(false);
                navigation.navigate('CreateGroup');
              }}
            >
              <Ionicons name="add-outline" size={18} color="#FFFFFF" />
              <Text style={styles.addFriendText}>Створити групу</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={groups}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => String(item.groupId)}
            renderItem={({ item }) => {
              const currentUserId = user?.id;
              const filteredMembers = item.members?.filter((member: any) => member.userId !== currentUserId) || [];
              const groupMembersCount = filteredMembers.length;

              return (
                <TouchableOpacity
                  style={styles.groupRow}
                  onPress={() => selectGroup(item)}
                  activeOpacity={0.7}
                  disabled={groupMembersCount === 0}
                >
                  <View style={styles.groupIconContainer}>
                    <Ionicons
                      name="people-outline"
                      size={28}
                      color={groupMembersCount === 0 ? "#C9D6E6" : "#0E2740"}
                    />
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={[styles.groupRowName, groupMembersCount === 0 && styles.groupRowNameEmpty]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.groupMemberCount, groupMembersCount === 0 && styles.groupMemberCountEmpty]}>
                      {groupMembersCount === 0 ? 'Тільки ви в групі' : `${groupMembersCount} учасників`}
                    </Text>
                  </View>
                  <View style={[styles.groupRowRightIcon, groupMembersCount === 0 && styles.groupRowRightIconDisabled]}>
                    <Ionicons
                      name={groupMembersCount === 0 ? "close" : "chevron-forward"}
                      size={18}
                      color={groupMembersCount === 0 ? "#C9D6E6" : "#0E2740"}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.groupsList}
          />
        )}
      </>
    );
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
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#0E2740" />
          </TouchableOpacity>
          <Text style={styles.title}>Створення чеку</Text>
          <View style={styles.stepsRow}>
            <View style={styles.stepCircle}><Text style={styles.stepNum}>1</Text></View>
            <View style={styles.stepLine} />
            <View style={[styles.stepCircle, styles.stepActive]}><Text style={styles.stepNum}>2</Text></View>
            <View style={styles.stepLine} />
            <View style={styles.stepCircle}><Text style={styles.stepNum}>3</Text></View>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.label}>{getMySpendLabel()}</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#6B7A8A"
              style={styles.input}
              keyboardType="numeric"
              value={mySpend}
              onChangeText={(v) => setMySpend(v.replace(/[^0-9.]/g, ''))}
            />

            <View style={styles.participantsHeader}>
              <View>
                <Text style={styles.label}>{getParticipantsLabel()}</Text>
                <Text style={styles.subLabel}>
                  {participants.length} обрано
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={openPicker}
              >
                <Ionicons name="person-add-outline" size={18} color="#0E2740" />
                <Text style={styles.addButtonText}>Додати</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.participantsContainer}>
              {participants.length === 0 ? (
                <View style={styles.emptyPlaceholder}>
                  <Text style={styles.emptyText}>Натисніть "Додати" щоб вибрати учасників</Text>
                </View>
              ) : (
                <FlatList
                  data={participants}
                  showsVerticalScrollIndicator={true}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <View style={styles.participantCard}>
                      <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle-outline" size={28} color="#0E2740" />
                      </View>
                      <View style={styles.participantInfo}>
                        <Text style={styles.participantName}>{item.firstName} {item.lastName}</Text>
                        {item.email && <Text style={styles.participantEmail}>{item.email}</Text>}
                      </View>

                      {(scenario === 'індивідуальні суми' || scenario === 'спільні витрати') && (
                        <TextInput
                          style={styles.amountInput}
                          placeholder={getPlaceholderText()}
                          placeholderTextColor="#6B7A8A"
                          keyboardType="numeric"
                          value={scenario === 'спільні витрати' ? item.paidAmount : item.amount}
                          onChangeText={(v) => {
                            const cleanValue = v.replace(/[^0-9.]/g, '');
                            setParticipants((prev) =>
                              prev.map((x) => {
                                if (x.id === item.id) {
                                  return scenario === 'спільні витрати'
                                    ? { ...x, paidAmount: cleanValue }
                                    : { ...x, amount: cleanValue };
                                }
                                return x;
                              })
                            );
                          }}
                        />
                      )}

                      <TouchableOpacity
                        onPress={() => removeParticipant(item.id)}
                        style={styles.trashBtn}
                      >
                        <Ionicons name="trash-outline" size={22} color="#0E2740" />
                      </TouchableOpacity>
                    </View>
                  )}
                  contentContainerStyle={styles.participantsListContent}
                />
              )}
            </View>

            {participants.length > 0 && (
              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>Загальна сума:</Text>
                <Text style={styles.summaryValue}>
                  {calculateTotal().toFixed(2)} {currency}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>Назад</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn, participants.length === 0 && styles.nextBtnDisabled]}
              onPress={handleNext}
              disabled={participants.length === 0}
            >
              <Text style={styles.nextBtnText}>Далі</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {selectedGroup ? selectedGroup.name :
                    pickerMode === 'friends' ? 'Вибір учасників' : 'Вибір групи'}
                </Text>
                {pickerMode === 'friends' && !selectedGroup && (
                  <Text style={styles.modalSubtitle}>
                    {selectedTemp.length} вибрано
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => {
                  setShowPicker(false);
                  setSelectedTemp([]);
                  setSelectedGroup(null);
                  setSelectedGroupMembers([]);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close" size={24} color="#0E2740" />
              </TouchableOpacity>
            </View>

            {!selectedGroup && (
              <View style={styles.pickerModeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, pickerMode === 'friends' && styles.modeButtonActive]}
                  onPress={() => setPickerMode('friends')}
                >
                  <Text style={[styles.modeButtonText, pickerMode === 'friends' && styles.modeButtonTextActive]}>
                    Друзі
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, pickerMode === 'groups' && styles.modeButtonActive]}
                  onPress={() => setPickerMode('groups')}
                >
                  <Text style={[styles.modeButtonText, pickerMode === 'groups' && styles.modeButtonTextActive]}>
                    Групи
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {pickerMode === 'friends' && !selectedGroup && (
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
            )}

            {renderPickerContent()}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalSecondary, { marginRight: 8 }]}
                onPress={() => {
                  setShowPicker(false);
                  setSelectedTemp([]);
                  setSelectedGroup(null);
                  setSelectedGroupMembers([]);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.modalSecondaryText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimary, selectedTemp.length === 0 && styles.modalPrimaryDisabled]}
                onPress={applyParticipants}
                disabled={selectedTemp.length === 0}
              >
                <Text style={styles.modalPrimaryText}>Додати ({selectedTemp.length})</Text>
              </TouchableOpacity>
            </View>
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
    zIndex: 10
  },
  logo: {
    width: 140,
    height: 42
  },
  outerCard: {
    width: '90%',
    height: '82%',
    maxWidth: 360,
    alignSelf: 'center',
    borderRadius: 22,
    backgroundColor: '#B6CDFF',
    padding: 12
  },
  innerCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 18,
    paddingHorizontal: 14,
    justifyContent: 'space-between'
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginBottom: 6,
    padding: 4
  },
  title: {
    textAlign: 'center',
    color: '#0E2740',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#C9D6E6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepActive: {
    backgroundColor: '#3E74D6',
    borderColor: '#3E74D6'
  },
  stepNum: {
    color: '#0E2740',
    fontWeight: '700'
  },
  stepLine: {
    width: 58,
    height: 3,
    backgroundColor: '#C9D6E6',
    marginHorizontal: 6
  },
  contentContainer: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#0E2740',
    marginBottom: 6,
    fontWeight: '600'
  },
  subLabel: {
    fontSize: 12,
    color: '#6B7A8A',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 12,
    padding: 12,
    color: '#0E2740',
    marginBottom: 16,
    fontSize: 16
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8
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
  participantsContainer: {
    flex: 1,
    minHeight: 150,
    maxHeight: 300,
    marginBottom: 16,
  },
  participantsListContent: {
    paddingBottom: 8,
  },
  participantCard: {
    backgroundColor: '#D8E7FF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
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
    marginBottom: 2
  },
  participantEmail: {
    color: '#6B7A8A',
    fontSize: 12,
  },
  amountInput: {
    width: 80,
    height: 36,
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 8,
    paddingHorizontal: 8,
    color: '#0E2740',
    backgroundColor: '#fff',
    textAlign: 'right',
    fontSize: 12,
    marginRight: 12
  },
  trashBtn: {
    padding: 4
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8F0FE',
  },
  backBtn: {
    backgroundColor: '#EEF5FF',
    borderRadius: 16,
    paddingVertical: 14,
    width: '45%',
    borderWidth: 1,
    borderColor: '#D7E4F5'
  },
  backBtnText: {
    color: '#0E2740',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700'
  },
  nextBtn: {
    backgroundColor: '#3E74D6',
    borderRadius: 16,
    paddingVertical: 14,
    width: '45%'
  },
  nextBtnDisabled: {
    backgroundColor: '#C9D6E6',
  },
  nextBtnText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  modalCard: {
    width: '92%',
    maxWidth: 380,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
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
  pickerModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F6F9FF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F0FE',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#3E74D6',
  },
  modeButtonText: {
    color: '#6B7A8A',
    fontSize: 14,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
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
  emptyGroupContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyGroupText: {
    color: '#6B7A8A',
    fontSize: 14,
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
  groupsList: {
    paddingBottom: 8,
  },
  groupMembersList: {
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
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8E7FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  groupIconContainer: {
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupRowName: {
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  groupRowNameEmpty: {
    color: '#C9D6E6',
  },
  groupMemberCount: {
    color: '#6B7A8A',
    fontSize: 12,
  },
  groupMemberCountEmpty: {
    color: '#C9D6E6',
  },
  groupRowRightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  groupRowRightIconDisabled: {
    backgroundColor: '#F6F9FF',
    borderColor: '#E8F0FE',
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
  emptyPlaceholder: {
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 12,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F6F9FF',
  },
  emptyText: {
    color: '#6B7A8A',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F6F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7E4F5'
  },
  summaryLabel: {
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 16
  },
  summaryValue: {
    color: '#3E74D6',
    fontWeight: '700',
    fontSize: 18
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backToGroupsBtn: {
    padding: 8,
    marginRight: 12,
  },
  groupTitleContainer: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E2740',
    marginBottom: 2,
  },
  groupSubtitle: {
    fontSize: 13,
    color: '#6B7A8A',
  },
  groupSelectionControls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  selectAllButton: {
    flex: 1,
    backgroundColor: '#3E74D6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectAllButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  deselectAllButton: {
    flex: 1,
    backgroundColor: '#EEF5FF',
    borderWidth: 1,
    borderColor: '#D7E4F5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deselectAllButtonText: {
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 14,
  },
  groupMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8E7FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  groupMemberRowSelected: {
    backgroundColor: '#E6F1FF',
    borderWidth: 1,
    borderColor: '#3E74D6',
  },
  groupMemberAvatarContainer: {
    marginRight: 12,
  },
  groupMemberInfo: {
    flex: 1,
  },
  groupMemberRowName: {
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  groupMemberRowNameSelected: {
    color: '#3E74D6',
  },
  groupMemberRowEmail: {
    color: '#6B7A8A',
    fontSize: 12,
  },
  groupMemberRightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  groupMemberRightIconSelected: {
    backgroundColor: '#3E74D6',
    borderColor: '#3E74D6',
  },
});

export default CreateEbillStep2;