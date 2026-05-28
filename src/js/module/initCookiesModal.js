export function initCookiesModal(options = {}) {
  const {
    containerClass = 'cookie',
    buttonClass = 'cookie__btn',
    storageKey = 'cookiesAccepted',
    expirationDays = 7
  } = options;

  // Находим элементы
  const container = document.querySelector(`.${containerClass}`);
  const button = document.querySelector(`.${buttonClass}`);
  
  // Проверяем, что элементы существуют
  if (!container || !button) {
    console.warn('Cookies modal elements not found');
    return;
  }

  // Проверяем localStorage
  const cookiesAccepted = localStorage.getItem(storageKey);
  
  if (!cookiesAccepted) {
    // Показываем модальное окно, если куки еще не принимались
    container.style.display = 'block';
  } else {
    // Проверяем срок действия
    const acceptanceData = JSON.parse(cookiesAccepted);
    const now = new Date().getTime();
    
    if (now > acceptanceData.expires) {
      // Срок истек, показываем снова
      container.style.display = 'block';
    }
  }

  // Обработчик клика на кнопку
  button.addEventListener('click', () => {
    // Скрываем модальное окно
    container.style.display = 'none';
    
    // Сохраняем в localStorage с сроком действия
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    
    const acceptanceData = {
      accepted: true,
      expires: expirationDate.getTime()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(acceptanceData));
  });
}