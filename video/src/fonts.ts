import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';

// Canvas text needs the faces resident before the first frame is drawn.
await Promise.all(
  ['400', '500', '700'].map(w => document.fonts.load(`${w} 64px Poppins`, 'Aa0123456789–’#')),
);
