import React, {
    createContext, useContext, useState, useEffect, useRef, ReactNode
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./registerForPushNotificationsAsync";
import { router } from "expo-router";

interface NotificationContextType{
    expoPushToken: string | undefined;
    notification: Notifications.Notification | null;
    error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined){
        throw new Error(
            "useNotification must be used within a NotificationProvider"
        );
    }
    return context;
}

interface NotificationProviderProps{
    children: ReactNode; 
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({children,}) => {
    const [expoPushToken, setExpoPushToken] = useState <string | undefined>('');
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [error, setError]= useState<Error | null>(null);

    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>(); 

    useEffect(() => {
        //fetch Expo Push Token
        registerForPushNotificationsAsync().then(
            (token) => setExpoPushToken(token), 
            (error) => setError(error)
        );

        //listen for notifications 
        let isMounted = true; 
    
        //This is when a notification has been delivered to app
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log("Notification received while is app running: ", notification);
            setNotification(notification);
        });

        //what is the interaction that the user did with the notification? 
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("Notification Response: ", 
                JSON.stringify(response, null, 2), 
                JSON.stringify(response.notification.request.content.data, null, 2));
            redirect(response.notification);
        })

        Notifications.getLastNotificationResponseAsync()
        .then(response => {
          if (!isMounted || !response?.notification) {
            return;
          }
          redirect(response?.notification);
        });

        return () => {
          if (notificationListener.current) 
          {
            Notifications.removeNotificationSubscription(notificationListener.current); 
          }
          
          if (responseListener.current)  
          { 
            Notifications.removeNotificationSubscription(responseListener.current); 
          } 
          isMounted = false; 
        }
      }, []);
    
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      console.log('url:', url);
      if (url) {
        router.push(url);
      }
    }
    return (
        <NotificationContext.Provider 
            value = {{expoPushToken, notification, error}}>
                {children}
        </NotificationContext.Provider>
    );
}
