import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profileName, setProfileName] = useState('Maurinho');
  const [profileImage, setProfileImage] = useState('https://imgs.search.brave.com/NipyceKQPtZaPfH0RF48R5LhQer1pG9rgXuw-A9vRaI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvNTAwcC8x/MD2jL3VzZXItaWNv/bi1taW5pbWFsLWRl/c2lnbi1sb2dvLXNp/bGhvdWV0dGUtbW9k/ZXJuLXZlY3Rvci01/MzI3MTA2OS5qcGc');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempName, setTempName] = useState(profileName);
  const [tempImage, setTempImage] = useState(profileImage);

  const handleSaveProfile = () => {
    setProfileName(tempName);
    setProfileImage(tempImage);
    setShowEditModal(false);
  };

  const handleLogout = () => {
    setShowSettingsModal(false);
    navigation.navigate('Login');
  };

  const handleImageChange = () => {
    // En una aplicación real, esto abriría el selector de imágenes
    // Por ahora simularemos un cambio de imagen
    setTempImage('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.currency}>
          <Feather name="dollar-sign" size={18} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.currencyText}>500</Text>
        </View>
        <View style={styles.currency}>
          <Feather name="heart" size={18} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.currencyText}>2</Text>
        </View>
      </View>

      {/* Perfil del usuario */}
      <View style={styles.profileSection}>
        <Image 
          source={{ uri: profileImage }} 
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{profileName}</Text>
        <Text style={styles.profileRank}>Rango: New York</Text>
        <Text style={styles.profileLevel}>Nível 14</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>500</Text>
            <Text style={styles.statLabel}>Monedas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Corazones</Text>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>78</Text>
            <Text style={styles.statLabel}>Días de racha</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>465</Text>
            <Text style={styles.statLabel}>Puntaje más alto</Text>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => setShowEditModal(true)}
      >
        <Text style={styles.actionButtonText}>Editar Perfil</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => setShowSettingsModal(true)}
      >
        <Text style={styles.actionButtonText}>Configuración</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Feather name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Shop')}
        >
          <Feather name="shopping-cart" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="play" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('User')}
        >
          <Feather name="user" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modal para Editar Perfil */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            
            <TouchableOpacity onPress={handleImageChange} style={styles.imageChangeButton}>
              <Image 
                source={{ uri: tempImage }} 
                style={styles.modalProfileImage}
              />
              <Text style={styles.imageChangeText}>Cambiar foto</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre"
              value={tempName}
              onChangeText={setTempName}
              placeholderTextColor="#888"
            />
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveProfile}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Configuración */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configuración</Text>
            
            <Pressable 
              style={styles.optionButton}
              onPress={() => console.log("Notificaciones")}
            >
              <Feather name="bell" size={20} color="#fff" style={styles.optionIcon} />
              <Text style={styles.optionText}>Notificaciones</Text>
              <Feather name="chevron-right" size={20} color="#888" />
            </Pressable>
            
            <Pressable 
              style={styles.optionButton}
              onPress={() => console.log("Privacidad")}
            >
              <Feather name="lock" size={20} color="#fff" style={styles.optionIcon} />
              <Text style={styles.optionText}>Privacidad</Text>
              <Feather name="chevron-right" size={20} color="#888" />
            </Pressable>
            
            <Pressable 
              style={styles.optionButton}
              onPress={() => console.log("Ayuda")}
            >
              <Feather name="help-circle" size={20} color="#fff" style={styles.optionIcon} />
              <Text style={styles.optionText}>Ayuda y Soporte</Text>
              <Feather name="chevron-right" size={20} color="#888" />
            </Pressable>
            
            <Pressable 
              style={styles.optionButton}
              onPress={handleLogout}
            >
              <Feather name="log-out" size={20} color="#ff5555" style={styles.optionIcon} />
              <Text style={[styles.optionText, {color: '#ff5555'}]}>Cerrar sesión</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.modalButton, styles.cancelButton, {marginTop: 20}]} 
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  currency: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  currencyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#7a4ef2',
    marginBottom: 15,
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileRank: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  profileLevel: {
    color: '#7a4ef2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statBox: {
    backgroundColor: '#222',
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 15,
    right: 15,
    backgroundColor: '#7a4ef2',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 20,
  },
  footerButton: {
    alignItems: 'center',
  },
  
  // Estilos para modales
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 25,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    alignSelf: 'center',
  },
  imageChangeButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageChangeText: {
    color: '#7a4ef2',
    fontWeight: 'bold',
  },
  modalInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#555',
  },
  saveButton: {
    backgroundColor: '#7a4ef2',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Estilos para opciones de configuración
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
});