const router = require('express').Router();
const User = require('../models/user');
const Podcast = require('../models/podcast');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const authMiddleware = require("../middleware/authMiddleware");
//signup-route
router.post("/sign-up",async (req,  res)=> {
    try{
        const {username,email,password}=req.body;
        if(!username || !email || !password){
            return res.status(400).json({message:'All fields are required'})
        }
        if(username.length<5){
             return res.status(400).json({message:'Username must have five characters'})
        }
        if(password.length <6){
             return res.status(400).json({message:'Password must have 6 characters'})
        }
        //check if user exist or not
        const existingEmail=await User.findOne({email: email});
        const existingUsername=await User.findOne({username: username});
        if(existingEmail || existingUsername){
             return res.status(400).json({message:'Username or Email already exist'})
        }

   // hashed password
   const salt= await bcrypt.genSalt(10);
   const hashedPass= await bcrypt.hash(password,salt);
   const newUser =new User({username,email,password:hashedPass})
   await newUser.save();
   return res.status(200).json({message:"Account created"})
    }catch(error){
      //   console.log(error);
       res.status(500).json({error});
    }
}
);
  //sign-in route
  router.post("/sign-in",async (req,res)=>{
     try{
       const {email,password}=req.body;
        if(  !email || !password){
            return res.status(400).json({message:'All fields are required'})
        }
        //check user exists
        const existingUser=await User.findOne({email: email});
          if(!existingUser){
             return res.status(400).json({message:'Invalid credentials'})
        }
     //check password is matched or not
     const isMatch=await bcrypt.compare(password,existingUser.password)  
        if(!isMatch){
             return res.status(400).json({message:'Invalid credentials'})
        }
      //Generate JWT Token
        const token=jwt.sign(
            {id: existingUser._id,email: existingUser.email},
            process.env.JWT_SECRET,
            {expiresIn:"30d"}
        );

     res.cookie("podcasterUserToken",token,{
        httpOnly:true,
        maxAge:30*24*60*60*100,
        secure:process.env.NODE_ENV=="production",
        sameSite:"None",
     })
     return res.status(200).json({
        id:existingUser._id,
        username:existingUser.username,
        email:email,
        message:'sign-in successfully'
     })
     }catch(error){
          res.status(500).json({error});
     }
  });
//Logout 
router.post("/logout",async(req,res)=>{
    res.clearCookie("podcasterUserToken",{
       httpOnly:true, 
    });
    res.json({message:"Logged-out"})
})
//check cookie is present or not
router.get("/check-cookie",async(req,res)=>{
  const token=req.cookies.podcasterUserToken;

if(token) {
  return  res.status(200).json({message:true})
}
    
   return res.json({message:false})
})

//Route to fetch user details
router.get("/user-details", authMiddleware, async (req, res) => {
    try {
        const { email } = req.user;
        const existingUser = await User.findOne({ email: email })
            .populate('podcasts', 'title frontImage createdAt views likes')
            .populate('likedPodcasts', 'title frontImage user')
            .select("-password");

        return res.status(200).json({
            user: existingUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

// Get user profile with enhanced data
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('podcasts', 'title frontImage createdAt views likes')
            .populate('likedPodcasts', 'title frontImage user')
            .populate('following', 'username profile.avatar')
            .populate('followers', 'username profile.avatar')
            .select('-password -emailVerificationToken -passwordResetToken');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate user stats
        const userStats = {
            totalPodcasts: user.podcasts.length,
            totalViews: user.totalViews || 0,
            totalLikes: user.totalLikes || 0,
            totalFollowers: user.followers.length,
            totalFollowing: user.following.length
        };

        res.status(200).json({
            user: {
                ...user.toObject(),
                stats: userStats
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: "Failed to fetch profile", error: error.message });
    }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            bio,
            website,
            location,
            dateOfBirth,
            preferences
        } = req.body;

        const updateData = {};

        if (firstName !== undefined) updateData['profile.firstName'] = firstName;
        if (lastName !== undefined) updateData['profile.lastName'] = lastName;
        if (bio !== undefined) updateData['profile.bio'] = bio;
        if (website !== undefined) updateData['profile.website'] = website;
        if (location !== undefined) updateData['profile.location'] = location;
        if (dateOfBirth !== undefined) updateData['profile.dateOfBirth'] = dateOfBirth;
        if (preferences !== undefined) updateData.preferences = { ...preferences };

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -emailVerificationToken -passwordResetToken');

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
});

// Follow/Unfollow user
router.post("/follow/:userId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        if (userId === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentUser = await User.findById(currentUserId);
        const isFollowing = currentUser.following.includes(userId);

        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: userId } });
            await User.findByIdAndUpdate(userId, { $pull: { followers: currentUserId } });
            res.status(200).json({ message: "User unfollowed", following: false });
        } else {
            // Follow
            await User.findByIdAndUpdate(currentUserId, { $push: { following: userId } });
            await User.findByIdAndUpdate(userId, { $push: { followers: currentUserId } });
            res.status(200).json({ message: "User followed", following: true });
        }
    } catch (error) {
        console.error('Follow/unfollow error:', error);
        res.status(500).json({ message: "Failed to follow/unfollow user", error: error.message });
    }
});

// Get user analytics
router.get("/analytics", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user's podcasts with analytics
        const userPodcasts = await Podcast.find({ user: userId })
            .select('title views likes comments createdAt')
            .sort({ createdAt: -1 });

        // Calculate analytics
        const totalViews = userPodcasts.reduce((sum, podcast) => sum + (podcast.views || 0), 0);
        const totalLikes = userPodcasts.reduce((sum, podcast) => sum + (podcast.likes?.length || 0), 0);
        const totalComments = userPodcasts.reduce((sum, podcast) => sum + (podcast.comments?.length || 0), 0);

        res.status(200).json({
            overview: {
                totalPodcasts: userPodcasts.length,
                totalViews,
                totalLikes,
                totalComments
            },
            recentPodcasts: userPodcasts.slice(0, 5)
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
    }
});

module.exports = router;

