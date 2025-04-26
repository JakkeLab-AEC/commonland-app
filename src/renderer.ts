import './app';
import { useHomeStore } from './rendererArea/commonStatus/homeStatusModel';

// Get OS Info
window.electronSystemAPI.receiveOSInfo((callback) => {
    useHomeStore.getState().setOSName(callback.platform);
    useHomeStore.getState().setMode(callback.mode);
});