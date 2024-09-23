import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  StatusBar,
} from 'react-native';

const CustomModal = ({visible, onClose, onAction, action, message}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <StatusBar translucent={false} backgroundColor="rgba(0, 0, 0, 0)" />

      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.txt}>{message}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: 20,
              marginTop: 40,
            }}>
            <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
              <Text style={[styles.btnTxt,{color: '#fff'}]}>{action}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.btnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 20,
    backgroundColor: "#EEEDEB",
    borderRadius: 10,
  },
  txt: {
    color: "#000",
    fontSize: 18,
  },
  actionBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  cancelBtn: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  btnTxt: {
    color: "#000",
    fontSize: 16,
  },
});

export default CustomModal;
