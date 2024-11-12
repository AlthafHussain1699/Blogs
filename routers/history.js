const { Router } = require("express");
const {History} =  require("../models/VisitHistory")
const User = require("../models/user")
const moment = require('moment');

const route = Router();

route.get('/userHistory', async (req, res) => {
    try {
        const userHistory = await History.find({ userId: req.user._id })
            .populate('blogId')
            .sort({ visitedAt: -1 })
            .exec();
        const user = await User.findById(req.user._id);
        res.render('historyDetails', { userHistory: userHistory, user: req.user, historyAccess : user.history});
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
route.post("/historyControl", async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (req.body.on) {
            if (user.history === true) {
                return res.json({ nomodification: true });
            } else {
                await User.updateOne(
                    { _id: req.user._id },
                    { $set: { history: true } }
                );
                 return res.json({ on: true });
            }
        } else {
            if (user.history === false) {
                return res.json({ nomodification: true });
            } else {
                await User.updateOne(
                    { _id: req.user._id },
                    { $set: { history: false } }
                );
                 return res.json({ off: true });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while updating history status." });
    }
});

module.exports = route
