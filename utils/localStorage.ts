// localStorage.ts

let localStorageInstance: any = null;

if (typeof window !== 'undefined') {
  localStorageInstance = window.localStorage;
}

const localStorage = {
  getItem(key: string) {
    return localStorageInstance ? localStorageInstance.getItem(key) : null;
  },
  setItem(key: string, value: string) {
    if (localStorageInstance) {
      localStorageInstance.setItem(key, value);
    }
  },
  removeItem(key: string) {
    if (localStorageInstance) {
      localStorageInstance.removeItem(key);
    }
  },
  clear() {
    if (localStorageInstance) {
      localStorageInstance.clear();
    }
  },
};

export default localStorage;
