import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';



  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // Endpoint to filter an image from a public URL
  app.get("/filteredimage", async (req, res) => {
    const { image_url } = req.query;

    // 1. Validate the image_url query parameter
    if (!image_url) {
      return res.status(400).send({ message: "image_url query parameter is required" });
    }

    // Validate URL format
    try {
      new URL(image_url);
    } catch (error) {
      return res.status(400).send({ message: "image_url must be a valid URL" });
    }

    try {
      // 2. Call filterImageFromURL to filter the image
      const filteredPath = await filterImageFromURL(image_url);

      // 3. Send the resulting file in the response
      // 4. Delete the file on finish of the response
      res.sendFile(filteredPath, (err) => {
        // Clean up the temporary file after sending
        deleteLocalFiles([filteredPath]);
        if (err) {
          console.error("Error sending file:", err);
        }
      });
    } catch (error) {
      // Handle errors when image cannot be processed
      console.error("Error processing image:", error);
      return res.status(422).send({ message: "Unable to process the image. Please ensure the URL points to a valid image file." });
    }
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
