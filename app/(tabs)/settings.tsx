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
  const [expanded4, setExpanded4] = useState(false);
  const [apearence,setapearence]= useState(false);
  const [themes,setthemes]= useState(false)
  const [font,setfont]= useState(false);

  const { currentTheme, setCurrentTheme ,currentFont,setCurrentFont } = useSettings();
  

const toggleExpand = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpanded(!expanded);
  setExpanded2(false);
  setExpanded3(false);
   setExpanded4(false);
};

const toggleExpand2 = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpanded(false);
  setExpanded2(!expanded2);
  setExpanded3(false);
  setExpanded4(false);
};

const toggleExpand3 = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpanded(false);
  setExpanded2(false);
  setExpanded3(!expanded3);
  setExpanded4(false);
};
const toggleExpand4 = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpanded(false);
  setExpanded2(false);
  setExpanded3(false);
   setExpanded4(!expanded4);
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
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <TouchableOpacity style={{ marginRight: 40, marginTop: 10 }} onPress={sendEmail}>
          <Image
            source={require('../../assets/images/mail.png')}
            style={{ width: 30, height: 30 ,tintColor:theme.text}}
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
            <Text style={styles.setterText}>Clear Data</Text>
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
      
      {/* About App */}
      <TouchableOpacity onPress={toggleExpand4} style={styles.header}>
        <Text style={styles.accordionTitle}>About App</Text>
        <Text>{expanded4 ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded4 && (
        <View style={styles.content}>
          <Text style={styles.question}>About This App</Text>
          <Text>
            This app helps you track and watch your favorite shows. You can add shows to favorites, watch trailers, and get personalized recommendations.
          </Text>
          <Text>
            You can also report bugs or provide feedback directly through the contact section.
          </Text>
        </View>
      )}

      {/* FAQ / Guides */}
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
           To add a show to favorites, search a show and press the add button 
           on the right side of each show listed in search results. Or if you 
           found a show in trending/top rated, tap the show 
           card to see details and press the heart button to add to favorites.
          </Text>
          <Text style={styles.question}>How to Watch a Show Trailer?</Text>
          <Text>
           To watch a trailer, find a show, tap its info 
           to see details, then press 'Watch Trailer' at the bottom
            of the details card, or via the filter tab (Watching).
          </Text>
        </View>
      )}

      {/* Contact / Feedback */}
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

      {/* Privacy Policy */}
      <TouchableOpacity onPress={toggleExpand3} style={styles.header}>
        <Text style={styles.accordionTitle}>Privacy Policy</Text>
        <Text>{expanded3 ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded3 && (
        <View style={styles.content}>
          <Text style={styles.question}>Privacy & Policy</Text>
         <Text style={{
          marginBottom:20
         }}> This app was not built with the intent to infringe on any copyrights. All data managed within the app is sourced from public or legally authorized resources on the internet. </Text> 
         <Text style={{
          marginBottom:20
         }}> Users of this app acknowledge and agree to the terms of content use within the app, which include the following: </Text>
          <Text style={{
          marginBottom:20
         }}> No user data is shared with any external database or third party. All user data is stored locally on the device and can be permanently deleted by clearing the app data. </Text>
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

<View style={{
  flexDirection:'row',
  gap:80,
  marginTop:20
}}>
  <TouchableOpacity onPress={()=>setapearence(false)}>
  <Image
  source={require('../../assets/images/previous.png')}
  style={{width:20,height:20,marginLeft:20,marginTop:5, tintColor: theme.text,}}/>
</TouchableOpacity>
            <Text style={[styles.apearence, { color: theme.text }]}>Apearence</Text>
</View>
            <TouchableOpacity onPress={clearAppData}>
          <View style={{
            flexDirection:'row',
            
             width: '80%',
              backgroundColor: 'white',
               height: 50, alignSelf: 'center',
                borderRadius: 10, marginTop: 20, 
                justifyContent: 'space-between'
            
          }}>
            <Text style={{
              marginTop:10,fontSize:20,marginLeft:80,fontWeight:'bold'
            }}>Dark Mode</Text>
            <Switch
          value={darkMode}
          onValueChange={(val) => setDarkMode(val)}
          trackColor={{ false: '#767577', true: 'gray' }}
          thumbColor={darkMode ? 'blue' : '#f4f3f4'}
        />
          </View>
        </TouchableOpacity>

      

         <TouchableOpacity onPress={()=>setfont(false)}>
          <View style={styles.setter}>
            <Text style={styles.setterText}>Font Family</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity  onPress={()=>setthemes(true)}>
          <View style={styles.setter}>
            <Text style={styles.setterText}>App Themes</Text>
          </View>
        </TouchableOpacity>
      
      
          </View>
        </Modal>
      )}
      {themes && (
  <Modal
    transparent
    onRequestClose={() => {
      setthemes(false);
    }}
  >
    <View
      style={{
        width: '90%',
        height: 500,
        backgroundColor: 'gray',
        alignSelf: 'center',
        marginTop: 50,
        borderRadius: 10,
        
      }}
    >

<View style={{
  flexDirection:'row',
  gap:80,
  marginTop:20
}}>
  <TouchableOpacity onPress={()=>setthemes(false)}>
  <Image
  source={require('../../assets/images/previous.png')}
  style={{width:20,height:20,marginLeft:20,marginTop:5 ,tintColor: theme.text,}}/>
</TouchableOpacity>
            <Text style={[styles.themes, { color: theme.text }]}>Themes</Text>
</View>
      <TouchableOpacity style={styles.btnsetheme}>
        <Text style={styles.themetext}>Default theme</Text>
        <Switch
          style={styles.switchbtn}
          value={currentTheme === 'default'}
          onValueChange={() => setCurrentTheme('default')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme}>
        <Text style={styles.themetext}>Ocean theme</Text>
        <Switch
          style={{ marginLeft: 5 }}
          value={currentTheme === 'ocean'}
          onValueChange={() => setCurrentTheme('ocean')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme}>
        <Text style={styles.themetext}>Sunset theme</Text>
        <Switch
          style={{ marginLeft: 1 }}
          value={currentTheme === 'sunset'}
          onValueChange={() => setCurrentTheme('sunset')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme}>
        <Text style={styles.themetext}>Forest theme</Text>
        <Switch
          style={{ marginLeft: 8 }}
          value={currentTheme === 'forest'}
          onValueChange={() => setCurrentTheme('forest')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme}>
        <Text style={styles.themetext}>Neon theme</Text>
        <Switch
          style={{ marginLeft: 15 }}
          value={currentTheme === 'neon'}
          onValueChange={() => setCurrentTheme('neon')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme}>
        <Text style={styles.themetext}>Halloween</Text>
        <Switch
          style={{ marginLeft: 25 }}
          value={currentTheme === 'halloween'}
          onValueChange={() => setCurrentTheme('halloween')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme}>
        <Text style={styles.themetext}>Christmas</Text>
        <Switch
          style={{ marginLeft: 30 }}
          value={currentTheme === 'christmas'}
          onValueChange={() => setCurrentTheme('christmas')}
        />
      </TouchableOpacity>

    </View>
  </Modal>
)}

{font && (
  <Modal
    transparent
    onRequestClose={() => setfont(false)}
  >
    <View
      style={{
        width: '90%',
        height: 700,
        backgroundColor: 'gray',
        alignSelf: 'center',
        marginTop: 50,
        borderRadius: 10,
        padding: 20,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', gap: 80, marginTop: 20 }}>
        <TouchableOpacity onPress={() => setfont(false)}>
          <Image
            source={require('../../assets/images/previous.png')}
            style={{
              width: 20,
              height: 20,
              marginLeft: 20,
              marginTop: 5,
              tintColor: theme.text,
            }}
          />
        </TouchableOpacity>
        <Text style={[styles.themes, { color: theme.text }]}>Fonts</Text>
      </View>

      {/* Font options */}
      <TouchableOpacity style={styles.btnsetheme} onPress={() => setCurrentFont('System')}>
        <Text style={[styles.themetext, { fontFamily: 'System', color: theme.text }]}>System</Text>
        <Switch
          style={styles.switchbtn}
          value={currentFont === 'System'}
          onValueChange={() => setCurrentFont('System')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme} onPress={() => setCurrentFont('Roboto')}>
        <Text style={[styles.themetext, { fontFamily: 'Roboto', color: theme.text }]}>Roboto</Text>
        <Switch
          style={styles.switchbtn}
          value={currentFont === 'Roboto'}
          onValueChange={() => setCurrentFont('Roboto')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme} onPress={() => setCurrentFont('Montserrat')}>
        <Text style={[styles.themetext, { fontFamily: 'Montserrat', color: theme.text }]}>Montserrat</Text>
        <Switch
          style={styles.switchbtn}
          value={currentFont === 'Montserrat'}
          onValueChange={() => setCurrentFont('Montserrat')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme} onPress={() => setCurrentFont('OpenSans')}>
        <Text style={[styles.themetext, { fontFamily: 'OpenSans', color: theme.text }]}>OpenSans</Text>
        <Switch
          style={styles.switchbtn}
          value={currentFont === 'OpenSans'}
          onValueChange={() => setCurrentFont('OpenSans')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme} onPress={() => setCurrentFont('Lobster')}>
        <Text style={[styles.themetext, { fontFamily: 'Lobster', color: theme.text }]}>Lobster</Text>
        <Switch
          style={styles.switchbtn}
          value={currentFont === 'Lobster'}
          onValueChange={() => setCurrentFont('Lobster')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme} onPress={() => setCurrentFont('Oswald')}>
        <Text style={[styles.themetext, { fontFamily: 'Oswald', color: theme.text }]}>Oswald</Text>
        <Switch
          style={styles.switchbtn}
          value={currentFont === 'Oswald'}
          onValueChange={() => setCurrentFont('Oswald')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme} onPress={() => setCurrentFont('Poppins')}>
        <Text style={[styles.themetext, { fontFamily: 'Poppins', color: theme.text }]}>Poppins</Text>
        <Switch
          style={styles.switchbtn}
          value={currentFont === 'Poppins'}
          onValueChange={() => setCurrentFont('Poppins')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme} onPress={() => setCurrentFont('Lato')}>
        <Text style={[styles.themetext, { fontFamily: 'Lato', color: theme.text }]}>Lato</Text>
        <Switch
          style={styles.switchbtn}
          value={currentFont === 'Lato'}
          onValueChange={() => setCurrentFont('Lato')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme} onPress={() => setCurrentFont('Raleway')}>
        <Text style={[styles.themetext, { fontFamily: 'Raleway', color: theme.text }]}>Raleway</Text>
        <Switch
          style={styles.switchbtn}
          value={currentFont === 'Raleway'}
          onValueChange={() => setCurrentFont('Raleway')}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnsetheme} onPress={() => setCurrentFont('Ubuntu')}>
        <Text style={[styles.themetext, { fontFamily: 'Ubuntu', color: theme.text }]}>Ubuntu</Text>
        <Switch
          style={styles.switchbtn}
          value={currentFont === 'Ubuntu'}
          onValueChange={() => setCurrentFont('Ubuntu')}
        />
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
  btnsetheme:{borderRadius:10,flexDirection:'row',gap:50,marginLeft:40,width:250,height:40,backgroundColor:'white',marginTop:20},
  switchbtn:{marginTop:0,marginLeft:-4},
  themetext:{fontSize:20,marginTop:5,marginLeft:20},
  apearence:{fontSize:20,fontWeight:'bold'},
  themes:{fontSize:20,fontWeight:'bold'},
});
