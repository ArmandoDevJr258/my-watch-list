import { StyleSheet, Text, TouchableOpacity, View, Modal, FlatList, ScrollView, Alert, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import { useWatchlist } from '../context/WatchlistContext';
import { useFavorites } from '../context/FavoritesContext';

const MyWatchlist = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const { favorites, removeFromFavorites } = useFavorites();

  const [selectedShow, setSelectedShow] = useState(null);
  const [cast, setCast] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [activeFilter, setActiveFilter] = useState("watching");
  const [showDetails, setShowDetails] = useState(false);
  const [progressModal, setProgressModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [watchedEpisodes, setWatchedEpisodes] = useState({});
  const [totalEpisodesMap, setTotalEpisodesMap] = useState({});

  // --- Fetch functions ---
const fetchSeasons = async (id) => {
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${id}/seasons`);
    const data = await res.json();
    setSeasons(data);

    // Calculate total episodes for this show
    const total = data.reduce((sum, s) => sum + (s.episodeOrder || 0), 0);
    setTotalEpisodesMap(prev => ({ ...prev, [id]: total }));
  } catch (error) {
    console.error(error);
    setSeasons([]);
  }
};

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

  const fetchEpisodes = async (seasonId) => {
    try {
      const res = await fetch(`https://api.tvmaze.com/seasons/${seasonId}/episodes`);
      const data = await res.json();
      setEpisodes(data);
    } catch (error) {
      console.error(error);
      setEpisodes([]);
    }
  };

useEffect(() => {
  if (selectedShow) {
    fetchSeasons(selectedShow.id);
    fetchCast(selectedShow.id);
    setSelectedSeason(null);
    setEpisodes([]);
  }
}, [selectedShow]);

  const onSeasonPress = async (season) => {
    setSelectedSeason(season.number);
    fetchEpisodes(season.id);
  };

  const toggleFilter = (filterName) => setActiveFilter(filterName);

  const openYouTubeTrailer = (query) => {
    const youtubeAppUrl = `youtube://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const youtubeWebUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    Linking.canOpenURL(youtubeAppUrl).then(supported => {
      if (supported) Linking.openURL(youtubeAppUrl);
      else Linking.openURL(youtubeWebUrl);
    }).catch(() => Alert.alert('Error', 'Cannot open YouTube'));
  };

  // --- Mark episode watched/unwatched ---
  const markEpisodeAsWatched = (showId, episodeId) => {
    setWatchedEpisodes(prev => {
      const showWatched = prev[showId] || [];
      const isWatched = showWatched.includes(episodeId);
      const updated = isWatched
        ? showWatched.filter(id => id !== episodeId)
        : [...showWatched, episodeId];
      return { ...prev, [showId]: updated };
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Watch List</Text>
        <Image
          source={require('../../assets/images/stats.png')}
          style={{ width: 30, height: 30, tintColor: 'blue' }}
        />
      </View>

      {/* Filter */}
      <View style={styles.filter}>
        {["watching", "favorites", "completed"].map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.btnfilter, activeFilter === filter && styles.activeBtn]}
            onPress={() => toggleFilter(filter)}
          >
            <Text style={{ color: 'black', textAlign: 'center', fontWeight: '700' }}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Watchlist */}
      {activeFilter === "watching" && (
        <View style={{ marginTop: 10, height: 600 }}>
          {watchlist.length === 0 ? (
            <Text style={{ color: "gray", fontSize: 16, textAlign: "center", marginTop: 40 }}>
              No shows added yet.
            </Text>
          ) : (
           <FlatList
  data={watchlist}
  keyExtractor={item => item.id.toString()}
  extraData={watchedEpisodes} // re-render when watchedEpisodes changes
  contentContainerStyle={{ padding: 15 }}
  renderItem={({ item }) => {
    const totalEpisodes = totalEpisodesMap[item.id] || 0;
    const watchedCount = watchedEpisodes[item.id]?.length || 0;
    const progressPercent = totalEpisodes ? Math.round((watchedCount / totalEpisodes) * 100) : 0;

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.image?.medium || "https://via.placeholder.com/100x150?text=No+Image" }}
          style={styles.showImage}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.showTitle}>{item.name}</Text>
          <Text style={styles.showGenre}>{item.genres?.join(", ") || "No genre"}</Text>
          <Text style={styles.showRating}>⭐ {item.rating?.average || "N/A"}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {progressPercent}% ({watchedCount}/{totalEpisodes})
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={() => setSelectedShow(item) || setShowDetails(true)}>
            <Image
              source={require("../../assets/images/play-button.png")}
              style={styles.playIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeFromWatchlist(item.id)}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }}
/>

          )}
        </View>
      )}

      {/* Show Details Modal */}
      {showDetails && selectedShow && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowDetails(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                <Image
                  source={{ uri: selectedShow.image?.original || selectedShow.image?.medium || 'https://via.placeholder.com/300x450?text=No+Image' }}
                  style={{ width: '40%', height: 200, borderRadius: 10, marginRight: 15 }}
                />
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Progress</Text>
                  <Text style={{ fontSize: 14, color: 'lightgreen', marginBottom: 10 }}>
                    {watchedEpisodes[selectedShow.id]?.length || 0}/{seasons.reduce((sum,s)=>sum+(s.episodeOrder||0),0)} eps watched
                  </Text>
                  <Text style={{ fontSize: 14, color: '#555', marginBottom: 5 }}>Info:</Text>
                  <ScrollView style={{ maxHeight: 140 }}>
                    <Text style={{ fontSize: 14, color: 'lightblue', lineHeight: 20 }}>
                      {selectedShow.summary?.replace(/<[^>]+>/g, '') || 'No summary available'}
                    </Text>
                  </ScrollView>
                </View>
              </View>

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

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ fontSize: 14, color: 'lightblue' }}>
                  {selectedShow.genres?.join(', ') || 'No genres'}
                </Text>
                <Text style={{ fontSize: 16, color: 'gold', fontWeight: 'bold' }}>
                  ⭐ {selectedShow.rating?.average || 'N/A'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <TouchableOpacity style={styles.modalButton} onPress={() => openYouTubeTrailer(selectedShow.name + " trailer")}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Trailer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => setProgressModal(true)}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Update Progress</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Progress Modal */}
      {progressModal && (
        <Modal transparent animationType="slide" onRequestClose={() => setProgressModal(false)}>
          <View style={styles.progressModalBackground}>
            <View style={styles.progressModalContainer}>
              <Text style={styles.progressModalTitle}>Update Watch Progress</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }} contentContainerStyle={{ paddingHorizontal: 10 }}>
                {seasons.map(season => (
                  <TouchableOpacity
                    key={season.id}
                    onPress={() => onSeasonPress(season)}
                    style={[styles.seasonButton, selectedSeason === season.number && styles.activeSeasonButton, { marginRight: 10 }]}
                  >
                    <Text style={[styles.seasonButtonText, selectedSeason === season.number && styles.activeSeasonButtonText]}>
                      Season {season.number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView style={{ maxHeight: 250, marginTop: 8 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {episodes.map(ep => (
                  <TouchableOpacity key={ep.id} style={styles.episodeRow} activeOpacity={0.7}>
                    <Text style={styles.episodeText}>{`E${ep.number}: ${ep.name}`}</Text>
                    <TouchableOpacity style={styles.checkButton} onPress={() => markEpisodeAsWatched(selectedShow.id, ep.id)}>
                      <Image source={require('../../assets/images/check.png')} style={styles.checkIcon} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default MyWatchlist;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'gray' },
  header: { width: '100%', marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 25, fontWeight: 'bold' },
  filter: { width: '90%', backgroundColor: 'white', height: 40, borderRadius: 10, alignSelf: 'center', marginTop: 20, flexDirection: 'row' },
  btnfilter: { flex: 1, height: 40, borderRadius: 10, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  activeBtn: { backgroundColor: '#00c853' },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#222", borderRadius: 15, marginBottom: 15, padding: 10 },
  showImage: { width: 90, height: 120, borderRadius: 10 },
  infoContainer: { flex: 1, marginLeft: 10 },
  showTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
  showGenre: { color: "#bbb", fontSize: 12, marginVertical: 3 },
  showRating: { color: "gold", fontSize: 14 },
  progressContainer: { width: 70, alignItems: "center", justifyContent: "center" },
  progressLabel: { color: "#aaa", fontSize: 12 },
  progressBar: { width: "100%", height: 6, backgroundColor: "#555", borderRadius: 4, overflow: "hidden", marginTop: 5 },
  progressFill: { height: "100%", backgroundColor: "#00c853" },
  progressText: {  fontSize: 18, marginTop: -10,color:'green',fontWeight:'bold' },
  actionsContainer: { width: 60, alignItems: "center", justifyContent: "center" },
  playIcon: { width: 35, height: 35, tintColor: "white" },
  removeText: { color: "tomato", fontSize: 12, marginTop: 25, textAlign: "center" },
  sectionContainer: { flex: 1, marginTop: 10 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '95%', height: 600, backgroundColor: 'white', borderRadius: 20, padding: 15 },
  modalButton: { width: '48%', height: 45, backgroundColor: '#444', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  progressModal: { width: '100%', height: 600, backgroundColor: 'white', marginTop: 100, borderRadius: 20, padding: 15 }
  , 
 progressModalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
},

progressModalContainer: {
  backgroundColor: '#1e1e1e',
  borderRadius: 16,
  width: '100%',
  padding: 20,
  maxHeight: '85%',
},

progressModalTitle: {
  color: '#fff',
  fontSize: 20,
  fontWeight: '700',
  textAlign: 'center',
  marginBottom: 10,
},

seasonButton: {
  backgroundColor: '#2a2a2a',
  borderRadius: 10,
  paddingVertical: 10,
  alignItems: 'center',
  width:100
},

activeSeasonButton: {
  backgroundColor: '#4e8ef7',
},

seasonButtonText: {
  color: '#fff',
  fontWeight: '600',
},

activeSeasonButtonText: {
  color: '#fff',
  fontWeight: '700',
},

episodeRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#2b2b2b',
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 10,
  marginBottom: 6,
},

episodeText: {
  color: '#fff',
  flex: 1,
  fontSize: 14,
},

checkButton: {
  padding: 4,
},

checkIcon: {
  width: 18,
  height: 18,
  
},

});
