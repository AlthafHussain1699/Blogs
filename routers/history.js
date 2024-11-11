const { Router } = require("express");
const {History} =  require("../models/VisitHistory")
const moment = require('moment');

const route = Router();

route.get('/userHistory', async (req, res) => {
    try {
        const userHistory = await History.find({ userId: req.user._id })
            .populate('blogId')
            .sort({ visitedAt: -1 })
            .exec();

        // Iterate over each history and format the visitedAt field
        userHistory.forEach(history => {
            history.visitedAt = moment(history.visitedAt).format('MMM Do YYYY, h:mm A');
        });

        res.render('historyDetails', { userHistory: userHistory, user: req.user });
    } catch (error) {
        console.error('Error fetching user history:', error);
        res.status(500).send('Error retrieving history');
    }
});


route.get('/deleteUserHistory/:id', async (req, res)=>{
    try {
        const historyId = req.params.id;
        const deletedHistory = await History.findByIdAndDelete(historyId);
        if (!deletedHistory) {
            return res.status(404).send('History entry not found');
        }
        res.json({success : true})
    } catch (error) {
        console.error('Error deleting history entry:', error);
        res.status(500).send('Internal server error');
    }
    
})
module.exports = route
