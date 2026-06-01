
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { SafeArea } from 'capacitor-plugin-safe-area';

// Force dark mode globally — Tailwind `dark:` classes need this on <html>
document.documentElement.classList.add('dark');
document.documentElement.style.colorScheme = 'dark';

async function initNative() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#0B0E14' });
    await StatusBar.setOverlaysWebView({ overlay: true });
  } catch {}
  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
    await Keyboard.setScroll({ isDisabled: false });
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
  } catch {}
  try {
    const insets = await SafeArea.getSafeAreaInsets();
    const root = document.documentElement;
    root.style.setProperty('--safe-area-top', `${insets.insets.top}px`);
    root.style.setProperty('--safe-area-bottom', `${insets.insets.bottom}px`);
    root.style.setProperty('--safe-area-left', `${insets.insets.left}px`);
    root.style.setProperty('--safe-area-right', `${insets.insets.right}px`);
  } catch {}

  Keyboard.addListener('keyboardWillShow', (info) => {
    document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
    document.body.classList.add('keyboard-open');
  });
  Keyboard.addListener('keyboardWillHide', () => {
    document.documentElement.style.setProperty('--keyboard-height', '0px');
    document.body.classList.remove('keyboard-open');
  });
}

initNative();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
