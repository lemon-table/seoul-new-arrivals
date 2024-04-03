let express = require("express");
let app = express();

app.listen(3008, function(){
    console.log("App is running on port 3008");
});

app.get("/", function(req, res){
    res.sendfile("index.html");
});