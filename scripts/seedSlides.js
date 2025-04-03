const { Slide } = require('../models');
const fs = require('fs');
const path = require('path');

const defaultSlides = [
  {
    title: 'Happy Birthday!',
    description: 'SUN | MAY 18, 2025\n08 - 12 AM',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #FEADA6, #F5EFEF)',
    isActive: true
  },
  {
    title: 'Congratulations Graduate!',
    description: 'Create lasting memories',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #A1C4FD, #C2E9FB)',
    isActive: true
  },
  {
    title: 'Welcome to MySurprise4You',
    description: 'Make someone\'s day special',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #84FAB0, #8FD3F4)',
    isActive: true
  },
  {
    title: 'Celebrate Special Moments',
    description: 'Create unforgettable memories',
    backgroundType: 'image',
    backgroundValue: 'https://images.unsplash.com/photo-1511795409834-432f31fbc7a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    isActive: true
  }
];

async function seedSlides() {
  try {
    // Clear existing default slides
    await Slide.destroy({ where: { surpriseId: null } });
    
    // Create new default slides
    await Slide.bulkCreate(defaultSlides);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../public/uploads/slides');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    console.log('Default slides seeded successfully');
  } catch (error) {
    console.error('Error seeding slides:', error);
  }
}

// Run the seeding function
seedSlides(); 