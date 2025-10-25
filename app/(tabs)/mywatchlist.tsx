import { StyleSheet, Text, TouchableOpacity, View,Modal,FlatList,ScrollView} from 'react-native'
import React ,{useState,useEffect} from 'react'
import { Image } from 'expo-image'
import { useWatchlist } from '../context/WatchlistContext';


const mywatchlist = () => {

const { watchlist, removeFromWatchlist, favorites, removeFromFavorites } = useWatchlist();



const [selectedShow, setSelectedShow] = useState(null);

  const [cast, setCast] = useState([]);
  const [activeFilter, setActiveFilter] = useState("watching");




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
  const [Watching,setWatching] = useState(true);
  const [Favorites,setFavorites]= useState(false);
  const [Completed,setCompleted]= useState(false);

  const [showDetails,setshowDetails]= useState(false)

 

  const toggleFilter = (filterName) => {
  setActiveFilter(filterName);
};
  return (
    <View style={styles.container}>
     <View style={styles.header}>
      <Text style={styles.title}>My Watch List</Text>
      <Image
      source={require('../../assets/images/stats.png')}
      style={{width:30,height:30,tintColor:'blue'}}/>

     </View>

    <View style={styles.filter}>
 <TouchableOpacity
  style={[styles.btnfilter, activeFilter === "watching" && styles.activeBtn]}
  onPress={() => toggleFilter("watching")}
>
  <Text style={{ color: 'black', textAlign: 'center',fontWeight:'700' }}>Watching</Text>
</TouchableOpacity>

  <TouchableOpacity  style={[
      styles.btnfilter,
      activeFilter === "favorites" && styles.activeBtn,
    ]}
    onPress={() => toggleFilter("favorites")}>
    <Text style={{ color: 'black', textAlign: 'center',fontWeight:'700' }}>Favorites</Text>
  </TouchableOpacity>
  <TouchableOpacity style={[
      styles.btnfilter,
      activeFilter === "completed" && styles.activeBtn,
    ]}
    onPress={() => toggleFilter("completed")}>
    <Text style={{ color: 'Black', textAlign: 'center',fontWeight:'700' }}>Completed</Text>
  </TouchableOpacity>
</View>

{activeFilter === "watching" && (
 
    <View style={{
      marginTop:10,
      height:600
    }}>
  {watchlist.length === 0 ? (
    <Text style={{ color: "gray", fontSize: 16, textAlign: "center", marginTop: 40 }}>
      No shows added yet.
    </Text>
  ) : (
    <FlatList
      data={watchlist}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 15 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {/* Row 1: Image */}
          <Image
            source={{
              uri: item.image?.medium || 'https://via.placeholder.com/100x150?text=No+Image',
            }}
            style={styles.showImage}
          />

          {/* Row 2: Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.showTitle}>{item.name}</Text>
            <Text style={styles.showGenre}>
              {item.genres?.join(", ") || "No genre"}
            </Text>
            <Text style={styles.showRating}>
              ⭐ {item.rating?.average || "N/A"}
            </Text>
          </View>

          {/* Row 3: Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progress</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "60%" }]} /> 
            </View>
            <Text style={styles.progressText}>60%</Text>
          </View>

          {/* Row 4: Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity  onPress={() => {
    setSelectedShow(item);
    setshowDetails(true);
  }} >
              <Image
                source={require('../../assets/images/play-button.png')}
                style={styles.playIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => removeFromWatchlist(item.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  )}
</View>


  

)}
{activeFilter === "favorites" && (
  <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Favorites</Text>
          <Text style={styles.emptyText}>No Favorites yet.</Text>
        </View>
)}

      {activeFilter === "completed" && (
 <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>completed</Text>
          <Text style={styles.emptyText}>No Completed yet.</Text>
        </View>
)}

      {showDetails && (
  <Modal
    visible
    transparent
    animationType="slide"
    onRequestClose={() => setshowDetails(false)}
  >
    <View style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <View style={{
        width: '95%',
        height: 600,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
      }}>
        {/* Top Row: Image + Info */}
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Image
            source={{
              uri: selectedShow.image?.original || selectedShow.image?.medium || 'https://via.placeholder.com/300x450?text=No+Image'
            }}
            style={{ width: '40%', height: 200, borderRadius: 10, marginRight: 15 }}
          />
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Progress</Text>
            <Text style={{ fontSize: 14, color: '#555', marginBottom: 5 }}>Info:</Text>
            <ScrollView style={{ maxHeight: 140 }}>
              <Text style={{ fontSize: 14, color: 'lightblue', lineHeight: 20 }}>
                {selectedShow.summary?.replace(/<[^>]+>/g, '') || 'No summary available'}
              </Text>
            </ScrollView>
           
          </View>
        </View>

        {/* Cast */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Cast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {cast.map((item, index) => (
            <View key={index} style={{ alignItems: 'center', marginRight: 10 }}>
              <Image
                source={{ uri: item.person.image?.medium || 'https://via.placeholder.com/80x100?text=No+Image' }}
                style={{ width: 80, height: 100, borderRadius: 8 }}
              />
              <Text style={{ fontSize: 12, color: '#000', marginTop: 5, textAlign: 'center' }}>
                {item.person.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Genre + Rating */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontSize: 14, color: '#555' }}>Genre:</Text>
          <Text style={{ fontSize: 14, color: '#555' }}>Rating:</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: 'lightblue' }}>
            {selectedShow.genres?.join(', ') || 'No genres'}
          </Text>
          <Text style={{ fontSize: 16, color: 'gold', fontWeight: 'bold' }}>
            ⭐ {selectedShow.rating?.average || 'N/A'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <TouchableOpacity style={{
            width: '48%',
            height: 45,
            backgroundColor: '#444',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Trailer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{
            width: '48%',
            height: 45,
            backgroundColor: '#444',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Continue Watching</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)}

    </View>
  )
}




export default mywatchlist

const styles = StyleSheet.create({

  container:{
    flex:1,
     backgroundColor:'gray'
  },
  header:{
    width:'100%',
    marginTop:30,
    flexDirection:'row',
    gap:150

  },
  title:{
    fontSize:25,
    fontWeight:'bold',
    marginLeft:20,

  },
  filter:{
    width:'90%',
    backgroundColor:'white',
    height:40,
    borderRadius:10,
    alignSelf:'center',
    marginTop:20,
    flexDirection:'row'
  },
  btnfilter:{
    width:'33.9%',
    height:40,
    borderRadius:10,
    backgroundColor:'white',
    padding:10
  },
    card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 15,
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  showImage: {
    width: 90,
    height: 120,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  showTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  showGenre: {
    color: "#bbb",
    fontSize: 12,
    marginVertical: 3,
  },
  showRating: {
    color: "gold",
    fontSize: 14,
  },
  progressContainer: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  progressLabel: {
    color: "#aaa",
    fontSize: 12,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#555",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00c853",
  },
  progressText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    width: 35,
    height: 35,
    tintColor: "white",
  },
  removeText: {
    color: "tomato",
    fontSize: 12,
    marginTop: 25,
    textAlign: "center",
  },
  activeBtn: {
  backgroundColor: '#00c853', // or any color you want for active state
},
})