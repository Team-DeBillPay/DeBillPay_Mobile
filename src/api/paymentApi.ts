import { apiClient } from './apiClient';

export type CreatePaymentRequest = {
  ebillId: number;
  amount?: number;
};

export type PaymentResponse = {
  data: string; 
  signature: string;
  orderId?: string;
};

export type PaymentDto = {
  paymentId: number;
  amount: number;
  status: string;
  transactionDate: string;
  transactionReference: string;
  ebill: {
    ebillId: number;
    name: string;
    currency: string;
  };
};

export type LiqPayCallbackData = {
  order_id: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  transaction_id: string;
};

export const paymentApi = {
  createPayment: (request: CreatePaymentRequest): Promise<PaymentResponse> =>
    apiClient.post('/api/payments/create', request) as Promise<PaymentResponse>,

  getMyPayments: (): Promise<PaymentDto[]> =>
    apiClient.get('/api/payments/my') as Promise<PaymentDto[]>,

  getPaymentStatus: (orderId: string): Promise<any> =>
    apiClient.get(`/api/payments/status/${orderId}`) as Promise<any>,

  generateLiqPayForm: (data: string, signature: string): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f5f5f5;
          }
          .loader {
            font-size: 16px;
            color: #456DB4;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="loader">Завантаження платіжної сторінки...</div>
        <form id="liqpayForm" method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
          <input type="hidden" name="data" value="${data}" />
          <input type="hidden" name="signature" value="${signature}" />
        </form>
        <script>
          setTimeout(function() {
            document.getElementById('liqpayForm').submit();
          }, 100);
        </script>
      </body>
      </html>
    `;
  }
};