import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  Keyboard,
  Modal,
  FlatList,
  Linking, 
  Alert ,
 LayoutAnimation,
  Platform,
UIManager,
Share,

} from 'react-native';
import { Image } from 'expo-image';
// Only need useFocusEffect if using React Navigation/Expo Router
import { useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useWatchlist } from '../context/WatchlistContext';
import { useFavorites } from '../context/FavoritesContext';
import { useSettings } from '../context/SettingsContext';
import * as Font from 'expo-font';
import { 
  Roboto_400Regular, 
  Roboto_700Bold 
} from '@expo-google-fonts/roboto';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Lobster_400Regular } from '@expo-google-fonts/lobster';
import { OpenSans_400Regular } from '@expo-google-fonts/open-sans';

const COMPLETED_SHOWS_KEY = 'completedShows'; 
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}


export default function HomeScreen() {
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const { watchlist } = useWatchlist();
  const { addToFavorites, isFavorite } = useFavorites();
  const { theme, currentFont } = useSettings();
const [autocompleteResults, setAutocompleteResults] = useState([]);
const searchShowsAutocomplete = async (text) => {
  setQuery(text);
  if (text.trim().length < 2) { // small threshold to reduce requests
    setAutocompleteResults([]);
    return;
  }

  try {
    const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(text)}`);
    const data = await response.json();
    setAutocompleteResults(data.map(item => item.show)); // extract show objects directly
  } catch (error) {
    console.error("Error fetching autocomplete shows:", error);
    setAutocompleteResults([]);
  }
};

  const [query, setQuery] = useState('');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topRated, setTopRated] = useState([]);
  const [trending, setTrending] = useState([]);
  const [DetailsScreen,SetDetailsScreen]= useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [cast, setCast] = useState([]);
  // ✅ Single source for completed IDs
  const [completedShowsIds, setCompletedShowsIds] = useState([]); 
const [menu,showmenu]= useState(false);
const [agent,showagent]= useState(false);
const { currentFontSize, setCurrentFontSize } = useSettings();

const askAI=()=>{
  Alert.alert("feature coming soon..");
}
// --- Focus Effect for Automatic Refresh ---
// This hook reloads the completed shows every time the screen becomes visible.
useFocusEffect(
  React.useCallback(() => {
    const loadCompleted = async () => {
      try {
        const storedCompleted = await AsyncStorage.getItem(COMPLETED_SHOWS_KEY);
        if (storedCompleted) {
          setCompletedShowsIds(JSON.parse(storedCompleted)); 
        } else {
          setCompletedShowsIds([]);
        }
      } catch (e) {
        console.error('Failed to load completed shows for HomeScreen', e);
      }
    };
    loadCompleted();
    return () => {}; 
  }, [])
);

  const sendEmail = async () => {
    const subject = encodeURIComponent('Feedback for Your App');
    const body = encodeURIComponent(
      'Hello,\n\nI would like to share my feedback about the app:\n\n'
    );
    const email = 'armandodevjr258@gmail.com'; // 👈 your support email
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
    } else {
      console.log('No email app found!');
    }
  };
 const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          'Check out this amazing app! Download it here: https://mywatchlistdemo.vercel.app/',
      });
      if (result.action === Share.sharedAction) {
        console.log('App shared successfully');
      }
    } catch (error) {
      console.log('Error sharing app:', error);
    }
  };

  const handleSurpriseMe = async () => {
  try {
    const randomPage = Math.floor(Math.random() * 100);
    const res = await fetch(`https://api.tvmaze.com/shows?page=${randomPage}`);
    const data = await res.json();
    if (data.length === 0) return;
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomShow = data[randomIndex];
    setSelectedShow(randomShow); 
    SetDetailsScreen(true);
  } catch (error) {
    console.error("Error fetching surprise show:", error);
  }
};


  useEffect(() => {
  if (selectedShow) fetchCast(selectedShow.id);
}, [selectedShow]);

const fetchCast = async (id) => {
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${id}/cast`);
    const data = await res.json();
    setCast(data); 
  } catch (error) {
    console.error(error);
    setCast([]);
  }
};

  const BASE_URL = "https://api.tvmaze.com";

  // Fetch Top Rated Shows
  const fetchTopRatedShows = async () => {
    try {
      const res = await fetch(`${BASE_URL}/shows?page=1`);
      const data = await res.json();
      return data
        .filter(show => show.rating.average) 
        .sort((a, b) => b.rating.average - a.rating.average)
        .slice(0, 20);
    } catch (error) {
      console.error("Error fetching top rated:", error);
      return [];
    }
  };

  // Fetch Trending Shows
  const fetchTrendingShows = async () => {
    try {
      const res = await fetch(`${BASE_URL}/shows?page=1`);
      const data = await res.json();
      return data
        .sort((a, b) => (b.weight || 0) - (a.weight || 0))
        .slice(0, 20);
    } catch (error) {
      console.error("Error fetching trending shows:", error);
      return [];
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    const rated = await fetchTopRatedShows();
    const trend = await fetchTrendingShows();
    setTopRated(rated);
    setTrending(trend);
  };

  const searchShows = async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setShows([]);
    try {
      const response = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
      const data = await response.json();
      setShows(data);
    } catch (error) {
      console.error("Error fetching shows:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setQuery('');
    setShows([]);
  };

// Helper function to render a show card with image + name
const renderShowCard = (show, onPress) => (
  <TouchableOpacity
    key={show.id}
    style={{ marginHorizontal: 10 }}
    onPress={() => onPress(show)}
  >
    <Image
      source={{ uri: show.image?.medium || "https://via.placeholder.com/150x200?text=No+Image" }}
      style={{ width: 120, height: 120, borderRadius: 10 }}
resizeMode='stretch'
    />
    <Text
      style={{
        color: "white",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 5,
        textAlign: "center",
        width: 120,
      }}
      numberOfLines={1}
    >
      {show.name}
    </Text>
  </TouchableOpacity>
);


const onTopRatedPress = (show) => {
  setSelectedShow(show); 
  SetDetailsScreen(true);
};

const onTrendingPress = (show) => {
setSelectedShow(show); 
  SetDetailsScreen(true);
};


const openYouTubeTrailer = (query) => {
  const youtubeAppUrl = `youtube://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const youtubeWebUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  Linking.canOpenURL(youtubeAppUrl).then((supported) => {
    if (supported) {
      Linking.openURL(youtubeAppUrl);
    } else {
      Linking.openURL(youtubeWebUrl); 
    }
  }).catch(err => Alert.alert('Error', 'Cannot open YouTube'));
};

// ✅ The core logic: filters out shows whose IDs are in the completedShowsIds array
const currentlyWatching = watchlist.filter(show => !completedShowsIds.includes(show.id));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}> 
        <View style={{
          display:'flex',
          width:'100%',
          flexDirection:'row',
          justifyContent:'space-between'
        }}> <Text  style={[styles.title, { fontFamily: currentFont, color: theme.text ,fontSize: currentFontSize,}]}>My Watch List</Text>


<TouchableOpacity style={{
  width:100,
  height:30,
  backgroundColor: '#4B7BE5',
  
  
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
   
    marginTop:5}} onPress={askAI}>
  <Text style={{
   color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }}>Ask AI</Text>
</TouchableOpacity>

   {menu ? (
        // When menu = true → show CLOSE button
        <TouchableOpacity onPress={() => {
          showmenu(false);
          console.log('Close menu pressed');
          // add your close action here
        }}>
          <Image
            source={require('../../assets/images/down.png')}
           style={{
              width: 25,
              height: 25,
              marginRight: 40,
              
              tintColor: theme.text,
            }}
          />
        </TouchableOpacity>
      ) : (
        // When menu = false → show OPEN button
        <TouchableOpacity onPress={() => {
          showmenu(true);
          console.log('Open menu pressed');
          // add your open action here
        }}>
          <Image
            source={require('../../assets/images/previous.png')}
            style={{
              width: 25,
              height: 25,
              marginRight: 40,
             marginTop:5,
              tintColor: theme.text,
            }}
          />
        </TouchableOpacity>
      )}</View>
       <View style={[styles.searchBox, { borderColor: theme.text }]}>
          <TextInput
            style={styles.searchinput}
            placeholder='Search TV Shows...'
            value={query}
            onChangeText={searchShowsAutocomplete}
            placeholderTextColor="#777"
            onSubmitEditing={searchShows} 
          />



          <TouchableOpacity style={styles.searchButton} onPress={searchShows}>
            <Image
            source={require('../../assets/images/search.png')}
            style={{width:30,height:30,tintColor:theme.text}}/>
          </TouchableOpacity>
        </View>
      </View>

      {loading && <ActivityIndicator color="white" size="large" style={{ marginTop: 20 }} />}

     
{/* Search Results */}
{!loading && shows.length > 0 && (
  <>
    <View style={styles.resultsHeader}>
      <Text style={[styles.searchresults, { color: theme.text }]}>Search Results</Text>
      <TouchableOpacity onPress={clearResults}>
        <Text style={styles.clearText}>Clear</Text>
      </TouchableOpacity>
    </View>

    <ScrollView showsVerticalScrollIndicator={false} style={styles.resultsScroll}>
      {shows.map((item, index) => {
        const show = item.show;
        return (
          <View key={show.id || index} style={styles.showCard}>
            {/* Image + Info */}
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <Image
                source={{ uri: show.image?.medium || 'https://via.placeholder.com/150x200?text=No+Image' }}
                style={styles.showImage}
              />
              <View style={styles.showInfo}>
                <Text style={styles.showTitle}>{show.name}</Text>
                <Text style={styles.showRating}>
                  ⭐ {show.rating?.average ? show.rating.average : 'N/A'}
                </Text>
                <Text style={styles.showGenre}>
                  {show.genres?.slice(0, 2).join(', ') || 'No Genre'}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonColumn}>
              {/* Add to Watchlist */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (!isInWatchlist(show.id)) {
                    addToWatchlist(show);
                    alert(`${show.name} added to Watchlist ✅`);
                  } else {
                    alert(`${show.name} already added to Watchlist ✅`);
                  }
                }}
              >
                <Image 
                  source={require('../../assets/images/add.png')}
                  style={styles.addIcon}
                />
              </TouchableOpacity>

              {/* Info Button */}
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => {
                  setSelectedShow(show);
                  SetDetailsScreen(true);
                }}
              >
                <Image 
                  source={require('../../assets/images/info.png')}
                  style={styles.addIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  </>
)}




      {/* Default content */}
    {!loading && shows.length === 0 && (
  <ScrollView showsVerticalScrollIndicator={false}>
    <View style={{
      flexDirection:'row',
      justifyContent:'space-between',
    
    }}>
      <Text style={[styles.somethingnew, { color: theme.text }]}>Something new?</Text> 
      <TouchableOpacity 
style={{flexDirection:'row',marginRight:40,
  marginTop:15
}}
  onPress={handleSurpriseMe}
><Image
source={require('../../assets/images/casino.png')}
style={{width:25,height:25}}/>
  <Text style={[styles.suprisebtn, { color: theme.text }]}> Surprise Me</Text>
</TouchableOpacity>
</View>
    
  <View style={{ marginTop: 10, marginBottom: 10 }}>
      <Text style={[styles.currentlywatching, { color: theme.text ,fontSize: currentFontSize,}]}>
        🎬  Currently Watching
      </Text>

      {currentlyWatching.length === 0 ? (
        <Text style={{ color: "gray", fontSize: 16, textAlign: "center", marginTop: 20 }}>
          No shows currently watching.
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: -10 }}>
          {currentlyWatching.map((item) => (
            <TouchableOpacity key={item.id} style={{ marginHorizontal: 10 }}>
              <Image
                source={{ uri: item.image?.medium || "https://via.placeholder.com/150x200?text=No+Image" }}
                style={{ width: 120, height: 120, borderRadius: 10 }}
resizeMode='stretch'
              />
               <Text
      style={{
        color: "white",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 5,
        textAlign: "center",
        width: 120,
      }}
      numberOfLines={1}
    >
      {item.name}
    </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>

    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginLeft: 20 }}>
      <Image
        source={require("../../assets/images/popular.png")}
        style={{ width: 30, height: 30, marginRight: 10 }}
      />
      
      
      <Text style={[styles.topratedshows, { color: theme.text,fontSize: currentFontSize, }]}>
        Top Rated Shows
      </Text>
    </View>
    
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {topRated.map(show => renderShowCard(show, onTopRatedPress))}
      
    </ScrollView>


    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginLeft: 20 }}>
      <Image
        source={require("../../assets/images/trend.png")}
        style={{ width: 30, height: 30, marginRight: 10 }}
      />
      <Text style={[styles.trendingsshows, { color: theme.text,fontSize: currentFontSize, }]}>
        Trending Shows
      </Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {trending.map(show => renderShowCard(show, onTrendingPress))}
    </ScrollView>
   
  </ScrollView>
  
)}


      
{DetailsScreen && selectedShow && (
  <Modal
    visible
    animationType="slide"
    onRequestClose={() => SetDetailsScreen(false)}
  >
    <View style={{ flex: 1, backgroundColor: 'gray', padding: 20 }}>
      
      {/* Top Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => {
            if (!isFavorite(selectedShow.id)) {
              addToFavorites(selectedShow);
              alert(`${selectedShow.name} added to Favorites ✅`);
            } else {
              alert(`${selectedShow.name} is already in Favorites ✅`);
            }
          }}
        >
          <Image
            source={require('../../assets/images/heart.png')}
            style={{ width: 20, height: 20, tintColor: 'white',marginTop:10}}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => SetDetailsScreen(false)}>
          <Image
            source={require('../../assets/images/previous.png')}
            style={{ width: 20, height: 20, tintColor: 'white' }}
          />
        </TouchableOpacity>
      </View>

      {/* Image + Summary Side by Side */}
      <View style={{ flexDirection: 'row', marginBottom: 15,marginTop:10 }}>
        {/* Show Image */}
        <Image
          source={{
            uri: selectedShow.image?.original || selectedShow.image?.medium || 'https://via.placeholder.com/300x450?text=No+Image',
          }}
          style={{ width: '40%', height: 200, borderRadius: 10, marginRight: 15 }}
          resizeMode="contain"
        />

        {/* Info + Summary */}
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'blue', marginBottom: 5 }}>
            {selectedShow.name}
          </Text>

          <Text style={{ fontSize: 16, color: 'gold', marginBottom: 5 }}>
            ⭐ {selectedShow.rating?.average || 'N/A'}
          </Text>

          <Text style={{ fontSize: 14, color: 'lightblue', marginBottom: 5 }}>
            {selectedShow.genres?.join(', ') || 'No genres'}
          </Text>

          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Summary:</Text>
          <ScrollView style={{ maxHeight: 140 }}>
            <Text style={{ fontSize: 14, color: 'lightblue', lineHeight: 20 }}>
              {selectedShow.summary?.replace(/<[^>]+>/g, '') || 'No summary available'}
            </Text>
          </ScrollView>
        </View>
      </View>

      {/* Cast */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 10 }}>🎭 Cast:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
        {cast.map((item, index) => (
          <View key={index} style={{ alignItems: 'center', marginRight: 10 }}>
            <Image
              source={{ uri: item.person.image?.medium || 'https://via.placeholder.com/80x100?text=No+Image' }}
              style={{ width: 80, height: 100, borderRadius: 8 }}
            />
           <Text style={{
  fontSize: 13,
  color: '#333',
  marginTop: 6,
  textAlign: 'center',
  fontWeight: '500',
}}>
  {item.person.name}{"\n"}
  <Text style={{ fontSize: 12, color: 'white' }}>
    as {item.character?.name || 'Unknown'}
  </Text>
</Text>

          </View>
        ))}
      </ScrollView>

      {/* Buttons */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          style={styles.btna}
          onPress={() => openYouTubeTrailer(selectedShow.name + " trailer")}
        >
          <Text style={{ textAlign: 'center' }}>Watch Trailer</Text>
          <Image
            source={require('../../assets/images/travel.png')}
            style={{ width: 20, height: 20, marginBottom: 20, marginLeft: 20 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btna}
          onPress={() => {
            if (!isInWatchlist(selectedShow.id)) {
              addToWatchlist(selectedShow);
              alert(`${selectedShow.name} added to Watchlist ✅`);
            } else {
              alert(`${selectedShow.name} already added to Watchlist ✅`);
            }
          }}
        >
          <Text style={{ textAlign: 'center' }}>Add to Watchlist</Text>
          <Image
            source={require('../../assets/images/clapperboard2.png')}
            style={{ width: 20, height: 20, marginBottom: 20, marginLeft: 15 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}

{menu && (
  <Modal transparent animationType="fade"
  onRequestClose={()=>showmenu(false)}>
    <TouchableOpacity
      style={{
        flex: 1,
        // dim background
      }}
      activeOpacity={1}
      onPress={() => showmenu(false)} // tap outside to close
    >
      <View
        style={{
          width: 180,
          height: 100,
          flexDirection: 'column',
          position: 'absolute',
          right:17,
          top: 20, 
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 10,
        }}
      >
        <TouchableOpacity style={{
          flexDirection:'row',
       
        }}   onPress={() => {
                  showmenu(false);
                  onShare(); // 👈 Trigger share when pressed
                }}>
          <Text style={{ fontSize: 15, color:theme.text, fontWeight: 'bold' }}>
            Share app
          </Text>
          <Image
          source={require('../../assets/images/share.png')}
          style={{width:20,height:20,marginLeft:40}}
          />
        </TouchableOpacity>

        <TouchableOpacity style={{
          flexDirection:'row',
            marginTop:20
        }} onPress={sendEmail}>
          <Text style={{ fontSize: 15, color:theme.text, fontWeight: 'bold' }}>
            Send feedback
          </Text>
           <Image
          source={require('../../assets/images/mail.png')}
          style={{width:20,height:20,marginLeft:10}}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
)}

{agent&&(
  <Modal>
    <TouchableOpacity>
      <View></View>
    </TouchableOpacity>
  </Modal>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'gray', },
  header:{ width:'100%', marginTop:20 },
  title:{ fontSize:25, color:'white', marginLeft:20, fontWeight:'bold' },
  searchBox:{ flexDirection:'row', alignItems:'center', backgroundColor:'white', borderRadius:10, width:'90%', height:50, marginTop:20, marginLeft:20, paddingHorizontal:10 ,borderWidth:2},
  searchinput:{ flex:1, height:'100%', fontSize:18, color:'black' },
  searchButton:{  paddingVertical:8, paddingHorizontal:10, borderRadius:8 },
  searchButtonText:{ color:'white', fontSize:18 },
  resultsHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginHorizontal:20, marginTop:20 },
  clearText:{ color:'#ff4444', fontSize:16, fontWeight:'bold' },
  t1:{ fontSize:20, color:'white', fontWeight:'600' },
  t2:{ fontSize:20, color:'white', marginTop:20, marginLeft:20, fontWeight:'600' },
  resultsScroll:{ marginTop:10, paddingHorizontal:20 },
  moviecontainer:{ position:'relative', width:100, height:100, margin:10, borderRadius:15, overflow:'hidden' },
  houseimg:{ width:'100%', height:'100%', borderRadius:15 },
  movietext:{ position:'absolute', bottom:25, left:10, color:'green', fontSize:10, fontWeight:'bold', backgroundColor:'rgba(0,0,0,0.5)', paddingHorizontal:8, paddingVertical:4, borderRadius:8 },
  movietext2:{ position:'absolute', bottom:5, left:10, color:'gold', fontSize:12, fontWeight:'bold', paddingHorizontal:8, paddingVertical:4, borderRadius:8 },
showCard: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 15,
  backgroundColor: '#333',
  borderRadius: 10,
  overflow: 'hidden',
  padding: 10,
},
showImage: {
  width: 100,
  height: 150,
  borderRadius: 8,
},
showInfo: {
  flex: 1,
  paddingLeft: 10,
  justifyContent: 'center',
},
buttonColumn: {
  display:'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginLeft: 10,
  height: 120, // match image height
},
addButton: {
  padding: 5,
  marginBottom: 10,
},
infoButton: {
  padding: 5,
},
addIcon: {
  width: 30,
  height: 30,
  tintColor:'white'
},

  showTitle:{ color:'white', fontSize:16, fontWeight:'bold', marginBottom:5 },
  showRating:{ color:'gold', fontSize:14, marginBottom:5 },
  showGenre:{ color:'#ccc', fontSize:12 },
  btna:{
    width:"50%",
    height:50,
    padding:10,
    backgroundColor:'white',
    borderRadius:10,
    flexDirection:'row'

  },
  searchresults:{},
  somethingnew:{marginLeft:20,marginTop:20},
  suprisebtn:{
    flexDirection:'row',
    marginRight:15,
   color:'white',
    fontWeight:'bold',
    fontSize:20
  },
  currentlywatching:{fontSize:25, color:'white', marginLeft:-10, fontWeight:'bold'},
  topratedshows:{fontSize:25, color:'white', fontWeight:'bold'},
  trendingsshows:{fontSize:25, color:'white', fontWeight:'bold'},
});