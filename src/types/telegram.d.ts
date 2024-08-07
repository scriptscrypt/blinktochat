interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: string) => void;
    notificationOccurred: (type: string) => void;
    selectionChanged: () => void;
  };
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  showPopup: (params: object) => Promise<string>;
  backgroundColor: string;
  headerColor: string;
  textColor: string;
  initDataUnsafe: object;
  colorScheme: string;
  themeParams: object;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  setHeaderColor: (color: string) => void;
  sendData: (data: string) => void;
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}