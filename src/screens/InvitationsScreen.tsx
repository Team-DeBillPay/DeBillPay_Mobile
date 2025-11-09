import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { userApi } from '../api/userApi';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Invitations'>;

const InvitationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      const invitations = await userApi.getInvitations();
      const mapped = invitations.map((inv: any) => ({
        id: inv.invitationId,
        firstName: inv.sender.firstName,
        lastName: inv.sender.lastName
      }));
      setInvites(mapped);
    } catch {
      setInvites([]);
    }
  };

  const accept = async (id: number) => {
    await userApi.acceptInvite(id);
    loadInvites();
  };

  const reject = async (id: number) => {
    await userApi.rejectInvite(id);
    loadInvites();
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
            style={styles.backBtn} 
            onPress={() => navigation.goBack()} 
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#0E2740" />
          </TouchableOpacity>

          <Text style={styles.title}>Мої запрошення</Text>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {invites.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Поки що у Вас немає запрошень...</Text>
              </View>
            ) : (
              invites.map((inv, index) => (
                <View key={index} style={styles.inviteCard}>
                  
                  <View style={styles.inviteHeader}>
                    <Ionicons name="person-circle-outline" size={34} color="#FFFFFF" />
                    <View>
                      <Text style={styles.inviteName}>{inv.firstName} {inv.lastName}</Text>
                      <Text style={styles.inviteSubtitle}>хоче бути вашим другом</Text>
                    </View>
                  </View>

                  <Text style={styles.questionText}>Прийняти?</Text>

                  <View style={styles.buttonsRow}>
                    <TouchableOpacity onPress={() => accept(inv.id)} style={styles.acceptBtn}>
                      <Text style={styles.acceptText}>Так</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => reject(inv.id)} style={styles.rejectBtn}>
                      <Text style={styles.rejectText}>Ні</Text>
                    </TouchableOpacity>
                  </View>
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
    zIndex: 10 
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
    marginBottom: 20
  },
  innerCard: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    paddingTop: 16, 
    paddingHorizontal: 14 
  },
  backBtn: { 
    marginBottom: 10 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#0E2740', 
    textAlign: 'center',
    marginBottom: 20 
  },
  scrollContent: { 
    paddingBottom: 20 
  },
  emptyWrap: { 
    flex: 1, alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 40 
  },
  emptyText: { 
    fontSize: 14, color: '#6B7A8A' 
  },
  inviteCard: {
    backgroundColor: '#456DB4',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  inviteHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  inviteName: { 
    color: '#FFFFFF', 
    fontWeight: '700', 
    fontSize: 16 
  },
  inviteSubtitle: { 
    color: '#E7EEFF', 
    fontSize: 13 
  },
  questionText: { 
    textAlign: 'center', 
    color: '#FFFFFF', 
    marginVertical: 14, 
    fontSize: 14 
  },
  buttonsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  acceptBtn: { 
    backgroundColor: '#FFFFFF', 
    width: 100,
    height: 38,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rejectBtn: { 
    backgroundColor: '#FFFFFF', 
    width: 100,
    height: 38,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8
  },
  acceptText: { 
    color: '#0E2740', 
    fontWeight: '700' 
  },
  rejectText: { 
    color: '#0E2740', 
    fontWeight: '700' 
  },
});

export default InvitationsScreen;
