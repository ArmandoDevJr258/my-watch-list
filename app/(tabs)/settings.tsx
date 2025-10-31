import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  ScrollView,
  Switch
} from 'react-native';
import { Image } from 'expo-image';
import * as MailComposer from 'expo-mail-composer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsProvider } from '../context/SettingsContext';
import { useSettings } from '../context/SettingsContext';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Settings = () => {
  const [help, setHelp] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);
  const [apearence,setapearence]= useState(false);

const toggleExpand = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpanded(!expanded);
  setExpanded2(false);
  setExpanded3(false);
};

const toggleExpand2 = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpanded(false);
  setExpanded2(!expanded2);
  setExpanded3(false);
};

const toggleExpand3 = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpanded(false);
  setExpanded2(false);
  setExpanded3(!expanded3);
};


  const sendEmail = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: ['armandomabju@gmail.com'],
        subject: 'Feedback from App',
        body: 'Hello dear developer,',
      });
    } else {
      Alert.alert('Error', 'No email app found on this device.');
    }
  };

   const clearAppData = async () => {
    try {
      await AsyncStorage.clear(); // clears all AsyncStorage data
      Alert.alert("Done", "All app data has been cleared!");
    } catch (error) {
      Alert.alert("Error", "Failed to clear app data.");
      console.log(error);
    }
  };
   const { theme,darkMode, setDarkMode, appearance, setAppearance, dataSaver, setDataSaver } = useSettings();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity style={{ marginRight: 40, marginTop: 10 }} onPress={sendEmail}>
          <Image
            source={require('../../assets/images/mail.png')}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.settingView}>
        <TouchableOpacity>
          <View style={{
            flexDirection:'row',
            
             width: '80%',
              backgroundColor: 'white',
               height: 50, alignSelf: 'center',
                borderRadius: 10, marginTop: 20, 
                justifyContent: 'space-between'
            
          }}>
            <Text style={{
              marginLeft:80,
              fontSize:20,
              fontWeight:'bold',
              marginTop:10
            }}>Dark mode</Text>
             <Switch
          value={darkMode}
          onValueChange={(val) => setDarkMode(val)}
          trackColor={{ false: '#767577', true: 'gray' }}
          thumbColor={darkMode ? 'blue' : '#f4f3f4'}
        />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>setapearence(true)}>
          <View style={styles.setter}>
            <Text style={styles.setterText}>Appearance</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={clearAppData}>
          <View style={styles.setter}>
            <Text style={styles.setterText}>Data & Storage</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setHelp(true)}>
          <View style={styles.setter}>
            <Text style={styles.setterText}>Help & Support</Text>
          </View>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', marginTop: 100 }}>Version 1.0</Text>
      </View>

      {help && (
        <Modal
          animationType="slide"
          transparent={false}
          onRequestClose={() => setHelp(false)}
        >
          <ScrollView style={{ flex: 1, padding: 20 }}>
            <TouchableOpacity onPress={toggleExpand} style={styles.header}>
              <Text style={styles.accordionTitle}>FAQ / Guides</Text>
              <Text>{expanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {expanded && (
              <View style={styles.content}>
                <Text style={styles.question}>FAQ / Guides</Text>
                <Text>Find here the most asked questions about this app</Text>
                <Text style={styles.question}>How to add a Show To Favorites?</Text>
                <Text>
                  To add a show to favorites, search a show and press the add button on the right side of each show listed in search results. Or if you found a show in trending/top rated, tap the show card to see details and press the heart button to add to favorites.
                </Text>
                <Text style={styles.question}>How to Watch a Show Trailer?</Text>
                <Text>
                  To watch a trailer, find a show, tap its info to see details, then press 'Watch Trailer' at the bottom of the details card, or via the filter tab (Watching).
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={toggleExpand2} style={styles.header}>
              <Text style={styles.accordionTitle}>Contact / Feedback</Text>
              <Text>{expanded2 ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {expanded2 && (
              <View style={styles.content}>
                <Text>Email: armandodevjr258@gmail.com</Text>
                <Text>You can report bugs or give feedback here.</Text>
              </View>
            )}

            <TouchableOpacity onPress={toggleExpand3} style={styles.header}>
              <Text style={styles.accordionTitle}>Privacy Policy</Text>
              <Text>{expanded3 ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {expanded3 && (
              <View style={styles.content}>
              <Text style={styles.question}>Privacy & Policy</Text>

<Text>
  This app was not built with the intent to infringe on any copyrights. All data managed within the app is sourced from public or legally authorized resources on the internet.
</Text>

<Text>
  Users of this app acknowledge and agree to the terms of content use within the app, which include the following:
</Text>

<Text>
  No user data is shared with any external database or third party. All user data is stored locally on the device and can be permanently deleted by clearing the app data.
</Text>

              </View>
            )}
          </ScrollView>
        </Modal>
      )}
      {apearence&&(
        <Modal
        transparent
        onRequestClose={()=>setapearence(false)}>
          <View style={{
            width:'90%',
            height:400,
            marginTop:50,
            backgroundColor:'gray',
            borderRadius:10,
            alignSelf:'center'
          }}>
            <TouchableOpacity onPress={clearAppData}>
          <View style={{
            flexDirection:'row',
            
             width: '80%',
              backgroundColor: 'white',
               height: 50, alignSelf: 'center',
                borderRadius: 10, marginTop: 20, 
                justifyContent: 'space-between'
            
          }}>
            <Text style={styles.setterText}>Sound Efects</Text>
            <Switch
          value={darkMode}
          onValueChange={(val) => setDarkMode(val)}
          trackColor={{ false: '#767577', true: 'gray' }}
          thumbColor={darkMode ? 'blue' : '#f4f3f4'}
        />
          </View>
        </TouchableOpacity>

         <TouchableOpacity>
          <View style={styles.setter}>
            <Text style={styles.setterText}>Help & Support</Text>
          </View>
        </TouchableOpacity>

         <TouchableOpacity >
          <View style={styles.setter}>
            <Text style={styles.setterText}>Font Size</Text>
          </View>
        </TouchableOpacity>
      
      
          </View>
        </Modal>
      )}
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'gray' },
  header: { width: '100%', marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 25, fontWeight: 'bold', marginLeft: 20 },
  settingView: { width: '100%', marginTop: 20 },
  setter: { width: '80%', backgroundColor: 'white', height: 50, alignSelf: 'center', borderRadius: 10, marginTop: 20, justifyContent: 'center' },
  setterText: { fontSize: 20, fontWeight: 'bold', marginLeft:80, },
  content: { padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 8 },
  question: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  accordionTitle: { fontSize: 16, fontWeight: 'bold' },
});
