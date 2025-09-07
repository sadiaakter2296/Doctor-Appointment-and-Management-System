// Mock Authentication Service for offline/demo mode
class MockAuthService {
  constructor() {
    this.isOnline = false; // Set to false to always use mock
    this.users = [
      {
        id: 1,
        email: 'admin@demo.com',
        password: 'admin123',
        name: 'Admin',
        role: 'admin'
      },
      {
        id: 2,
        email: 'doctor@admin.com',
        password: 'doctor123',
        name: 'Dr. Admin',
        role: 'doctor'
      },
      {
        id: 3,
        email: 'admin@admin.com',
        password: 'Admin123',
        name: 'Admin',
        role: 'admin'
      }
    ];
  }

  async login(credentials) {
    console.log('🔄 MockAuthService: Attempting login with:', credentials.email);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user by email in predefined users
    let user = this.users.find(u => u.email === credentials.email);
    
    if (!user) {
      // If user not found in predefined list, create a dynamic user based on email
      console.log('🔄 MockAuthService: Creating dynamic user for:', credentials.email);
      
      // Extract name from email (part before @)
      const nameFromEmail = credentials.email.split('@')[0];
      const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      
      user = {
        id: Date.now(), // Use timestamp as unique ID
        email: credentials.email,
        name: capitalizedName,
        role: 'admin' // Default role for any login
      };
    } else {
      // For predefined users, check password
      if (user.password !== credentials.password) {
        console.log('❌ MockAuthService: Invalid password for predefined user');
        throw new Error('Invalid password');
      }
    }
    
    // Generate mock token
    const token = `mock-jwt-${user.id}-${Date.now()}`;
    
    const response = {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: token
      },
      message: 'Login successful'
    };
    
    console.log('✅ MockAuthService: Login successful', response);
    return response;
  }

  async register(userData) {
    console.log('🔄 MockAuthService: Attempting registration with:', userData.email);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      console.log('❌ MockAuthService: User already exists');
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = {
      id: this.users.length + 1,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: 'user'
    };
    
    this.users.push(newUser);
    
    const response = {
      success: true,
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      },
      message: 'Registration successful'
    };
    
    console.log('✅ MockAuthService: Registration successful', response);
    return response;
  }

  async logout() {
    console.log('🔄 MockAuthService: Logout');
    return {
      success: true,
      message: 'Logout successful'
    };
  }

  async getUser() {
    console.log('🔄 MockAuthService: Get user');
    // In a real app, you'd validate the token and return user data
    return {
      success: true,
      data: {
        user: {
          id: 1,
          name: 'AdminUser',
          email: 'admin@admin.com',
          role: 'admin'
        }
      }
    };
  }
}

export default new MockAuthService();
