import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { userApi } from '../api/userApi';

type NavProp = StackNavigationProp<RootStackParamList, 'CreateEbillStep2'>;

const CreateEbillStep2: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { scenario } = route.params;
  const equalSplit = scenario === 'Рівний розподіл';
  const [mySpend, setMySpend] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedTemp, setSelectedTemp] = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const contacts = await userApi.getContacts();
      const mapped = contacts.map((c: any) => ({
        id: c.friend.userId,
        firstName: c.friend.firstName,
        lastName: c.friend.lastName
      }));
      setFriends(mapped);
    } catch {}
  };

  const toggleSelectTemp = (f: any) => {
    const exists = selectedTemp.find((p) => p.id === f.id);
    if (exists) {
      setSelectedTemp((prev) => prev.filter((p) => p.id !== f.id));
      return;
    }
    setSelectedTemp((prev) => [...prev, { ...f, amount: '' }]);
  };

  const applyParticipants = () => {
    setParticipants(selectedTemp);
    setShowPicker(false);
  };

  const removeParticipant = (id: number) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setSelectedTemp((prev) => prev.filter((p) => p.id !== id));
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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            <Text style={styles.label}>Ваші витрати</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#6B7A8A"
              style={styles.input}
              keyboardType="numeric"
              value={mySpend}
              onChangeText={setMySpend}
            />
            <View style={styles.participantsHeader}>
              <Text style={styles.label}>Учасники чеку та їх борги</Text>
              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <Ionicons name="add" size={24} color="#0E2740" />
              </TouchableOpacity>
            </View>
            {participants.length === 0 && (
              <View style={styles.emptyPlaceholder} />
            )}
            {participants.length > 0 && (
              <View style={styles.cardList}>
                {participants.map((p) => (
                  <View key={p.id} style={styles.participantCard}>
                    <Ionicons name="person-circle-outline" size={28} color="#0E2740" />
                    <Text style={styles.participantName}>{p.firstName} {p.lastName}</Text>
                    {!equalSplit && (
                      <TextInput
                        style={styles.amountInput}
                        placeholder="0.00"
                        placeholderTextColor="#6B7A8A"
                        keyboardType="numeric"
                        value={p.amount}
                        onChangeText={(v) =>
                          setParticipants((prev) =>
                            prev.map((x) => x.id === p.id ? { ...x, amount: v } : x)
                          )
                        }
                      />
                    )}
                    <TouchableOpacity onPress={() => removeParticipant(p.id)}>
                      <Ionicons name="trash-outline" size={22} color="#0E2740" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.btnText}>Назад</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => {
                if (participants.length === 0) {
                alert("Додайте хоча б одного учасника");
                return;
                }
                if ((scenario === "Рівний розподіл" || scenario === "Спільні витрати") && (!mySpend || Number(mySpend) <= 0)) {
                alert("Введіть суму Ваших витрат");
                return;
                }
                const formattedParticipants = participants.map(p => ({
                UserId: p.id,
                Amount: !equalSplit ? Number(p.amount) || 0 : undefined,
                PaidAmount: 0
                }));
                navigation.navigate('CreateEbillStep3', { 
                name: route.params.name,
                description: route.params.description,
                scenario: route.params.scenario,
                currency: route.params.currency,
                participants: formattedParticipants,
                total: Number(mySpend) || 0
                });
            }}
            >
              <Text style={styles.nextText}>Далі</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Список моїх друзів</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color="#0E2740" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={friends}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const selected = !!selectedTemp.find((p) => p.id === item.id);
                return (
                  <TouchableOpacity style={styles.friendRow} onPress={() => toggleSelectTemp(item)}>
                    <Ionicons name="person-circle-outline" size={28} color="#0E2740" />
                    <Text style={styles.friendRowName}>{item.firstName} {item.lastName}</Text>
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
            />
            <TouchableOpacity style={styles.modalPrimary} onPress={applyParticipants}>
              <Text style={styles.modalPrimaryText}>Додати</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 14 
},
closeBtn: { 
    alignSelf: 'flex-end', 
    marginBottom: 6 
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
label: { 
    fontSize: 14, 
    color: '#0E2740', 
    marginBottom: 6, 
    fontWeight: '600' 
},
input: { 
    borderWidth: 1, 
    borderColor: '#C9D6E6', 
    borderRadius: 12, 
    padding: 12, 
    color: '#0E2740', 
    marginBottom: 16 
},
participantsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
},
cardList: { 
    borderWidth: 1, 
    borderColor: '#C9D6E6', 
    borderRadius: 12, 
    padding: 10 
},
participantCard: { 
    backgroundColor: '#D8E7FF', 
    borderRadius: 12, 
    padding: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    marginBottom: 8 
},
participantName: { 
    flex: 1, 
    color: '#0E2740', 
    fontWeight: '600' 
},
amountInput: { 
    width: 70, 
    height: 34, 
    borderWidth: 1, 
    borderColor: '#C9D6E6', 
    borderRadius: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 0, 
    color: '#0E2740', 
    backgroundColor: '#fff', 
    textAlign: 'right', 
    textAlignVertical: 'center' 
},
bottomButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20, 
    marginTop: 20 
},
backBtn: { 
    backgroundColor: '#3E74D6', 
    borderRadius: 16, 
    paddingVertical: 14, 
    width: '45%' 
},
nextBtn: { 
    backgroundColor: '#3E74D6', 
    borderRadius: 16, 
    paddingVertical: 14, 
    width: '45%' 
},
btnText: { 
    color: '#FFFFFF', 
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: '700' 
},
nextText: { 
    color: '#FFFFFF', 
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: '700' 
},
overlay: { 
    flex: 1, 
    backgroundColor: '#000000ff', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16 
},
modalCard: { 
    width: '92%', 
    maxWidth: 360, 
    maxHeight: '80%', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 14 
},
modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 14 
},
modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#0E2740' 
},
friendRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#D8E7FF', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 8, 
    gap: 12 
},
friendRowName: { 
    flex: 1, 
    color: '#0E2740', 
    fontWeight: '600', 
    fontSize: 15 
},
friendRowRightIcon: { 
    width: 32, 
    height: 32, 
    borderRadius: 10, 
    backgroundColor: '#EEF5FF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#D7E4F5' 
},
modalPrimary: { 
    marginTop: 10, 
    backgroundColor: '#3E74D6', 
    borderRadius: 14, 
    paddingVertical: 12, 
    alignItems: 'center' 
},
modalPrimaryText: { 
    color: '#FFFFFF', 
    fontWeight: '700' 
},
emptyPlaceholder: {
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 12,
    height: 150,
},
});

export default CreateEbillStep2;
