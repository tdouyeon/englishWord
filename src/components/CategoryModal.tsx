import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';

type CategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddCategory: (categoryName: string) => void;
};

const CategoryModal = ({
  visible,
  onClose,
  onAddCategory,
}: CategoryModalProps) => {
  const [categoryName, setCategoryName] = useState('');

  const handleAddCategory = () => {
    if (categoryName.trim() !== '') {
      onAddCategory(categoryName);
      setCategoryName('');
      onClose();
    } else {
      Alert.alert('한글자 이상 입력해 주세요.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>카테고리명을 입력해 주세요.</Text>

            <TextInput
              style={styles.input}
              placeholder="카테고리 이름"
              value={categoryName}
              onChangeText={setCategoryName}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleAddCategory}
                style={[styles.button, styles.saveButton]}>
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginVertical: 20,
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#FFC0CB',
    marginRight: 5,
  },
  saveButtonText: {
    color: 'black',
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: '#F1F3F5',
    flex: 1,
    marginLeft: 5,
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 18,
  },
});

export default CategoryModal;
