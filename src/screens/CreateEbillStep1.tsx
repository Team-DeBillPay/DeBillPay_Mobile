import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';

type NavProp = StackNavigationProp<RootStackParamList, 'CreateEbillStep1'>;

const CreateEbillStep1: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scenario, setScenario] = useState('Рівний розподіл');
  const [currency, setCurrency] = useState('UAH');
  const scenarios = ['Рівний розподіл', 'Індивідуальні суми', 'Спільні витрати'];
  const currencies = ['UAH', 'USD', 'EUR'];
  const [openScenario, setOpenScenario] = useState(false);
  const [openCurrency, setOpenCurrency] = useState(false);
  const [error, setError] = useState('');

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
            <View style={[styles.stepCircle, styles.stepActive]}><Text style={styles.stepNum}>1</Text></View>
            <View style={styles.stepLine} />
            <View style={styles.stepCircle}><Text style={styles.stepNum}>2</Text></View>
            <View style={styles.stepLine} />
            <View style={styles.stepCircle}><Text style={styles.stepNum}>3</Text></View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
            <TextInput
            placeholder="Назва чеку"
            placeholderTextColor="#6B7A8A"
            style={[styles.input, error ? { borderColor: '#D9534F' } : null]}
            value={name}
            onChangeText={(v) => {
                setName(v);
                if (error) setError('');
            }}
            />
            {error ? (
            <Text style={{ color: '#D9534F', marginBottom: 10, marginLeft: 4 }}>
                {error}
            </Text>
            ) : null}
            <TextInput
              placeholder="Опис чеку"
              placeholderTextColor="#6B7A8A"
              style={[styles.input, { height: 80 }]}
              multiline
              value={description}
              onChangeText={setDescription}
            />
            <Text style={styles.label}>Сценарій розрахунку</Text>
            <View style={[styles.dropdownWrap, styles.scenarioWrap]}>

              <TouchableOpacity style={styles.dropdownHeader} onPress={() => setOpenScenario(!openScenario)}>
                <Text style={styles.dropdownText}>{scenario}</Text>
                <Ionicons name={openScenario ? "chevron-up" : "chevron-down"} size={18} color="#6B7A8A" />
              </TouchableOpacity>
              {openScenario && (
                <View style={styles.dropdownList}>
                  {scenarios.map((s) => (
                    <TouchableOpacity key={s} style={styles.dropdownItem} onPress={() => { setScenario(s); setOpenScenario(false); }}>
                      <Text style={styles.dropdownItemText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <Text style={styles.label}>Валюта</Text>
            <View style={[styles.dropdownWrap, styles.currencyWrap]}>
              <TouchableOpacity style={styles.dropdownHeader} onPress={() => setOpenCurrency(!openCurrency)}>
                <Text style={styles.dropdownText}>{currency}</Text>
                <Ionicons name={openCurrency ? "chevron-up" : "chevron-down"} size={18} color="#6B7A8A" />
              </TouchableOpacity>
              {openCurrency && (
                <View style={styles.dropdownList}>
                  {currencies.map((c) => (
                    <TouchableOpacity key={c} style={styles.dropdownItem} onPress={() => { setCurrency(c); setOpenCurrency(false); }}>
                      <Text style={styles.dropdownItemText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.nextBtn}
            onPress={() => {
                if (!name.trim()) {
                setError('Введіть назву чеку');
                return;
                }
                setError('');
                navigation.navigate('CreateEbillStep2', { name, description, scenario, currency });
            }}
            >
              <Text style={styles.nextText}>Далі</Text>
            </TouchableOpacity>
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
input: { 
    borderWidth: 1, 
    borderColor: '#C9D6E6', 
    borderRadius: 12, 
    padding: 12, 
    color: '#0E2740', 
    marginBottom: 16 
},
label: { 
    fontSize: 14, 
    color: '#0E2740', 
    marginBottom: 6, 
    fontWeight: '600' 
},
dropdownWrap: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 20,
},
scenarioWrap: {
    zIndex: 30,
},
currencyWrap: {
    zIndex: 20,
},
dropdownHeader: {
    borderWidth: 1,
    borderColor: '#C9D6E6',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
},
dropdownText: { 
    color: '#0E2740'
},
dropdownList: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9D6E6',
    paddingVertical: 4,
    elevation: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
},
dropdownItem: { 
    paddingVertical: 12,
    paddingHorizontal: 12
},
dropdownItemText: { 
    color: '#0E2740', 
    fontSize: 15 
},
nextBtn: { 
    backgroundColor: '#3E74D6', 
    borderRadius: 16, 
    paddingVertical: 14, 
    marginTop: 10 
},
nextText: { 
    color: '#FFFFFF', 
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: '700' 
}
});

export default CreateEbillStep1;
