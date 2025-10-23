export const handleApiError = (error: any): string => {
  
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('email already exists')) {
    return 'Користувач з таким email вже існує';
  }
  
  if (errorMessage.includes('phone number already exists')) {
    return 'Користувач з таким номером телефону вже існує';
  }
  
  if (errorMessage.includes('user already exists')) {
    return 'Користувач вже існує';
  }
  
  if (errorMessage.includes('invalid email or password')) {
    return 'Невірний email або пароль';
  }
  
  if (errorMessage.includes('invalid phone number format')) {
    return 'Невірний формат номера телефону';
  }
  
  if (errorMessage.includes('password must be at least')) {
    return 'Пароль повинен містити щонайменше 6 символів';
  }
  
  if (error.message.includes('400')) {
    return 'Невірні дані. Перевірте правильність введених даних';
  }
  
  if (error.message.includes('401')) {
    return 'Неавторизований доступ';
  }
  
  if (error.message.includes('404')) {
    return 'Сервер не знайдений';
  }
  
  if (error.message.includes('500')) {
    return 'Помилка сервера';
  }
  
  if (errorMessage.includes('network request failed')) {
    return 'Помилка мережі';
  }
  
  return 'Сталася невідома помилка';
};