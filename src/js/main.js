import { testWebP } from './module/testWebP.js';
import { test } from './module/test.js';
import { initSwiperAuto } from './module/swiper.js';

test();

initSwiperAuto();

testWebP(function (support) {
  if (support == true) {
    document.querySelector('body').classList.add('webp');
    console.log("выполнился webp")
  } else {
    document.querySelector('body').classList.add('no-webp');
  }
});