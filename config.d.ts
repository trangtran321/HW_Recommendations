declare module 'react-native-config' {
    export interface NativeConfig{
        FIREBASE_API_KEY : string;
        FIREBASE_AUTH_DOMAIN : string;
        FIREBASE_STORAGE_BUCKET : string;
        FIREBASE_MESSAGING_SENDER_ID : string;
        FIREBASE_APP_ID : string; 
        FIREBASE_MEASUREMENT_ID : string;
        FIREBASE_VAPID_KEY : string;
    }
    export const Config:NativeConfig;
    export default Config;
}
