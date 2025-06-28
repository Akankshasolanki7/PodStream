const express=require('express')
const app=express();
const cookieParser=require("cookie-parser")
const userApi=require("./routes/user");
const CatApi=require("./routes/categories")
const PodcastApi=require("./routes/podcast")
const cors=require("cors")
require("dotenv").config();
require("./conn/conn");
app.use(cors(
    {
        origin:'*',

    }
))
app.use(express.json());
app.use(cookieParser())
app.use('/uploads',express.static('uploads'))
app.use("/api/v1",userApi)
app.use("/api/v1",CatApi)
app.use("/api/v1",PodcastApi)

//all api
app.listen(process.env.PORT,()=>{
    console.log(`server runnning on port:${process.env.PORT}`)
}
);