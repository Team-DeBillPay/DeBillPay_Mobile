import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ebillApi } from '../api/ebillApi';
import { userApi } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';

type BackendParticipantDto = {
  participantId: number;
  userId: number;
  paymentStatus: 'погашений' | 'частково погашений' | 'непогашений' | string;
  assignedAmount: number;
  paidAmount: number;
  balance: number;
  isAdminRights: boolean;
  isEditorRights?: boolean;
};

type EbillDto = {
  ebillId: number;
  name: string;
  currency?: string;
  amountOfDept: number;
  description?: string;
  scenario: string;
  status: 'закритий' | 'активний' | string;
  createdAt: string;
  updatedAt: string;
  organizerId?: number;
  participants: BackendParticipantDto[];
};

type ContactDto = {
  contactId: number;
  status: string;
  friend: {
    userId: number;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
  };
};

type Member = {
  participantId?: number;
  id: number; // userId
  name: string;
  assigned: number;
  paid: number;
  spent?: number;
  debt: number;
  status: 'погашений' | 'частково погашений' | 'непогашений' | string;
  isAdmin: boolean;
  isEditor?: boolean;
  isNew?: boolean;
};

type RouteParams = { ebillId: number };

const CheckDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { ebillId } = route.params as RouteParams;
  const { user } = useAuth();

  const [ebill, setEbill] = useState<EbillDto | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [organizerName, setOrganizerName] = useState<string>('—');
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const membersScrollRef = useRef<ScrollView | null>(null);

  const [isSettingsModal, setIsSettingsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isAddModal, setIsAddModal] = useState(false);
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingParticipantId, setRemovingParticipantId] = useState<number | null>(null);

  const [originalMembersSnapshot, setOriginalMembersSnapshot] = useState<Member[] | null>(null);

  const [editedTotal, setEditedTotal] = useState<number | null>(null);

  const [editedName, setEditedName] = useState<string>('');
  const [editedDescription, setEditedDescription] = useState<string>('');

  const normalizeName = (first?: string, last?: string) =>
    `${last ?? ''} ${first?.[0] ?? ''}.`.trim();

  const formatMoney = (v: number | undefined) =>
    `${(v ?? 0).toString()} ${ebill?.currency || 'грн'}`;

  useEffect(() => {
    void loadDetails();
  }, []);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = (await ebillApi.getEbillById(ebillId)) as EbillDto;
      setEbill(data);

      setEditedTotal(data.amountOfDept ?? null);

      setEditedName(data.name ?? '');
      setEditedDescription(data.description ?? '');

      const userContacts = (await userApi.getContacts()) as ContactDto[];
      setContacts(userContacts || []);

      const isShared = data.scenario === 'спільні витрати';

      const allMembers: Member[] = (data.participants || []).map((p: BackendParticipantDto) => {
        const isMe = p.userId === user?.id;
        const contact = userContacts.find((c) => c.friend.userId === p.userId);

        let name = `User #${p.userId}`;
        if (isMe && user) name = `${user.lastName} ${user.firstName?.[0]}. (Я)`;
        else if (contact) name = normalizeName(contact.friend.firstName, contact.friend.lastName);

        const paid = isShared ? p.balance : p.paidAmount;
        const spent = isShared ? p.paidAmount : undefined;
        const debt = Math.max(p.assignedAmount - (paid ?? 0), 0);

        return {
          participantId: p.participantId,
          id: p.userId,
          name,
          assigned: p.assignedAmount,
          paid,
          spent,
          debt,
          status: p.paymentStatus,
          isAdmin: p.isAdminRights,
          isEditor: p.isEditorRights,
        };
      });

      const org = allMembers.find((m) => m.isAdmin);
      setOrganizerName(org?.name ?? '—');

      const visibleMembers: Member[] =
        data.scenario === 'спільні витрати' ? allMembers : allMembers.filter((m) => !m.isAdmin);

      setMembers(visibleMembers);

      const defaultSelected =
        visibleMembers.find((m) => m.id === user?.id)?.id ??
        visibleMembers[0]?.id ??
        org?.id ??
        null;

      setSelectedMemberId(defaultSelected);

      setOriginalMembersSnapshot(JSON.parse(JSON.stringify(visibleMembers)));
    } catch (e) {
      console.log('Error loading ebill:', e);
      Alert.alert('Помилка', 'Не вдалося завантажити чек');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const selectedMember: Member | null = useMemo(() => {
    if (selectedMemberId == null) return null;
    return members.find((m) => m.id === selectedMemberId) ?? null;
  }, [members, selectedMemberId]);

  const gridItems: Array<Member | { placeholder: true; key: string }> = useMemo(() => {
    const items: Array<Member | { placeholder: true; key: string }> = [...members];
    const remainder = members.length % 3;
    if (remainder !== 0) {
      const need = 3 - remainder;
      for (let i = 0; i < need; i++) items.push({ placeholder: true, key: `ph-${i}` });
    }
    return items;
  }, [members]);

  if (loading || !ebill) {
    return (
      <ScreenWrapper>
        <Text style={{ textAlign: 'center', color: '#0E2740', marginTop: 120 }}>
          Завантаження...
        </Text>
      </ScreenWrapper>
    );
  }

  const allPaid = members.length > 0 && members.every((m) => m.status === 'погашений');
  const hasPartial = members.some((m) => m.status === 'частково погашений');
  let progressText = 'Не погашений';
  let progressBg = '#FFACAE';
  if (allPaid) { progressText = 'Повністю погашений'; progressBg = '#E5F9EC'; }
  else if (hasPartial) { progressText = 'Частково погашений'; progressBg = '#FEEBBB'; }

  const topStatusText = ebill.status === 'закритий' ? 'Закритий' : 'Активний';
  const isMySelected = selectedMember && user ? selectedMember.id === user.id : false;

  const infoAssigned = selectedMember?.assigned ?? 0;
  const infoSpent = selectedMember?.spent ?? 0;
  const infoPaid = selectedMember?.paid ?? 0;
  const infoDebt = selectedMember?.debt ?? 0;
  const isSharedScenario = ebill.scenario === 'спільні витрати';

  const openAddModal = () => setIsAddModal(true);

  const getContactsForAdd = () => {
    const existingUserIds = members.map((m) => m.id);
    return contacts.filter((c) => c.friend && !existingUserIds.includes(c.friend.userId));
  };

  const handleAddParticipant = async (friendUserId: number) => {
    const contact = contacts.find((c) => c.friend.userId === friendUserId);
    const displayName = contact ? normalizeName(contact.friend.firstName, contact.friend.lastName) : `User #${friendUserId}`;

    const newMember: Member = {
      participantId: undefined,
      id: friendUserId,
      name: displayName,
      assigned: 0,
      paid: 0,
      spent: 0,
      debt: 0,
      status: 'непогашений',
      isAdmin: false,
      isNew: true,
    };

    setMembers((prev) => {
      const next = [...prev, newMember];
      return next;
    });
    setSelectedMemberId(friendUserId);
    setIsAddModal(false);

    setTimeout(() => {
      try {
        membersScrollRef.current?.scrollToEnd({ animated: true });
      } catch (e) {
      }
    }, 120);
  };

  const confirmRemoveParticipant = (member: Member) => {
    Alert.alert(
      'Підтвердіть видалення',
      `Видалити ${member.name} з чеку?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Видалити', style: 'destructive', onPress: () => handleRemoveParticipant(member) }
      ]
    );
  };

  const handleRemoveParticipant = async (member: Member) => {
    if (member.isNew) {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      if (selectedMemberId === member.id) setSelectedMemberId(members[0]?.id ?? null);
      return;
    }

    setRemovingParticipantId(member.participantId ?? null);
    try {
      await ebillApi.removeParticipant(ebillId, member.participantId!);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      if (selectedMemberId === member.id) setSelectedMemberId(members[0]?.id ?? null);
      Alert.alert('Готово', 'Учасника видалено');
    } catch (err: any) {
      console.log('Remove participant error:', err);
      Alert.alert('Помилка', 'Не вдалося видалити учасника');
    } finally {
      setRemovingParticipantId(null);
    }
  };

  const updateSelectedField = (
    memberId: number,
    field: 'assigned' | 'paid' | 'spent' | 'name' | 'description',
    value: number | string
  ) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        if (field === 'spent') {
          const newSpent = Number(value) || 0;
          return {
            ...m,
            spent: newSpent,
          };
        }

        if (field === 'assigned') {
          const newAssigned = Number(value) || 0;
          let newPaid = m.paid;
          if (newPaid > newAssigned) {
            newPaid = newAssigned;
            Alert.alert('Увага', 'Сплатив зменшено до величини частки (не може бути більшим за частку).');
          }
          return {
            ...m,
            assigned: newAssigned,
            paid: newPaid,
            debt: Math.max(newAssigned - (newPaid ?? 0), 0),
          };
        }

        if (field === 'paid') {
          const newPaid = Number(value) || 0;
          if (newPaid > m.assigned) {
            Alert.alert('Неможливо', 'Сплатив не може бути більшим за його частку');
            return m;
          }
          return {
            ...m,
            paid: newPaid,
            debt: Math.max(m.assigned - newPaid, 0),
          };
        }

        return m;
      })
    );
  };

  const handleSaveChanges = async () => {
    if (!originalMembersSnapshot || !ebill) {
      Alert.alert('Помилка', 'Немає початкового стану для збереження');
      return;
    }

    setSaving(true);
    try {
      const added = members.filter((m) => m.isNew).map((m) => m.id);
      if (added.length > 0) {
        try {
          await ebillApi.addParticipants(ebillId, added);
        } catch (err) {
          console.log('Add participants error:', err);
          Alert.alert('Помилка', 'Не вдалося додати деяких учасників');
        }
      }

      const metaDto: any = {};
      if (editedName !== ebill.name) metaDto.Name = editedName;
      if ((editedDescription ?? '') !== (ebill.description ?? '')) metaDto.Description = editedDescription;

      if (ebill.scenario === 'рівний розподіл' && editedTotal != null && editedTotal !== ebill.amountOfDept) {
        metaDto.AmountOfDept = editedTotal;
      }

      if (Object.keys(metaDto).length > 0) {
        try {
          await ebillApi.updateEbillParticipants(ebillId, metaDto);
        } catch (err) {
          console.log('Update ebill meta error:', err);
          Alert.alert('Помилка', 'Не вдалося оновити назву/опис/загальну суму');
        }
      }

      for (const m of members.filter((m) => !m.isNew)) {
        const orig = originalMembersSnapshot.find((o) => o.id === m.id);
        if (!orig) continue;

        const dto: any = { participantId: m.participantId };

        if (m.assigned !== orig.assigned) {
          if (ebill.scenario === 'індивідуальні суми') {
            dto.assignedAmount = m.assigned;
          } else {
          }
        }

        if ((m.spent ?? null) !== (orig.spent ?? null)) {
          if (ebill.scenario === 'спільні витрати') {
            dto.paidAmount = m.spent ?? 0;
          } else {
            console.log(`Skipping spent update for scenario ${ebill.scenario} user ${m.id}`);
          }
        }

        if (m.paid !== orig.paid) {
          if (ebill.scenario === 'спільні витрати') {
            console.log(`Skipping balance update for shared scenario user ${m.id}`);
          } else if (ebill.scenario === 'індивідуальні суми') {
            console.log(`Skipping paid update for scenario ${ebill.scenario} user ${m.id}`);
          } else {
          }
        }

        if (Object.keys(dto).length > 1) {
          try {
            await ebillApi.updateEbillParticipants(ebillId, dto);
          } catch (err: any) {
            console.log('Update participant error:', err, dto);
          }
        }
      }

      await loadDetails();
      setEditMode(false);
      Alert.alert('Готово', 'Зміни збережено');
    } catch (err) {
      console.log('Save changes failed:', err);
      Alert.alert('Помилка', 'Не вдалося зберегти зміни');
    } finally {
      setSaving(false);
    }
  };

  const SettingsModal = () => (
    <Modal
      visible={isSettingsModal}
      transparent
      animationType="fade"
      onRequestClose={() => setIsSettingsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalWindow}>
          <TouchableOpacity
            style={styles.modalCloseX}
            onPress={() => setIsSettingsModal(false)}
            accessibilityLabel="Закрити"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color="#0E2740" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Налаштування чеку</Text>

          <TouchableOpacity
            style={styles.modalBtn}
            onPress={() => {
              setIsSettingsModal(false);
              setEditMode(true);
            }}
          >
            <Text style={styles.modalBtnText}>Режим редагування</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalBtn}>
            <Text style={styles.modalBtnText}>Надати права учасникам</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#FFB4B4' }]}>
            <Text style={[styles.modalBtnText, { color: '#fff' }]}>
              Видалити чек
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const AddParticipantModal = () => {
    const available = getContactsForAdd();
    return (
      <Modal visible={isAddModal} transparent animationType="slide" onRequestClose={() => setIsAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalWindow, { maxHeight: '70%' }]}>
            <Text style={styles.modalTitle}>Додати учасника</Text>

            <ScrollView style={{ marginTop: 8 }}>
              {available.length === 0 ? (
                <Text style={{ marginVertical: 12 }}>Немає доступних контактів</Text>
              ) : (
                available.map((item) => (
                  <TouchableOpacity
                    key={String(item.friend.userId)}
                    style={styles.contactRow}
                    onPress={() => handleAddParticipant(item.friend.userId)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={{ fontWeight: '600' }}>
                      {normalizeName(item.friend.firstName, item.friend.lastName)}
                    </Text>
                    <Text style={{ color: '#666' }}>{item.friend.email ?? item.friend.phoneNumber ?? ''}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity style={[styles.modalBtn, { marginTop: 8 }]} onPress={() => setIsAddModal(false)}>
              <Text style={styles.modalBtnText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const ParticipantsView = () => {
    if (editMode) {
      return (
        <View style={{ marginTop: 8 }}>
          <ScrollView ref={membersScrollRef} style={{ maxHeight: 260 }}>
            {members.map((item) => {
              const isSelected = selectedMemberId === item.id;
              return (
                <View
                  key={String(item.id)}
                  style={[
                    styles.memberRow,
                    isSelected ? styles.memberRowSelected : undefined,
                    { marginBottom: 8 },
                  ]}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => setSelectedMemberId(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.memberText, { textAlign: 'left' }]}>{item.name}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.headerIconBtn, styles.trashBtnAsIcon]}
                    onPress={() => confirmRemoveParticipant(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#0E2740" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.membersGrid}>
        {gridItems.map((item, idx) => {
          const isPlaceholder = (item as any).placeholder === true;
          const key = isPlaceholder ? (item as any).key : (item as Member).id.toString();
          const isSelected = !isPlaceholder && (item as Member).id === selectedMemberId;

          const isThird = (idx + 1) % 3 === 0;
          const cardStyle: StyleProp<ViewStyle> = [
            styles.memberBtn,
            {
              marginRight: isThird ? 0 : 8,
              marginBottom: 8,
              flexBasis: '31%',
              maxWidth: '31%',
              opacity: isPlaceholder ? 0 : 1,
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected ? '#0E2740' : 'transparent',
            },
          ];

          if (isPlaceholder) return <View key={key} style={cardStyle} />;

          const m = item as Member;
          return (
            <TouchableOpacity
              key={key}
              style={cardStyle}
              activeOpacity={0.8}
              onPress={() => setSelectedMemberId(m.id)}
            >
              <Text style={styles.memberText}>{m.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <SettingsModal />
      <AddParticipantModal />

      <View style={styles.logoWrap}>
        <Image
          source={require('../../assets/images/logo_white.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.outerCard}>
        <View style={styles.innerCard}>
          <View style={styles.topBarRow}>
            <View style={styles.topLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={24} color="#0E2740" />
              </TouchableOpacity>
            </View>

            <View style={styles.topCenter}>
              <Text style={styles.title}>Про чек</Text>
            </View>

            <View style={styles.topRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => console.log('Open comments for ebill', ebillId)}>
                <Ionicons name="chatbubble-outline" size={20} color="#0E2740" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('CheckHistory', { ebillId })}>
                <Ionicons name="time-outline" size={20} color="#0E2740" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconBtn}
                activeOpacity={0.8}
                onPress={() => setIsSettingsModal(true)}
              >
                <Ionicons name="settings-outline" size={20} color="#0E2740" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={[styles.row, { alignItems: 'center' }]}>
              <Text style={styles.labelName}>Назва:</Text>
              <View style={{ flex: 1, alignItems: 'center' }}>
                {editMode ? (
                  <TextInput
                    value={editedName}
                    onChangeText={setEditedName}
                    style={[styles.nameInput, styles.nameInputEditable]}
                    placeholder="Назва чеку"
                    placeholderTextColor="#A0AFC6"
                  />
                ) : (
                  <Text style={styles.billNameCentered}>“{ebill.name}”</Text>
                )}
              </View>
            </View>

            <View style={[styles.row, { alignItems: 'center' }]}>
              <Text style={styles.label}>Опис:</Text>
              <View style={{ flex: 1 }}>
                {editMode ? (
                  <TextInput
                    value={editedDescription}
                    onChangeText={setEditedDescription}
                    style={[styles.descriptionInput, styles.descriptionInputEditable, { textAlign: 'left' }]}
                    placeholder="Додайте опис (за бажанням)"
                    placeholderTextColor="#A0AFC6"
                  />
                ) : (
                  <Text style={[styles.descriptionText, { textAlign: 'left' }]}>{ebill.description || '—'}</Text>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Статус:</Text>
              <View style={styles.statusCell}>
                <View style={styles.statusActive}>
                  <Text style={styles.statusText}>{topStatusText}</Text>
                </View>
                <View style={[styles.statusPartial, { backgroundColor: progressBg }]}>
                  <Text style={styles.statusTextPartial}>{progressText}</Text>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Сценарій:</Text>
              <Text style={styles.value}>{ebill.scenario}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Організатор:</Text>
              <Text style={styles.value}>{organizerName}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.labelWide}>Загальна сума:</Text>

              {editMode && ebill.scenario === 'рівний розподіл' ? (
                <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                  <TextInput
                    value={editedTotal?.toString() ?? String(ebill.amountOfDept)}
                    keyboardType="numeric"
                    style={[styles.editInput, styles.highlightTotal]}
                    onChangeText={(t) => {
                      const v = Number(t) || 0;
                      setEditedTotal(v);
                    }}
                  />
                </View>
              ) : (
                <Text style={styles.value}>{formatMoney(ebill.amountOfDept)}</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Text style={[styles.label, { marginTop: 16 }]}>Учасники:</Text>

              {editMode && (
                <TouchableOpacity style={styles.addMemberBtn} onPress={openAddModal}>
                  <Ionicons name="person-add-outline" size={18} color="#0E2740" />
                  <Text style={styles.addMemberText}>Додати</Text>
                </TouchableOpacity>
              )}
            </View>

            <ParticipantsView />

            <View style={styles.box}>
              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>
                  {isMySelected ? 'Моя частка:' : 'Його/її частка:'}
                </Text>
                <View style={styles.valueBox}>
                  {editMode && ebill.scenario === 'індивідуальні суми' && selectedMember ? (
                    <TextInput
                      value={String(infoAssigned)}
                      keyboardType="numeric"
                      style={styles.editInput}
                      onChangeText={(v) => {
                        const n = Number(v) || 0;
                        if (selectedMember) updateSelectedField(selectedMember.id, 'assigned', n);
                      }}
                    />
                  ) : (
                    <Text style={styles.boxValue}>{formatMoney(infoAssigned)}</Text>
                  )}
                </View>
              </View>

              {isSharedScenario && (
                <View style={styles.boxRow}>
                  <Text style={styles.boxLabel}>Витратив:</Text>
                  <View style={styles.valueBox}>
                    {editMode && selectedMember ? (
                      <TextInput
                        value={String(infoSpent)}
                        keyboardType="numeric"
                        style={styles.editInput}
                        onChangeText={(v) => {
                          const n = Number(v) || 0;
                          if (selectedMember) updateSelectedField(selectedMember.id, 'spent', n);
                        }}
                      />
                    ) : (
                      <Text style={styles.boxValue}>{formatMoney(infoSpent)}</Text>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>Сплатив:</Text>
                <View style={styles.valueBox}>
                  {editMode ? (
                    (ebill.scenario === 'рівний розподіл' || ebill.scenario === 'індивідуальні суми') ? (
                      <Text style={[styles.boxValue, { color: '#666' }]}>{formatMoney(infoPaid)}</Text>
                    ) : (
                      <Text style={[styles.boxValue, { color: '#666' }]}>{formatMoney(infoPaid)}</Text>
                    )
                  ) : (
                    <Text style={styles.boxValue}>{formatMoney(infoPaid)}</Text>
                  )}
                </View>
              </View>

              <View style={styles.boxRow}>
                <Text style={styles.boxLabel}>Борг:</Text>
                <View style={styles.valueBox}>
                  <Text style={styles.boxValue}>{formatMoney(infoDebt)}</Text>
                </View>
              </View>

              {isMySelected && !editMode && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.payBtn}
                  onPress={() => console.log('Оплатити')}
                >
                  <Ionicons name="card-outline" size={18} color="#0E2740" style={{ marginRight: 6 }} />
                  <Text style={styles.payBtnText}>Оплатити</Text>
                </TouchableOpacity>
              )}
            </View>

            {editMode && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
                <TouchableOpacity
                  style={[styles.saveBtn, { flex: 1, marginRight: 8 }]}
                  onPress={() => {
                    void loadDetails();
                    setEditMode(false);
                  }}
                >
                  <Text style={styles.saveBtnText}>Скасувати</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, { flex: 1, marginLeft: 8 }]}
                  onPress={handleSaveChanges}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Зберегти</Text>
                  )}
                </TouchableOpacity>
              </View>
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
    zIndex: 15
  },
  logo: {
    width: 140,
    height: 42
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
    paddingTop: 10,
    paddingHorizontal: 14,
  },

  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    height: 44,
  },
  topLeft: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  topCenter: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  topRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2740',
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },

  billNameCentered: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E2740',
    textAlign: 'center',
    marginBottom: 6,
  },

  nameInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E2740',
    textAlign: 'center',
    paddingVertical: 6,
    width: '95%',
  },
  nameInputEditable: {
    borderBottomWidth: 2,
    borderBottomColor: '#456DB4',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    marginBottom: 6,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2740',
    width: 90,
  },

  labelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2740',
    width: 70,
  },

  labelWide: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2740',
    width: 130,
  },

  descriptionInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E2740',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  descriptionInputEditable: {
    borderBottomWidth: 1.6,
    borderBottomColor: '#456DB4',
    width: '100%',
  },
  descriptionText: {
    fontSize: 14,
    color: '#24364B',
    width: '100%',
  },

  value: {
    fontSize: 14,
    color: '#24364B',
    maxWidth: '60%',
    textAlign: 'right'
  },
  statusCell: {
    flexShrink: 1,
    alignItems: 'flex-end',
    gap: 6,
    maxWidth: '65%'
  },
  statusActive: {
    backgroundColor: '#7BE495',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    color: '#ffffffff',
    fontSize: 13,
    fontWeight: '600'
  },
  statusPartial: {
    backgroundColor: '#FFEFBF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusTextPartial: {
    color: '#0E2740',
    fontSize: 13,
    fontWeight: '600'
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  memberBtn: {
    backgroundColor: '#B6CDFF',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  memberText: {
    color: '#0E2740',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center'
  },
  box: {
    backgroundColor: '#B6CDFF',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    gap: 12,
  },
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  boxLabel: {
    color: '#0E2740',
    fontWeight: '600'
  },
  valueBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'flex-end'
  },
  boxValue: {
    color: '#0E2740',
    fontWeight: '600'
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  payBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#456DB4',
    borderWidth: 1,
    borderColor: '#D7E4F5',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  payBtnText: {
    color: '#ffffffff',
    fontWeight: '700'
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalWindow: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    position: 'relative',
  },
  modalCloseX: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    elevation: Platform.OS === 'android' ? 30 : undefined,
  },
  modalTitle: {
    fontSize: 18,
    color: "#0E2740",
    fontWeight: "700",
    marginBottom: 12,
    textAlign: 'center'
  },
  modalBtn: {
    paddingVertical: 10,
    backgroundColor: "#EEF5FF",
    borderRadius: 10,
    marginBottom: 10,
  },
  modalBtnText: {
    color: "#0E2740",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  addMemberBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D7E4F5",
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  addMemberText: {
    color: "#0E2740",
    fontWeight: "600",
    marginLeft: 6,
  },
  removeX: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
  },
  editInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    color: "#0E2740",
    fontWeight: "600",
    minWidth: 70,
    textAlign: "right",
  },
  highlightTotal: {
    borderWidth: 2,
    borderColor: '#456DB4',
  },
  contactRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F6F9FF',
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  memberRowSelected: {
    backgroundColor: '#E6F1FF',
    borderWidth: 1,
    borderColor: '#456DB4',
  },

  trashBtnAsIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF5FF',
    borderWidth: 1,
    borderColor: '#D7E4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  saveBtn: {
    backgroundColor: '#456DB4',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
  }
});

export default CheckDetailsScreen;