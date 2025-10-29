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
  Modal
} from 'react-native';
import { Image } from 'expo-image';
import { ExpoRouter } from 'expo-router';
import { useWatchlist } from '../context/WatchlistContext';
import { useFavorites } from '../context/FavoritesContext';
import { Linking, Alert } from 'react-native';

export default function HomeScreen() {
  const { addToWatchlist, isInWatchlist } = useWatchlist();
const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();


  const [query, setQuery] = useState('');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topRated, setTopRated] = useState([]);
  const [trending, setTrending] = useState([]);
  //details modal screen
  const [DetailsScreen,SetDetailsScreen]= useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [cast, setCast] = useState([]);

  useEffect(() => {
  if (selectedShow) fetchCast(selectedShow.id);
}, [selectedShow]);

const fetchCast = async (id) => {
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${id}/cast`);
    const data = await res.json();
    setCast(data); // store full cast array
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
        .filter(show => show.rating.average) // only rated
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

 const renderShowCard = (show, onPress) => (
  <TouchableOpacity onPress={() => onPress(show)}>
    <View key={show.id} style={styles.moviecontainer}>
      <Image
        source={{ uri: show.image?.medium || 'https://via.placeholder.com/150x200?text=No+Image' }}
        style={styles.houseimg}
      />
      <Text style={styles.movietext}>{show.name}</Text>
      <Text style={styles.movietext2}>
        ⭐ {show.rating?.average ? show.rating.average.toFixed(1) : 'N/A'}
      </Text>
    </View>
  </TouchableOpacity>
);
const onTopRatedPress = (show) => {
  setSelectedShow(show); // store the clicked show
  SetDetailsScreen(true); // open modal
};

const onTrendingPress = (show) => {
setSelectedShow(show); // store the clicked show
  SetDetailsScreen(true); // open modal
};


const openYouTubeTrailer = (query) => {
  // Construct a YouTube search URL
  const youtubeAppUrl = `youtube://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const youtubeWebUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  Linking.canOpenURL(youtubeAppUrl).then((supported) => {
    if (supported) {
      Linking.openURL(youtubeAppUrl);
    } else {
      Linking.openURL(youtubeWebUrl); // fallback to web
    }
  }).catch(err => Alert.alert('Error', 'Cannot open YouTube'));
};

  return (
    <View style={styles.container}>
      <View style={styles.header}> 
        <Text style={styles.title}>My Watch List</Text>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchinput}
            placeholder='Search TV Shows...'
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#777"
            onSubmitEditing={searchShows}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchShows}>
            <Image
            source={require('../../assets/images/search.png')}
            style={{width:30,height:30,tintColor:'black'}}/>
          </TouchableOpacity>
        </View>
      </View>

      {loading && <ActivityIndicator color="white" size="large" style={{ marginTop: 20 }} />}

      {/* Search Results */}
{!loading && shows.length > 0 && (
  <>
    <View style={styles.resultsHeader}>
      <Text style={styles.t1}>Search Results</Text>
      <TouchableOpacity onPress={clearResults}>
        <Text style={styles.clearText}>Clear</Text>
      </TouchableOpacity>
    </View>

    <ScrollView showsVerticalScrollIndicator={false} style={styles.resultsScroll}>
      {shows.map((item, index) => {
        const show = item.show;
        return (
          <View key={index} style={styles.showCard}>
            {/* Image + Info on the left */}
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

            {/* Buttons on the right in a column */}
            <View style={styles.buttonColumn}>
              <TouchableOpacity style={styles.addButton}>
                <Image 
                  source={require('../../assets/images/add.png')}
                  style={styles.addIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.infoButton}>
                <Image 
                  source={require('../../assets/images/info.png')}
                  style={styles.addIcon} // reuse size
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
            width:'100%',
            display:'flex',
            flexDirection:'row',
            gap:20,
            marginTop:10
          }}>
             <Image source={(require('../../assets/images/popular.png'))}
          style={{width:30,height:30,marginLeft:20,}}/>
          <Text style={{fontSize:20,fontWeight:"bold",color:'white'}}>Top Rated Shows</Text>
          </View>
         
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
           {topRated.map(show => renderShowCard(show, onTopRatedPress))}
          </ScrollView>

           <View style={{
            width:'100%',
            display:'flex',
            flexDirection:'row',
            gap:20,
            marginTop:10
          }}>
             <Image source={(require('../../assets/images/trend.png'))}
          style={{width:30,height:30,marginLeft:20,}}/>
          <Text style={{fontSize:20,fontWeight:"bold",color:'white'}}>Trending shows</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
             {trending.map(show => renderShowCard(show, onTrendingPress))}
          </ScrollView>
        </ScrollView>
      )}

      
        {DetailsScreen && selectedShow && (
  <Modal
    animationType="slide"
    transparent={false}
    onRequestClose={() => SetDetailsScreen(false)}
  >
    <View style={{ flex: 1, backgroundColor: 'gray', padding: 20 }}>
      <View style={{
        flexDirection:'row',
        justifyContent:'space-between'
      }}>
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
       <Image source={require('../../assets/images/heart.png')}
       style={{width:20,height:20,marginLeft:30,marginBottom:20,tintColor:'white'}}/>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => SetDetailsScreen(false)}>
       <Image source={require('../../assets/images/previous.png')}
       style={{width:20,height:20,marginRight:20,marginBottom:20,tintColor:'white'}}/>
      </TouchableOpacity></View>
      

      <Image
        source={{ uri: selectedShow.image?.original || selectedShow.image?.medium || 'https://via.placeholder.com/300x450?text=No+Image' }}
        style={{ width: '95%', height: 200, borderRadius: 10, marginBottom: 20 ,alignSelf:'center'}}
      />

<Text style={{fontSize:18,fontWeight:'bold',color:'white'}}>Show Name:</Text>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'blue', marginBottom: 10 }}>
        {selectedShow.name}
      </Text>
      <Text style={{ fontSize: 18, color: 'gold', marginBottom: 10 }}>
        ⭐ {selectedShow.rating?.average || 'N/A'}
      </Text>
      <Text style={{ fontSize: 16, color: 'lightblue', marginBottom: 10 }}>
        {selectedShow.genres?.join(', ') || 'No genres'}
      </Text>
      <Text style={{fontSize:18,fontWeight:'bold',color:'white'}}>Summary :</Text>
     <ScrollView 
  style={{ maxHeight: 120, marginVertical: 10 }} 
  contentContainerStyle={{ padding: 10 }}
>
  <Text style={{ fontSize: 16, color: 'lightblue', lineHeight: 22 }}>
    {selectedShow.summary?.replace(/<[^>]+>/g, '') || 'No summary available'}
  </Text>
</ScrollView>

      
<Text style={{ fontSize:18,fontWeight:'bold',color:'white'}}>🎭 Cast :</Text>
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {cast.map((item, index) => (
    <View key={index} style={{ alignItems: 'center', marginRight: 10 }}>
      <Image
        source={{ uri: item.person.image?.medium || 'https://via.placeholder.com/80x100?text=No+Image' }}
        style={{ width: 80, height: 100, borderRadius: 8 }}
      />
      <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
        {item.person.name}
      </Text>
    </View>
  ))}
</ScrollView>

      <View style={{
        flexDirection:'row',
        gap:10,
        marginTop:10}}>
   <TouchableOpacity style={styles.btna}
   onPress={() => openYouTubeTrailer(selectedShow.name + " trailer")}>
    <Text style={{textAlign:"center"}}>Watch Trailer</Text>
    <Image
      source={require('../../assets/images/travel.png')}
       style={{width:20,height:20,marginBottom:20,marginLeft:20}}/>
   </TouchableOpacity>
  <TouchableOpacity style={styles.btna}    onPress={() => {
    if (!isInWatchlist(selectedShow.id)) {
      addToWatchlist(selectedShow);
      alert(`${selectedShow.name} added to Watchlist ✅`);
    }else{
       alert(`${selectedShow.name} already added to Watchlist ✅`);
    }
  }}>
    <Text style={{textAlign:"center"}}>Add to Watch list</Text>
    <Image
      source={require('../../assets/images/clapperboard2.png')}
       style={{width:20,height:20,marginBottom:20,marginLeft:15}}/>
   </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}
     
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'gray', paddingBottom:50 },
  header:{ width:'100%', marginTop:20 },
  title:{ fontSize:25, color:'white', marginLeft:20, fontWeight:'bold' },
  searchBox:{ flexDirection:'row', alignItems:'center', backgroundColor:'white', borderRadius:10, width:'85%', height:50, marginTop:20, marginLeft:20, paddingHorizontal:10 },
  searchinput:{ flex:1, height:'100%', fontSize:18, color:'black' },
  searchButton:{  paddingVertical:8, paddingHorizontal:10, borderRadius:8 },
  searchButtonText:{ color:'white', fontSize:18 },
  resultsHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginHorizontal:20, marginTop:20 },
  clearText:{ color:'#ff4444', fontSize:16, fontWeight:'bold' },
  t1:{ fontSize:20, color:'white', fontWeight:'600' },
  t2:{ fontSize:20, color:'white', marginTop:20, marginLeft:20, fontWeight:'600' },
  resultsScroll:{ marginTop:10, paddingHorizontal:20 },
  moviecontainer:{ position:'relative', width:200, height:170, margin:10, borderRadius:15, overflow:'hidden' },
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

  }
});