/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#FF8C00'; // Dark Orange
const tintColorDark = '#FFA500';  // Orange

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#FF8C00',
    tabIconDefault: '#FFB366', // Light Orange
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#FFA500',
    tabIconDefault: '#FFB366', // Light Orange
    tabIconSelected: tintColorDark,
  },
};

