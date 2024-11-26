
# ------------------------------------
1. To Run on Simulator via expo first time: 
   - in commandline: npm install -g eas-cli 
   - in commandline: eas login 
         Username/Email: helloworld2024@gmail.com
         Password: Same as gmail password 
   - in commandline: eas build:configure // you may not have to run this since it is already built 

2. To Run on Simulator afterwards: 
   - in commandline: NODE_ENV=local npx expo start 
         -- NOTE:: You will need to put the .env.local file into the helloworld directory before running this. It has our config 
   --- OR ---
   - in commandline: npx expo run:ios 
      - press 'r' every time you save and make changes to see it reflected in simulator
   
3. To build a new version of app for ios:s
   - in commandline: eas build --profile development-simulator --platform ios

4. To add a new dependency: 
   - try to find a library that is compatible with react native
   1. in commandline: install whatever package it is with 'npm' or 'yarn' 
   2. Once it's done with installagtion. 
      - in commandline: cd ios
      - in commandline: pod install 
   3. to use go back to root w/  ' cd .. '

## More info @ https://docs.expo.dev/build/setup/

 





# ------------------------------------
# ORIGINAL READ ME FROM EXPO
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



---------------