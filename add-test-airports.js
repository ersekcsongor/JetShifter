// add-test-airports.js - Script to add JFK and LHR airports to the database
const axios = require('axios');

const API_URL = 'http://172.20.10.2:3000/global-airports/insert';

const airports = [
  {
    iataCode: 'JFK',
    name: 'John F. Kennedy International Airport',
    countryCode: 'US',
    cityCode: 'NYC',
    timeZone: 'America/New_York',
    countryName: 'United States'
  },
  {
    iataCode: 'LHR',
    name: 'London Heathrow Airport',
    countryCode: 'GB',
    cityCode: 'LON',
    timeZone: 'Europe/London',
    countryName: 'United Kingdom'
  }
];

async function addAirports() {
  try {
    console.log('Adding airports to database...');
    const response = await axios.post(API_URL, airports);
    console.log('✅ Success!');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

addAirports();
