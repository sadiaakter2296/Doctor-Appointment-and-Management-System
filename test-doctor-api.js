const testAPI = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test basic connection
    const response = await fetch('http://localhost:8000/api/doctors', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GET Response status:', response.status);
    const getResult = await response.json();
    console.log('GET Result:', getResult);
    
    // Test POST
    const doctorData = {
      name: 'Dr. Test Doctor',
      email: 'test.doctor.unique@example.com',
      phone: '+1234567890',
      specialty: 'Cardiology',
      education: 'MBBS, MD',
      experience: 10,
      fee: 500,
      location: 'Test Hospital',
      status: 'Available',
      about: 'This is a test doctor',
      languages: ['English'],
      working_hours: {
        monday: { start: '09:00', end: '17:00' }
      }
    };
    
    console.log('Sending POST request with data:', doctorData);
    
    const postResponse = await fetch('http://localhost:8000/api/doctors', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(doctorData)
    });
    
    console.log('POST Response status:', postResponse.status);
    const postResult = await postResponse.json();
    console.log('POST Result:', postResult);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAPI();
