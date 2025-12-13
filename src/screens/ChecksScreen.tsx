import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ebillApi } from '../api/ebillApi';
import ScreenWrapper from '../components/ScreenWrapper';

const ChecksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [checks, setChecks] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadChecks();
  }, []);

const loadChecks = async () => {
  try {
    const res = await ebillApi.getEbills();
    setChecks((res ?? []).sort(
      (a:any, b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  } catch (e) {
    setChecks([]);
  }
};

  const filteredChecks = checks.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

const getStatusColor = (participants: any[]) => {
  const total = participants.length;
  const fullPaid = participants.filter(p => p.paymentStatus === 'погашений').length;
  const partial = participants.filter(p => p.paymentStatus === 'частково погашений').length;
  if (fullPaid === total) return '#6BCB71';
  if (partial > 0) return '#F6D959';
  return '#E94B4B';                        
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
          <Text style={styles.title}>Мої чеки</Text>
          <View style={styles.searchRow}>
            <TextInput
              placeholder="Пошук за назвою"
              placeholderTextColor="#6B7A8A"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            <View style={styles.searchIconWrap}>
              <Ionicons name="search" size={20} color="#0E2740" />
            </View>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            {filteredChecks.map((c) => (
              <View key={c.ebillId} style={styles.checkCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.date}>{moment(c.createdAt).format("DD.MM.YYYY")}</Text>
                  <View style={styles.statusWrap}>
                    <View style={[styles.dot, { backgroundColor: getStatusColor(c.participants) }]} />
                    <Ionicons
                      name={c.status === 'закритий' ? "lock-closed" : "lock-open"}
                      size={20}
                      color="#C9D6E6"
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </View>
                <Text style={styles.name}>{c.name}</Text>
                <TouchableOpacity style={styles.detailBtn} activeOpacity={0.85} onPress={() => navigation.navigate('CheckDetails', { ebillId: c.ebillId })}>
                  <Text style={styles.detailText}>Детальніше</Text>
                </TouchableOpacity>
              </View>
            ))}
            {filteredChecks.length === 0 && (
              <Text style={styles.emptyText}>Чеків не знайдено...</Text>
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
    height: 42
  },
  outerCard: {
    width: '90%',
    height: '85%',
    maxWidth: 360,
    alignSelf: 'center',
    borderRadius: 22,
    backgroundColor: '#B6CDFF',
    padding: 12,
    marginBottom: 20,
  },
  innerCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    paddingTop: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    color: '#0E2740',
    fontWeight: '700',
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#0E2740',
    backgroundColor: '#FFFFFF',
  },
  searchIconWrap: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#EEF5FF',
    borderWidth: 1,
    borderColor: '#D7E4F5',
  },
  checkCard: {
    backgroundColor: '#456DB4',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    color: '#E7EEFF',
    fontSize: 13,
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 16, 
    height: 16,
    borderRadius: 8,
  },
  name: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginVertical: 10,
  },
  detailBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#B6CDFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  detailText: {
    color: '#0E2740',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7A8A',
    marginTop: 20,
  },
});

export default ChecksScreen;
