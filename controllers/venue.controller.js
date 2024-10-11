const Venue = require('../models/venue.model');

const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateVenue = async (req, res) => {
    try{
        const {name} = req.params;
        const {status} = req.body;
    
        const updatedVenue = await Venue.findOneAndUpdate(
            {name}, 
            {status},
            {new:true}
        );
    
        if (!updatedVenue) {
            return res.status(404).json({ error: 'Venue not found' });
        }
    
        res.json({ message: 'Venue updated successfully', updatedVenue });
    } 
    catch(error){
        console.error('Error updating venue:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const addVenue = async (req, res) => {
    try{
        const {name, location, capacity } = req.body;    
        if (!Array.isArray(location) || location.length !== 2) {
            return res.status(400).json({ error: 'Location must be an array of [longitude, latitude]' });
        }
    
        const newVenue = new Venue({
            name,
            location,
            capacity,
        });
    
        await newVenue.save();
        res.status(201).json({ message: 'Venue added successfully', newVenue });
    }catch (error) {
        if (error.code===11000){
            // 11000 is the MongoDB error code for duplicate key error
            return res.status(400).json({ error: 'Venue with this name already exists' });
        }
        console.error('Error adding venue:',error);
        res.status(500).json({ error:'Server error'});
    }
};


const deleteVenue = async (req, res) => {
    try {
        const {name} = req.params;
        const deletedVenue = await Venue.findOneAndDelete({name});
        if (!deletedVenue){
            return res.status(404).json({error:'Venue not found'});
        }
        res.json({message:'Venue deleted successfully',deletedVenue});
    } 
    catch(error){
        console.error('Error deleting venue:',error);
        res.status(500).json({error:'Server error'});
    }
};

const getVenueByName=async(req,res)=>{
    try{
        const {name} = req.params;
        const venue = await Venue.findOne({name});
        if (!venue){
            return res.status(404).json({error:'Venue not found'});
        }
        res.json(venue);
    } 
    catch(error){
        console.error('Error fetching venue:',error);
        res.status(500).json({error:'Server error'});
    }
};


module.exports = {
  getAllVenues,
  updateVenue,
  addVenue,
  deleteVenue,
  getVenueByName,
};
