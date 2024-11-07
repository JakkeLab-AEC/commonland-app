import './app';
import { useHomeStore } from './rendererArea/commonStatus/homeStatusModel';

window.electronSystemAPI.receiveOSInfo((callback) => {
    useHomeStore.getState().setOSName(callback.platform);
    useHomeStore.getState().setMode(callback.mode);
});