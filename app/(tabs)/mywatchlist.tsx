import { StyleSheet, Text, TouchableOpacity, View, Modal, FlatList, ScrollView, Alert, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWatchlist } from '../context/WatchlistContext';
import { useFavorites } from '../context/FavoritesContext';
import { SettingsProvider } from '../context/SettingsContext';

const WATCHED_EPISODES_KEY = 'watchedEpisodes';
const TOTAL_EPISODES_KEY = 'totalEpisodesMap';
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
const [completedShows, setCompletedShows] = useState([]);

  // --- Fetch functions (UPDATED to cache total episodes) ---
  const fetchSeasons = async (id) => {
    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${id}/seasons`);
      const data = await res.json();
      setSeasons(data);

      // Calculate and save total episodes for this show
      const total = data.reduce((sum, s) => sum + (s.episodeOrder || 0), 0);
      setTotalEpisodesMap(prev => {
        const newMap = { ...prev, [id]: total };
        AsyncStorage.setItem(TOTAL_EPISODES_KEY, JSON.stringify(newMap)).catch(console.error);
        return newMap;
      });
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
  
  // --- Async Storage Handlers ---

  // Load watched episodes and total map from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedWatched = await AsyncStorage.getItem(WATCHED_EPISODES_KEY);
        if (savedWatched) setWatchedEpisodes(JSON.parse(savedWatched));

        const savedTotal = await AsyncStorage.getItem(TOTAL_EPISODES_KEY);
        if (savedTotal) setTotalEpisodesMap(JSON.parse(savedTotal));
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);


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

  // --- Mark episode watched/unwatched (FIXED & SAVING) ---
const markEpisodeAsWatched = async (showId, episodeId) => {
  setWatchedEpisodes(prev => {
    const showWatched = prev[showId] || [];
    const isWatched = showWatched.includes(episodeId);
    const updated = isWatched
      ? showWatched.filter(id => id !== episodeId)
      : [...showWatched, episodeId];

    const newWatched = { ...prev, [showId]: updated };
    AsyncStorage.setItem(WATCHED_EPISODES_KEY, JSON.stringify(newWatched)).catch(console.error);

    // 🔥 Check completion progress
    const total = totalEpisodesMap[showId] || 0;
    const watchedCount = updated.length;

    if (total > 0 && watchedCount === total) {
      // Mark as completed if 100%
      setCompletedShows(prevCompleted => {
        if (!prevCompleted.includes(showId)) {
          const updatedCompleted = [...prevCompleted, showId];
          AsyncStorage.setItem('completedShows', JSON.stringify(updatedCompleted));
          return updatedCompleted;
        }
        return prevCompleted;
      });
    } else {
      // Remove from completed if progress drops
      setCompletedShows(prevCompleted => {
        const updatedCompleted = prevCompleted.filter(id => id !== showId);
        AsyncStorage.setItem('completedShows', JSON.stringify(updatedCompleted));
        return updatedCompleted;
      });
    }

    return newWatched;
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
              extraData={watchedEpisodes}
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
                        {progressPercent}%
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
      {activeFilter === "favorites" && (
  <View style={{ marginTop: 10, height: 600 }}>
    {favorites.length === 0 ? (   // ✅ changed from watchlist to favorites
      <Text style={{ color: "gray", fontSize: 16, textAlign: "center", marginTop: 40 }}>
        No shows added to Favorites yet.
      </Text>
    ) : (
      <FlatList
        data={favorites}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
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

            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={() => removeFromFavorites(item.id)}>
                <Text style={{
                  fontSize: 15,
                  fontWeight: 'bold',
                  color: 'red',
                  marginBottom: 10
                }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  <Modal
    transparent
    animationType="slide"
    onRequestClose={() => setProgressModal(false)}
  >
    <View style={styles.progressModalBackground}>
      <View style={styles.progressModalContainer}>
        <Text style={styles.progressModalTitle}>Update Watch Progress</Text>

        {/* Season selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 12 }}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          {seasons.map(season => (
            <TouchableOpacity
              key={season.id}
              onPress={() => onSeasonPress(season)}
              style={[
                styles.seasonButton,
                selectedSeason === season.number && styles.activeSeasonButton,
                { marginRight: 10 },
              ]}
            >
              <Text
                style={[
                  styles.seasonButtonText,
                  selectedSeason === season.number &&
                    styles.activeSeasonButtonText,
                ]}
              >
                Season {season.number}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Episode list */}
        <ScrollView
          style={{ maxHeight: 250, marginTop: 8 }}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {episodes.map(ep => {
  const isWatched = watchedEpisodes[selectedShow.id]?.includes(ep.id); // ✅ correct
  return (
    <TouchableOpacity
      key={ep.id}
      style={styles.episodeRow}
      activeOpacity={0.7}
    >
      <Text style={styles.episodeText}>
        {`E${ep.number}: ${ep.name}`}
      </Text>

      {/* Check button */}
      <TouchableOpacity
        style={[
          styles.checkButton,
          isWatched && { backgroundColor: '#4CAF50', borderRadius: 6 },
        ]}
        onPress={() => markEpisodeAsWatched(selectedShow.id, ep.id)}
      >
        <Image
          source={
            isWatched
              ? require('../../assets/images/check.png') // ✅ watched
              : require('../../assets/images/square.png') // ⬜ not watched
          }
          style={[
            styles.checkIcon,
            isWatched ,
          ]}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
})}

        </ScrollView>
      </View>
    </View>
  </Modal>
)}

    </View>
  );
};

export default MyWatchlist;

// --- Styles ---
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
  progressText: { fontSize: 25, marginTop: -10, color:'green', fontWeight:'bold' },
  actionsContainer: { width: 60, alignItems: "center", justifyContent: "center" },
  playIcon: { width: 35, height: 35, tintColor: "white" },
  removeText: { color: "tomato", fontSize: 12, marginTop: 25, textAlign: "center" },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '95%', height: 600, backgroundColor: 'white', borderRadius: 20, padding: 15 },
  modalButton: { width: '48%', height: 45, backgroundColor: '#444', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  progressModalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  progressModalContainer: { backgroundColor: '#1e1e1e', borderRadius: 16, width: '100%', padding: 20, maxHeight: '85%' },
  progressModalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  seasonButton: { backgroundColor: '#2a2a2a', borderRadius: 10, paddingVertical: 10, alignItems: 'center', width:100 },
  activeSeasonButton: { backgroundColor: '#4e8ef7' },
  seasonButtonText: { color: '#fff', fontWeight: '600' },
  activeSeasonButtonText: { color: '#fff', fontWeight: '700' },
  episodeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2b2b2b', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
  episodeText: { color: '#fff', flex: 1, fontSize: 14 },
  checkButton: { padding: 4 },
  checkIcon: { width: 18, height: 18 }
});
