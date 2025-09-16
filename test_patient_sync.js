// Test Event System for Patient Sync
// Run this in browser console to test the event system

console.log('🔧 Testing Patient Update Event System...');

// Test 1: Check if we can dispatch and receive events
function testEventSystem() {
  console.log('\n🧪 Test 1: Basic Event System Test');
  
  // Add a test listener
  const testListener = (event) => {
    console.log('✅ Test event received:', event.detail);
  };
  
  window.addEventListener('testEvent', testListener);
  
  // Dispatch a test event
  window.dispatchEvent(new CustomEvent('testEvent', {
    detail: { message: 'Event system working!' }
  }));
  
  // Cleanup
  window.removeEventListener('testEvent', testListener);
}

// Test 2: Test patient update event specifically
function testPatientUpdateEvent() {
  console.log('\n🧪 Test 2: Patient Update Event Test');
  
  // Add listener for patientUpdated
  const patientListener = (event) => {
    console.log('🔔 patientUpdated event received:', event.detail);
  };
  
  window.addEventListener('patientUpdated', patientListener);
  
  // Simulate what PatientForm does
  window.dispatchEvent(new CustomEvent('patientUpdated', {
    detail: { 
      patient: { 
        id: 999, 
        name: 'Test Patient', 
        email: 'test@example.com' 
      } 
    }
  }));
  
  // Cleanup after 2 seconds
  setTimeout(() => {
    window.removeEventListener('patientUpdated', patientListener);
    console.log('🗑️ Test listener removed');
  }, 2000);
}

// Test 3: Check current patients in appointment form
function checkAppointmentFormPatients() {
  console.log('\n🧪 Test 3: Check Current Patients');
  
  // Try to find patient dropdown
  const patientSelects = document.querySelectorAll('select[name="patient_id"]');
  if (patientSelects.length > 0) {
    patientSelects.forEach((select, index) => {
      console.log(`📋 Patient dropdown ${index + 1} has ${select.options.length} options:`);
      Array.from(select.options).forEach(option => {
        if (option.value) console.log(`  - ${option.text} (ID: ${option.value})`);
      });
    });
  } else {
    console.log('❌ No patient dropdown found (appointment form might not be open)');
  }
}

// Test 4: Simulate adding a patient
async function simulatePatientCreation() {
  console.log('\n🧪 Test 4: Simulate Patient Creation');
  
  const testPatient = {
    name: `Test Patient ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    phone: '1234567890',
    gender: 'Male',
    date_of_birth: '1990-01-01'
  };
  
  try {
    console.log('📤 Creating test patient:', testPatient);
    
    const response = await fetch('http://localhost:8000/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPatient)
    });
    
    if (response.ok) {
      const newPatient = await response.json();
      console.log('✅ Patient created successfully:', newPatient);
      
      // Dispatch the event like PatientForm would
      window.dispatchEvent(new CustomEvent('patientUpdated', {
        detail: { patient: newPatient }
      }));
      console.log('📡 patientUpdated event dispatched');
      
      return newPatient;
    } else {
      console.error('❌ Failed to create patient:', response.status);
    }
  } catch (error) {
    console.error('❌ Error creating patient:', error);
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running all patient sync tests...\n');
  
  testEventSystem();
  testPatientUpdateEvent();
  checkAppointmentFormPatients();
  
  // Simulate patient creation after a delay
  setTimeout(() => {
    simulatePatientCreation().then(() => {
      console.log('\n✅ All tests completed!');
      console.log('💡 To verify sync: Open appointment form and check if new patient appears in dropdown');
    });
  }, 1000);
}

// Export functions for manual testing
window.patientSyncTest = {
  runAllTests,
  testEventSystem,
  testPatientUpdateEvent,
  checkAppointmentFormPatients,
  simulatePatientCreation
};

console.log('🎯 Test functions loaded! Run: patientSyncTest.runAllTests()');