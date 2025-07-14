import driverLocationModel from '../model/driverLocationModel.js';
import driverModel from '../model/driverModel.js';

// Driver updates their location
export const updateDriverLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy, speed, heading } = req.body;
    const driverId = req.user.id;

    // Get driver info
    const driver = await driverModel.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Get address from coordinates
    let address = '';
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      address = data.display_name || '';
    } catch (error) {
      console.error('Error getting address:', error);
    }

    // Update or create driver location
    const locationData = {
      driverId,
      driverName: driver.name,
      busNumber: driver.busNumber,
      location: { latitude, longitude, accuracy: accuracy || 0 },
      address,
      speed: speed || 0,
      heading: heading || 0,
      isOnline: true,
      lastUpdated: new Date()
    };

    const driverLocation = await driverLocationModel.findOneAndUpdate(
      { driverId },
      locationData,
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Location updated successfully',
      location: driverLocation
    });

  } catch (error) {
    console.error('Update driver location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all online drivers with their locations
export const getAllDriverLocations = async (req, res) => {
  try {
    const driverLocations = await driverLocationModel.find({
      isOnline: true,
      lastUpdated: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    }).sort({ lastUpdated: -1 });

    res.status(200).json({
      driverLocations
    });
  } catch (error) {
    console.error('Get driver locations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get specific driver location
export const getDriverLocation = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const driverLocation = await driverLocationModel.findOne({
      driverId,
      isOnline: true,
      lastUpdated: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (!driverLocation) {
      return res.status(404).json({ message: 'Driver location not found or driver is offline' });
    }

    res.status(200).json({
      driverLocation
    });
  } catch (error) {
    console.error('Get driver location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Driver goes offline
export const setDriverOffline = async (req, res) => {
  try {
    const driverId = req.user.id;

    await driverLocationModel.findOneAndUpdate(
      { driverId },
      { isOnline: false, lastUpdated: new Date() }
    );

    res.status(200).json({
      message: 'Driver set to offline'
    });
  } catch (error) {
    console.error('Set driver offline error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 