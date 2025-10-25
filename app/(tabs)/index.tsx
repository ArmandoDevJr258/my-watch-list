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
} from 'react-native';
import { Image } from 'expo-image';
import { ExpoRouter } from 'expo-router';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topRated, setTopRated] = useState([]);
  const [trending, setTrending] = useState([]);

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
  // Example: navigate to show details
  console.log('Top Rated Show pressed:', show.name);
};

const onTrendingPress = (show) => {
  // Example: add to watchlist or show info
  console.log('Trending Show pressed:', show.name);
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
            <Text style={styles.searchButtonText}>🔍</Text>
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
          <Text style={styles.t2}>⭐ Top Rated</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
           {topRated.map(show => renderShowCard(show, onTopRatedPress))}
          </ScrollView>

          <Text style={styles.t2}>🔥 Trending Shows</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
             {trending.map(show => renderShowCard(show, onTrendingPress))}
          </ScrollView>
        </ScrollView>
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
  searchButton:{ backgroundColor:'#222', paddingVertical:8, paddingHorizontal:15, borderRadius:8 },
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
});
