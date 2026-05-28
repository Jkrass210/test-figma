export function initTabsType1(
  containerSelector = '.js-tabs-type-1',
  tabSelector = '.js-tabs-type-1-tab',
  buttonSelector = '.js-tabs-type-1-btn',
  contentSelector = '.js-tabs-type-1-info'
) {
  const containers = document.querySelectorAll(containerSelector);

  // Проверяем наличие контейнеров
  if (containers.length === 0) {
    console.warn(`Контейнеры с селектором "${containerSelector}" не найдены`);
    return;
  }

  containers.forEach(container => {
    const tabs = container.querySelectorAll(tabSelector);
    const buttons = container.querySelectorAll(buttonSelector);
    const contents = container.querySelectorAll(contentSelector);

    // Проверяем наличие всех элементов внутри контейнера
    if (tabs.length === 0 || buttons.length === 0 || contents.length === 0) {
      console.warn('Не все необходимые элементы найдены в контейнере');
      return;
    }

    // Функция закрытия всех табов
    function closeAllTabs() {
      buttons.forEach(button => button.classList.remove('active'));
      contents.forEach(content => content.classList.remove('active'));
    }

    // Функция открытия таба
    function openTab(button, content) {
      closeAllTabs();
      button.classList.add('active');
      content.classList.add('active');
    }

    // Обработчики клика на кнопки
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const content = contents[index];
        const isActive = button.classList.contains('active');

        if (isActive) {
          closeAllTabs();
        } else {
          openTab(button, content);
        }
      });
    });

    // Обработчик клавиши Esc
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeAllTabs();
      }
    });
  });
}