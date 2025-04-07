// components/FlightDetails/SleepScheduleInput.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SleepSchedule } from '~/utils/types';

type SleepScheduleInputProps = {
  schedule: SleepSchedule;
  onChange: (schedule: SleepSchedule) => void;
};

export const SleepScheduleInput = ({ schedule, onChange }: SleepScheduleInputProps) => {
  const [activePicker, setActivePicker] = useState<'bedtime' | 'wakeup' | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (field: keyof SleepSchedule, date: Date) => {
    const newTime = formatTime(date);
    onChange({ ...schedule, [field]: newTime });
  };

  const showPicker = (type: 'bedtime' | 'wakeup') => {
    setTempDate(parseTime(schedule[type === 'bedtime' ? 'bedtime' : 'wakeupTime']));
    setActivePicker(type);
  };

  const onPickerChange = (event: any, date?: Date) => {
    if (date && activePicker) {
      setTempDate(date);
      if (Platform.OS === 'android' || event.type === 'dismissed') {
        setActivePicker(null);
      }
    }
  };

  const confirmTime = () => {
    if (activePicker) {
      handleTimeChange(activePicker === 'bedtime' ? 'bedtime' : 'wakeupTime', tempDate);
    }
    setActivePicker(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Normal Sleep Schedule</Text>
      <View style={styles.inputRow}>
        {/* Bedtime Picker */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Bedtime</Text>
          <TouchableOpacity 
            style={styles.timeDisplay}
            onPress={() => showPicker('bedtime')}
          >
            <Text style={styles.timeText}>{schedule.bedtime}</Text>
          </TouchableOpacity>
        </View>

        {/* Wakeup Time Picker */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Wake Up</Text>
          <TouchableOpacity 
            style={styles.timeDisplay}
            onPress={() => showPicker('wakeup')}
          >
            <Text style={styles.timeText}>{schedule.wakeupTime}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Picker for iOS */}
      {Platform.OS === 'ios' && activePicker && (
    <Modal
        transparent={true}
        animationType="slide"
        visible={!!activePicker}
        onRequestClose={() => setActivePicker(null)}
        >
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Text style={styles.modalButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
                {activePicker === 'bedtime' ? 'Select Bedtime' : 'Select Wakeup Time'}
            </Text>
            <TouchableOpacity onPress={confirmTime}>
                <Text style={styles.modalButton}>Done</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
            <DateTimePicker
                value={tempDate}
                mode="time"
                display="spinner"
                onChange={onPickerChange}
                style={styles.picker}
                textColor="#000000" // This is crucial for iOS spinner text color
                themeVariant="light" // Ensures light mode
            />
            </View>
        </View>
        </View>
    </Modal>
      )}

      {/* Android Picker */}
      {Platform.OS === 'android' && activePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={(event, date) => {
            if (date) {
              handleTimeChange(
                activePicker === 'bedtime' ? 'bedtime' : 'wakeupTime',
                date
              );
            }
            setActivePicker(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeContainer: {
    width: '48%',
  },
  timeLabel: {
    fontSize: 14,
    color: '#00000',
    marginBottom: 4,
  },
  timeDisplay: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#000000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  picker: {
    width: '100%',
  },
  pickerItem: {
    color: '#000000', // Black text color
    fontSize: 20,     // Slightly larger font
  },
  pickerContainer: {
    backgroundColor: 'white', // Ensure white background
  },
});