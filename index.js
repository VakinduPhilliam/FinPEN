//Import all required modules
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const { resolve } = require('path'); // Import path finder
const spawn = require("child_process").spawn; // Spawn a process
const invoiceFolder = resolve('./public/invoices/'); // Identify invoices storage folder
const analyzerRoute = resolve('./routes/analyzer.py'); // Locate python app
const Queue = require('bull'); // Queuing system
const fetch = require('node-fetch'); // Data fetch feature
const { ethers } = require("ethers");
const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()
const contractAddress = '0xaa65AEf544822ba7Ce6F26Dd1627d02b258749B8';
const ABI = '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"getLatestContract","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"storeLatestContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"storedContract","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"}]'
const contract = new ethers.Contract(contractAddress, ABI, signer);


// Queue Worker
const queueWorker = new Queue('queue_worker', {
    limiter: {
        max: 5000, // Limit the queue to a maximum of 5000 jobs per 10 seconds
        duration: 10000
        },
    redis: {
        host: "127.0.0.1",
        port: "6379",
        password: ""
      }    
});

const port = 6006; // define application port

// Initialize express app
const app = express();

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload

// Application Route Endpoints
// Route for loading the front page.
app.get('/', (req, res) => {
    res.render('index.ejs', {
        title: "",
        message: ''
    });
}); 

// Route for processing uploaded image.
app.post('/upload', (req, res) => {
        
    // Capture photo from form data
    const uploadedFile = req.files.file;
        
    // Give file new name
    let image_name = uploadedFile.name;
    const fileExtension = uploadedFile.mimetype.split('/')[1];

    image_name = Math.random() + '.' + fileExtension;    // Give image new name

    // Filter invalid photo formats 
    if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg') {
        // upload the file to the /public/assets/i directory
        uploadedFile.mv(`${invoiceFolder}/${image_name}`, async (err ) => {
            if (err) {
                console.log(err)
                res.redirect('/');
            } else {

                try {
                    const response = await fetch(`http://localhost:6006/analysis?image=${image_name}`);

                    if (response.status === 200 || response.status === 201) {
                      console.log('Contract successfully analyzed and saved!');
                      res.redirect(`/`); 
                    } else {
                      console.log('Problem processing contract ...!');
                      res.redirect(`/`); 
                    }

                  } catch (e) {
                    console.log(e);
                    console.log('Problem processing contract ...!');
                    res.redirect(`/`); 
                  }
            }
        }); 

    // Prevent invalid photo formats by choosing default photo               
    } else {

        // Invalid File format. Only jpeg' and 'png' images are allowed.
        // Redirect back to home page if photo is invalid
        res.render('index.ejs', {
            title: "",
            message: ''
        });
    }

}); 

// Route for analyzing uploaded receipt data.
app.get('/analysis', async (req, res) => {

    let imageName = req.query.image; // Capture image name

    let params = {
        "image":`${imageName}`
      }

    var dataAnalyzed = await analyzeData();

    async function analyzeData (){
        // Launch python app
        const pythonProcess = spawn('py',[`${analyzerRoute}`]);

        // Pass data to app
        pythonProcess.stdin.write(JSON.stringify(params) + '\n');
        
        return new Promise((resolve,reject)=>{
            // Receive messages from python app
            pythonProcess.stdout.on("data", (data) =>{
                // Convert Python Dictionary/JSON to JavaScript Object
                resolve(data.toString());
            });
              
            // Read errors from python app
            pythonProcess.stderr.on("data", (data) =>{
                reject(data.toString());
            });
        });
    }

    // Results from data analysis
    const result = {     
        results: JSON.parse(dataAnalyzed), // Results from data analyzed
    }; 
    
    // Processing logs
    const log = { 
        logs:{    
            image: `${imageName}`,
            timestamp: new Date().toLocaleDateString(), // Timestamp of processing
        }
    }; 
    
    // Merge data output
    let saveData = {...log, ...result};

    // Save to RedisJSON
    await storage(JSON.stringify(saveData));

    // Object function to store analyzed data.
    async function storage (dataToSave) {
        
        // Add new process to queue worker
        queueWorker.add({jobData:dataToSave});

        // Function to save data to Blockchain
        async function saveToBlockchain(saveData){

            // Save data to blockchain
            try {
                const transaction = await contract.storeLatestContract();
                await transaction.wait();
                await getStoredContract();
            } catch (error) {
                console.log("Contract processing Error: ", error);
            }

        }
        
    }

    res.render('index.ejs', {
        title: "",
        message: ''
    });
});

// Route for fetching graph data.
app.get("/graph", (req, res) => {

    fs.readFile(__dirname + '/public/data/' + 'data.json', 'utf8', (err, data) => {
        res.status(200).json(JSON.parse(data));
    });

});

qWorker();

// Queue worker function
function qWorker (){
    
    queueWorker.process(async (job) => {

    // Capture data sent
    const data = job.data.jobData;

    // Read data from file        
    let dataRead = await readData('/public/data/', 'data.json');

    // Parse data to JSON                    
    let str = JSON.parse(dataRead);
    
    // Check if file has reached its storage size limit        
    if(str.length<250){
    
        // Store new data            
        str.push(JSON.parse(data));
        await writeData('/public/data/', 'data.json', str);

        } else {
    
        // File storage is full            
        console.log('File has reached storage limit ..!');
    
    }

    // Write date to file
    async function writeData(dir, file, data) {

            try { 
                return fs.writeFileSync(__dirname +  dir + file, JSON.stringify(data));
            } 
        
            catch (err) { 
                console.log('Problem writing to file.')
            }
        
    }
    
    // Read data from file
    async function readData(dir, file) {
        
            try { 
                return fs.readFileSync(__dirname  + dir + file,  'utf8');
            }
        
            catch (err) { 
                console.log('Problem fetching file.')
            }
        
    }

    });

}

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Fin PEN started successfully on Port 6006. Open your browser and go to: http://localhost:6006/`);
});

