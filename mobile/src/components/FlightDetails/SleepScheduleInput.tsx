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
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🛏️</Text>
            </View>
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
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⏰</Text>
            </View>
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
                  <Text style={[styles.modalButton, styles.doneButton]}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="time"
                  display="spinner"
                  onChange={onPickerChange}
                  style={styles.picker}
                  textColor="#000000"
                  themeVariant="light"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android Picker - keep existing implementation */}
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
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeDisplay: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3436',
  },
  iconContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
  },
  modalButton: {
    fontSize: 16,
    color: '#636e72',
    fontWeight: '500',
  },
  doneButton: {
    color: '#0984e3',
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: 'white',
  },
  picker: {
    width: '100%',
  },
});