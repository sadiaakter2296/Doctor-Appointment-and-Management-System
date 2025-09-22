# Medicare Pro Home Page Components

This directory contains all the components for the Doctor Appointment Management System (Medicare Pro) home page.

## Components Overview

### 1. HomePage.jsx
The main component that orchestrates all other components. Includes smooth scrolling functionality for anchor navigation.

### 2. Navbar.jsx
- Responsive navigation with dropdown menus
- Smooth scroll effects on scroll
- Mobile-friendly hamburger menu
- Animated logo and social proof badge
- Login/Register buttons

### 3. HeroSection.jsx
- Eye-catching hero with animated elements
- Dynamic stats carousel
- Call-to-action buttons
- Feature highlights with animations
- Emergency contact information

### 4. AboutSection.jsx
- Mission, Vision, Values tabs
- Interactive feature grid
- Impact statistics
- Comprehensive about content

### 5. ServicesSection.jsx
- Interactive service cards
- Detailed service information
- Feature listings
- Service-specific call-to-actions

### 6. PreFooter.jsx
- Call-to-action section
- Quick stats highlights
- Action buttons grid
- Feature highlights
- Platform showcase

### 7. Footer.jsx
- Comprehensive site map
- Contact information
- Social media links
- Newsletter signup
- Certifications and compliance info
- Scroll to top functionality

## Design Features

- **Responsive Design**: All components are fully responsive and mobile-friendly
- **Smooth Animations**: Custom CSS animations for enhanced user experience
- **Glassmorphism Effects**: Modern glass-like UI elements
- **Gradient Backgrounds**: Beautiful gradient combinations
- **Interactive Elements**: Hover effects and dynamic content
- **Accessibility**: Proper semantic HTML and ARIA labels

## Color Scheme

- Primary: Blue gradient (#2563eb to #1d4ed8)
- Secondary: Purple accent (#7c3aed)
- Medical Theme: Various colors for different medical services
- Neutral: Gray scale for text and backgrounds

## Usage

```jsx
import { HomePage } from '../components/home';

function App() {
  return <HomePage />;
}
```

## Dependencies

- React Router for navigation
- Lucide React for icons
- Tailwind CSS for styling
- Custom animations defined in index.css