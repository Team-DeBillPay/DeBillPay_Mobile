import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, StyleSheet, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

type RouteParams = {
  data: string;
  signature: string;
  onSuccess?: () => void;
  onFailure?: () => void;
};

const WebViewPaymentScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const { data, signature, onSuccess, onFailure } = route.params;
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Скасувати оплату?',
        'Ви впевнені, що хочете скасувати оплату?',
        [
          {
            text: 'Продовжити',
            style: 'cancel',
          },
          {
            text: 'Скасувати',
            onPress: () => {
              navigation.goBack();
              onFailure?.();
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
  }, [navigation]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setIsLoading(navState.loading);
    
    const url = navState.url.toLowerCase();
    
    if (url.includes('success') || 
        url.includes('result') || 
        url.includes('payment-success') ||
        (url.includes('liqpay') && (url.includes('status=success') || url.includes('status=wait_accept')))) {

      setTimeout(() => {
        onSuccess?.();
        navigation.goBack();
      }, 1500);
    }
    
    if (url.includes('failure') || 
        url.includes('error') || 
        url.includes('reject') ||
        (url.includes('liqpay') && url.includes('status=failure'))) {
      
      Alert.alert('Помилка', 'Оплата не пройшла. Спробуйте ще раз.');
      onFailure?.();
      navigation.goBack();
    }
  };

  const handleError = () => {
    Alert.alert('Помилка', 'Не вдалося завантажити платіжну сторінку');
    onFailure?.();
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          animation: fadeIn 0.5s ease-out;
        }
        
        .loader {
          text-align: center;
          padding: 40px;
        }
        
        .loader-spinner {
          width: 60px;
          height: 60px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #456DB4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        .loader-text {
          color: #456DB4;
          font-size: 18px;
          font-weight: 600;
          margin-top: 20px;
        }
        
        .status-message {
          text-align: center;
          padding: 30px;
          color: #0E2740;
          font-size: 16px;
          line-height: 1.5;
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
            margin: 10px;
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="loader">
          <div class="loader-spinner"></div>
          <div class="loader-text">Підготовка платіжної сторінки...</div>
        </div>
      </div>
      
      <form id="liqpayForm" method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
        <input type="hidden" name="data" value="${data}" />
        <input type="hidden" name="signature" value="${signature}" />
      </form>
      
      <script>
        // Ждем загрузки DOM
        document.addEventListener('DOMContentLoaded', function() {
          // Показываем анимацию загрузки
          setTimeout(function() {
            // Отправляем форму
            document.getElementById('liqpayForm').submit();
          }, 800);
        });
        
        // Обработка сообщений от React Native
        window.addEventListener('message', function(event) {
          if (event.data === 'closeWebView') {
            // Закрыть WebView
            window.ReactNativeWebView.postMessage('CLOSE');
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#456DB4" />
        </View>
      )}
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
          </View>
        )}
        mixedContentMode="always"
        thirdPartyCookiesEnabled={true}
        allowUniversalAccessFromFileURLs={true}
        allowsBackForwardNavigationGestures={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
});

export default WebViewPaymentScreen;