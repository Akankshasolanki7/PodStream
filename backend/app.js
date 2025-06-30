const express=require('express')
const app=express();
const cookieParser=require("cookie-parser")
const userApi=require("./routes/user");
const CatApi=require("./routes/categories")
const PodcastApi=require("./routes/podcast")
const AnalyticsApi=require("./routes/analytics")
const SearchApi=require("./routes/search")
const cors=require("cors")
require("dotenv").config();
require("./conn/conn");
// Handle preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

app.use(cors({
    origin: '*', // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

// Additional CORS headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
app.use(express.json());
app.use(cookieParser())
app.use('/uploads',express.static('uploads'))
app.use("/api/v1",userApi)
app.use("/api/v1",CatApi)
app.use("/api/v1",PodcastApi)
// app.use("/api/v1/analytics",AnalyticsApi)
// app.use("/api/v1/search",SearchApi)

//all api
// For Vercel serverless deployment, export the app instead of listening
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    });
}

module.exports = app;