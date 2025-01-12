import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';

// Check if user document exists
export const checkUserDocExists = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists();
};

// Initialize user document with default data
export const initializeUserDocument = async (userId, additionalData = {}) => {
  const userDocRef = doc(db, 'users', userId);
  const defaultUserData = {
    tasks: [],
    points: 0,
    inventory: [],
    settings: {
      theme: 'light',
      notifications: true,
      customizations: {}
    },
    categories: [
      { id: "general", name: "General" },
      { id: "work", name: "Work" },
      { id: "personal", name: "Personal" }
    ],
    createdAt: new Date().toISOString(),
    ...additionalData
  };

  await setDoc(userDocRef, defaultUserData, { merge: true });
  return defaultUserData;
};

// Fetch complete user data
export const fetchUserData = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    // If document doesn't exist, initialize it
    return await initializeUserDocument(userId);
  }
  
  return userDoc.data();
};

// User Data Operations
export const getUserData = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data() : null;
};

export const initializeUserData = async (userId, userData) => {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, {
    ...userData,
    points: 0,
    createdAt: new Date().toISOString(),
    tasks: [],
    inventory: [],
    settings: {
      theme: 'light',
      notifications: true,
      customizations: {}
    },
    categories: [
      { id: "general", name: "General" },
      { id: "work", name: "Work" },
      { id: "personal", name: "Personal" }
    ]
  }, { merge: true });  // Add merge: true to prevent overwriting existing data
};

// Tasks Operations
export const saveTasks = async (userId, tasks) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    tasks: tasks.map(task => ({
      id: task.id,
      name: task.name,
      points: task.points,
      category: task.category || 'general',
      useType: task.useType || 'Unlimited',
      frequency: task.frequency || null,
      completed: task.completed || false,
      createdAt: task.createdAt || new Date().toISOString()
    }))
  });
};

export const getTasks = async (userId) => {
  const userDoc = await getUserData(userId);
  return userDoc?.tasks || [];
};

// Categories Operations
export const saveCategories = async (userId, categories) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    categories: categories.map(category => ({
      id: category.id,
      name: category.name
    }))
  });
};

export const getCategories = async (userId) => {
  const userDoc = await getUserData(userId);
  return userDoc?.categories || [
    { id: "general", name: "General" },
    { id: "work", name: "Work" },
    { id: "personal", name: "Personal" }
  ];
};

// Shop and Inventory Operations
export const updateUserPoints = async (userId, points) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { points });
};

export const updateInventory = async (userId, inventory) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { inventory });
};

// Settings and Customization Operations
export const updateUserSettings = async (userId, settings) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { settings });
};

// Shop and Storage Operations
export const initializeShopItems = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists() || !userDoc.data().shopItems) {
    const defaultShopItems = [
      { 
        id: 1, 
        name: "1 Hour YouTube", 
        price: 100, 
        description: "1 hour of YouTube time",
        category: "entertainment"
      },
      { 
        id: 2, 
        name: "2 Hour Movie", 
        price: 200, 
        description: "2 hours of movie time",
        category: "entertainment"
      }
    ];

    await updateDoc(userDocRef, {
      shopItems: defaultShopItems
    }, { merge: true });

    return defaultShopItems;
  }

  return userDoc.data().shopItems || [];
};

export const getShopItems = async (userId) => {
  const userDoc = await getUserData(userId);
  return userDoc?.shopItems || [];
};

export const saveShopItems = async (userId, shopItems) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    shopItems: shopItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category || 'general'
    }))
  });
};

export const getStorageItems = async (userId) => {
  const userDoc = await getUserData(userId);
  return userDoc?.storageItems || [];
};

export const saveStorageItems = async (userId, storageItems) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    storageItems: storageItems.map(item => ({
      id: item.id,
      uniqueId: item.uniqueId,
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category || 'general',
      dateAcquired: item.dateAcquired,
      inUse: item.inUse
    }))
  });
};
