import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

type RootStackParamList = {
  WebViewPayment: {
    data: string;
    signature: string;
    ebillId: number;
  };
  CheckDetails: {
    ebillId: number;
    paymentSuccess?: boolean;
  };
};

type WebViewPaymentRouteProp = RouteProp<RootStackParamList, 'WebViewPayment'>;

const WebViewPaymentScreen: React.FC = () => {
  const route = useRoute<WebViewPaymentRouteProp>();
  const navigation = useNavigation<any>();
  const { data, signature, ebillId } = route.params;
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (paymentCompleted) {
        navigation.goBack();
        return true;
      }
      
      Alert.alert(
        'Скасувати оплату?',
        'Ви впевнені, що хочете скасувати оплату?',
        [
          {
            text: 'Продовжити оплату',
            style: 'cancel',
          },
          {
            text: 'Скасувати',
            onPress: () => {
              navigation.goBack();
            },
            style: 'destructive',
          },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation, paymentCompleted]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setIsLoading(navState.loading);
    
    const url = navState.url.toLowerCase();
    console.log('Current URL:', url);

    if (url.includes('success') || 
        url.includes('result') || 
        url.includes('payment-success') ||
        url.includes('checkout/success') ||
        (url.includes('liqpay') && (url.includes('status=success') || url.includes('status=wait_accept')))) {

      if (!paymentCompleted) {
        setPaymentCompleted(true);
        
        setTimeout(() => {
          Alert.alert(
            'Успіх!',
            'Оплата пройшла успішно!',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [
                      { 
                        name: 'CheckDetails', 
                        params: { 
                          ebillId: ebillId,
                          paymentSuccess: true 
                        } 
                      }
                    ],
                  });
                }
              }
            ]
          );
        }, 1000);
      }
    }
    
    if (url.includes('failure') || 
        url.includes('error') || 
        url.includes('reject') ||
        url.includes('checkout/failure') ||
        (url.includes('liqpay') && url.includes('status=failure'))) {
      
      Alert.alert(
        'Помилка',
        'Оплата не пройшла. Спробуйте ще раз.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  const handleError = () => {
    Alert.alert('Помилка', 'Не вдалося завантажити платіжну сторінку');
    navigation.goBack();
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body, html {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #F6F9FF;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .container {
          width: 100%;
          max-width: 400px;
          padding: 20px;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.5s ease-out;
        }
        
        .loader {
          text-align: center;
          padding: 40px;
        }
        
        .loader-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #E6F1FF;
          border-top: 4px solid #456DB4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        .loader-text {
          color: #0E2740;
          font-size: 16px;
          fontWeight: 600;
          margin-top: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 480px) {
          .container {
            margin: 20px;
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="loader">
          <div class="loader-spinner"></div>
          <div class="loader-text">Перенаправлення на платіжну сторінку...</div>
        </div>
      </div>
      
      <form id="liqpayForm" method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
        <input type="hidden" name="data" value="${data}" />
        <input type="hidden" name="signature" value="${signature}" />
      </form>
      
      <script>
        // Автоматически отправляем форму после загрузки
        document.addEventListener('DOMContentLoaded', function() {
          setTimeout(function() {
            document.getElementById('liqpayForm').submit();
          }, 500);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleError}
        onHttpError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#456DB4" />
            <Text style={styles.loadingText}>Завантаження платіжної сторінки...</Text>
          </View>
        )}
        mixedContentMode="always"
        allowsBackForwardNavigationGestures={false}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#456DB4" />
          <Text style={styles.overlayText}>Обробка оплати...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9FF',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F9FF',
  },
  loadingText: {
    marginTop: 20,
    color: '#0E2740',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  overlayText: {
    marginTop: 20,
    color: '#456DB4',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WebViewPaymentScreen;