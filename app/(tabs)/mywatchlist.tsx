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
  const [activeFilter, setActiveFilter] = useState("watching");
  const [showDetails, setShowDetails] = useState(false);
  const [progressModal, setProgressModal] = useState(false);

  // Fetch seasons
  const fetchSeasons = async (id: number) => {
    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${id}/seasons`);
      const data = await res.json();
      setSeasons(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch cast
  const fetchCast = async (id: number) => {
    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${id}/cast`);
      const data = await res.json();
      setCast(data);
    } catch (error) {
      console.error(error);
      setCast([]);
    }
  };

  // Trigger when selectedShow changes
  useEffect(() => {
    if (selectedShow) {
      fetchSeasons(selectedShow.id);
      fetchCast(selectedShow.id);
    }
  }, [selectedShow]);

  const toggleFilter = (filterName: string) => setActiveFilter(filterName);

  const onSeasonPress = (season) => console.log("Selected season:", season.number);

  const openYouTubeTrailer = (query: string) => {
    const youtubeAppUrl = `youtube://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const youtubeWebUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    Linking.canOpenURL(youtubeAppUrl).then(supported => {
      if (supported) Linking.openURL(youtubeAppUrl);
      else Linking.openURL(youtubeWebUrl);
    }).catch(() => Alert.alert('Error', 'Cannot open YouTube'));
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
        {["watching", "favorites", "completed"].map((filter) => (
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
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 15 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Image
                    source={{ uri: item.image?.medium || 'https://via.placeholder.com/100x150?text=No+Image' }}
                    style={styles.showImage}
                  />
                  <View style={styles.infoContainer}>
                    <Text style={styles.showTitle}>{item.name}</Text>
                    <Text style={styles.showGenre}>{item.genres?.join(", ") || "No genre"}</Text>
                    <Text style={styles.showRating}>⭐ {item.rating?.average || "N/A"}</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: "60%" }]} />
                    </View>
                    <Text style={styles.progressText}>60%</Text>
                  </View>
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => { setSelectedShow(item); setShowDetails(true); }}>
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

      {/* Favorites */}
      {activeFilter === "favorites" && (
        <View style={styles.sectionContainer}>
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 15 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image
                  source={{ uri: item.image?.medium || 'https://via.placeholder.com/100x150?text=No+Image' }}
                  style={styles.showImage}
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.showTitle}>{item.name}</Text>
                  <Text style={styles.showGenre}>{item.genres?.join(", ") || "No genre"}</Text>
                  <Text style={styles.showRating}>⭐ {item.rating?.average || "N/A"}</Text>
                </View>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity onPress={() => removeFromFavorites(item.id)}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'red' }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* Completed */}
      {activeFilter === "completed" && (
        <View style={styles.sectionContainer}>
          <Text style={{ textAlign: 'center', marginTop: 200, fontWeight: 'bold', fontSize: 20 }}>
            No Data yet.
          </Text>
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
        <Modal transparent onRequestClose={() => setProgressModal(false)}>
          <View style={styles.progressModal}>
            <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>
              Update Watch Progress
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
              {seasons.map((season) => (
                <TouchableOpacity
                  key={season.id}
                  onPress={() => onSeasonPress(season)}
                  style={{
                    backgroundColor: 'gray',
                    width: 100,
                    height: 40,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Season {season.number}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  progressText: { color: "white", fontSize: 12, marginTop: 4 },
  actionsContainer: { width: 60, alignItems: "center", justifyContent: "center" },
  playIcon: { width: 35, height: 35, tintColor: "white" },
  removeText: { color: "tomato", fontSize: 12, marginTop: 25, textAlign: "center" },
  sectionContainer: { flex: 1, marginTop: 10 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '95%', height: 600, backgroundColor: 'white', borderRadius: 20, padding: 15 },
  modalButton: { width: '48%', height: 45, backgroundColor: '#444', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  progressModal: { width: '100%', height: 600, backgroundColor: 'white', marginTop: 100, borderRadius: 20, padding: 15 }
});
