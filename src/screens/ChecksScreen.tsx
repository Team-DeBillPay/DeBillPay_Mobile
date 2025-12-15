import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ebillApi } from '../api/ebillApi';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../contexts/AuthContext';

const ChecksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
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

  // Функция для получения статуса текущего пользователя в чеке
  const getMyStatus = (check: any) => {
    if (!user) return 'непогашений';
    
    // Находим участника с текущим userId
    const myParticipant = check.participants?.find((p: any) => p.userId === user.id);
    
    if (!myParticipant) {
      // Если пользователь организатор (но не в списке участников)
      // Для сценариев 1 и 2 организатор всегда "оплачен"
      if (check.scenario === 'рівний розподіл' || check.scenario === 'індивідуальні суми') {
        return 'погашений';
      }
      return 'непогашений';
    }
    
    return myParticipant.paymentStatus || 'непогашений';
  };

  // Функция для получения цвета статуса текущего пользователя
  const getMyStatusColor = (status: string) => {
    switch (status) {
      case 'погашений':
        return '#6BCB71'; // Зеленый
      case 'частково погашений':
        return '#F6D959'; // Желтый
      case 'непогашений':
        return '#E94B4B'; // Красный
      default:
        return '#E94B4B';
    }
  };

  // Функция для получения текста статуса
  const getMyStatusText = (status: string) => {
    switch (status) {
      case 'погашений':
        return 'Погашений';
      case 'частково погашений':
        return 'Частково погашений';
      case 'непогашений':
        return 'Не погашений';
      default:
        return 'Не погашений';
    }
  };

  // Функция для проверки статуса всего чека (закрыт/открыт)
  const isCheckClosed = (check: any) => {
    // Чек закрыт если все участники полностью погасили
    return check.participants?.every((p: any) => p.paymentStatus === 'погашений') || false;
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
            {filteredChecks.map((c) => {
              const myStatus = getMyStatus(c);
              const statusColor = getMyStatusColor(myStatus);
              const statusText = getMyStatusText(myStatus);
              const isClosed = isCheckClosed(c);
              
              return (
                <View key={c.ebillId} style={styles.checkCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.date}>{moment(c.createdAt).format("DD.MM.YYYY")}</Text>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={styles.statusText}>{statusText}</Text>
                      <Ionicons
                        name={isClosed ? "lock-closed" : "lock-open"}
                        size={16}
                        color="#E7EEFF"
                        style={{ marginLeft: 6 }}
                      />
                    </View>
                  </View>
                  <Text style={styles.name}>{c.name}</Text>
                  
                  <TouchableOpacity 
                    style={styles.detailBtn} 
                    activeOpacity={0.85} 
                    onPress={() => navigation.navigate('CheckDetails', { ebillId: c.ebillId })}
                  >
                    <Text style={styles.detailText}>Детальніше</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
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
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    color: '#E7EEFF',
    fontSize: 13,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
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