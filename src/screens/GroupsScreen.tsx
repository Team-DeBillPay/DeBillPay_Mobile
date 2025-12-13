import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { userApi } from '../api/userApi';

type NavigationProp = StackNavigationProp<RootStackParamList>;

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
  expanded?: boolean;
};

const GroupsScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [])
  );

  const loadGroups = async () => {
    setLoading(true);
    try {
      const groupsData = await userApi.getGroups();
      const groupsWithExpanded = groupsData.map((group: Group) => ({
        ...group,
        expanded: false,
      }));
      setGroups(groupsWithExpanded);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити групи');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupExpansion = (groupId: number) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.groupId === groupId
          ? { ...group, expanded: !group.expanded }
          : group
      )
    );
  };

  const deleteGroup = async (groupId: number, groupName: string) => {
    Alert.alert(
      'Видалення групи',
      `Ви впевнені, що хочете видалити групу "${groupName}"?`,
      [
        {
          text: 'Скасувати',
          style: 'cancel',
        },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await userApi.deleteGroup(groupId);
              loadGroups();
              Alert.alert('Успішно', 'Групу видалено');
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося видалити групу');
            }
          },
        },
      ]
    );
  };

  const getMemberCountText = (members: any[]) => {
    const count = members?.length || 0;
    if (count === 1) return '1 учасник';
    if (count >= 2 && count <= 4) return `${count} учасники`;
    return `${count} учасників`;
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

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
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#0E2740" />
            </TouchableOpacity>

            <View style={styles.rightIcons}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => navigation.navigate('CreateGroup')}
              >
                <Ionicons name="add-outline" size={20} color="#0E2740" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerRow}>
            <Text style={styles.title}>Мої групи</Text>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Знайти групу"
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
            {loading ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Завантаження...</Text>
              </View>
            ) : filteredGroups.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="people-outline" size={48} color="#C9D6E6" />
                <Text style={styles.emptyText}>
                  {search
                    ? 'Групу не знайдено'
                    : 'Поки що у Вас немає жодної групи…'}
                </Text>
                {!search && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('CreateGroup')}
                  >
                    <Text style={styles.addLink}>Створити групу</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredGroups.map((group) => (
                <View key={group.groupId} style={styles.groupCard}>
                  <TouchableOpacity
                    style={styles.groupHeader}
                    onPress={() => toggleGroupExpansion(group.groupId)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.groupHeaderLeft}>
                      <View style={styles.groupIconContainer}>
                        <Ionicons name="people-outline" size={24} color="#0E2740" />
                      </View>
                      <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.memberCount}>
                          {getMemberCountText(group.members)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.groupHeaderRight}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteGroup(group.groupId, group.name);
                        }}
                      >
                        <Ionicons name="trash-outline" size={20} color="#0E2740" />
                      </TouchableOpacity>
                      <Ionicons
                        name={group.expanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#0E2740"
                      />
                    </View>
                  </TouchableOpacity>

                  {group.expanded && group.members && group.members.length > 0 && (
                    <View style={styles.membersContainer}>
                      <View style={styles.membersList}>
                        {group.members.map((member) => (
                          <View key={member.userId} style={styles.memberItem}>
                            <Ionicons
                              name="person-circle-outline"
                              size={22}
                              color="#6B7A8A"
                            />
                            <Text style={styles.memberName}>
                              {member.firstName} {member.lastName}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
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
    marginBottom: 20,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  backBtn: {
    padding: 4,
  },
  rightIcons: {
    flexDirection: 'row',
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
    gap: 12,
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6B7A8A',
    fontSize: 14,
    textAlign: 'center',
  },
  addLink: {
    color: '#3E74D6',
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  groupCard: {
    backgroundColor: '#D8E7FF',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  memberCount: {
    color: '#6B7A8A',
    fontSize: 12,
  },
  groupHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  membersContainer: {
    backgroundColor: '#EEF5FF',
    borderTopWidth: 1,
    borderTopColor: '#C9D6E6',
  },
  membersList: {
    padding: 12,
    paddingTop: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  memberName: {
    color: '#0E2740',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default GroupsScreen;